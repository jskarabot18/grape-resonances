/**
 * api.js
 *
 * Talks to the Cloudflare Worker that proxies OpenAI's embeddings API.
 * The Worker is at:
 *
 *   https://region-resonances-proxy.jskarabot.workers.dev
 *
 * It expects:
 *   POST { "query": "user's text" }
 * and returns:
 *   { "embedding": [1536 floats], "usage": {...}, "model": "text-embedding-3-small" }
 *
 * Includes an in-memory cache: if the user types the same query twice
 * (e.g. clearing and re-entering, or clicking an example chip they've
 * already tried), we return the cached embedding instead of re-fetching.
 * This makes the back-and-forth feel instant and reduces rate-limit
 * pressure during testing.
 */

const WORKER_URL = 'https://region-resonances-proxy.jskarabot.workers.dev';

/**
 * In-memory query → embedding cache. Keyed by the trimmed/lowercased
 * query string so capitalization differences don't fragment the cache.
 *
 * Bounded with an LRU-style eviction (Map preserves insertion order in
 * JS, so we evict the oldest entry when we hit MAX_CACHE_SIZE). At
 * 1536 floats × 8 bytes ≈ 12KB per entry, 50 entries is ~600KB — well
 * within reasonable memory bounds for a session.
 */
const queryCache = new Map();
const MAX_CACHE_SIZE = 50;

function cacheKey(query) {
  return query.trim().toLowerCase();
}

function getCached(query) {
  const key = cacheKey(query);
  if (queryCache.has(key)) {
    // Touch — re-insert to move to end (most-recently-used).
    const value = queryCache.get(key);
    queryCache.delete(key);
    queryCache.set(key, value);
    return value;
  }
  return null;
}

function setCached(query, embedding) {
  const key = cacheKey(query);
  queryCache.set(key, embedding);
  while (queryCache.size > MAX_CACHE_SIZE) {
    const oldestKey = queryCache.keys().next().value;
    queryCache.delete(oldestKey);
  }
}

/**
 * A typed error so callers can distinguish network failures from
 * application errors (rate limit, validation, upstream down).
 */
export class EmbeddingError extends Error {
  constructor(message, { status = null, kind = 'unknown' } = {}) {
    super(message);
    this.name = 'EmbeddingError';
    this.status = status;
    this.kind = kind; // 'network' | 'rate_limit' | 'validation' | 'upstream' | 'unknown'
  }
}

/**
 * Fetch an embedding for a user query. Checks the cache first.
 *
 * @param {string} query — the user's input
 * @param {AbortSignal} [signal] — optional AbortSignal so the caller can
 *        cancel a stale request
 * @returns {Promise<number[]>} — 1536-element embedding vector
 * @throws {EmbeddingError}
 */
export async function fetchQueryEmbedding(query, signal) {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    throw new EmbeddingError('Query is empty', { kind: 'validation' });
  }

  // Cache check — instant return for repeated queries.
  const cached = getCached(trimmed);
  if (cached) return cached;

  let response;
  try {
    response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: trimmed }),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new EmbeddingError(
      "Couldn't reach the matcher. Check your connection?",
      { kind: 'network' }
    );
  }

  if (response.status === 429) {
    throw new EmbeddingError(
      'Too many requests. Wait a moment and try again.',
      { status: 429, kind: 'rate_limit' }
    );
  }
  if (response.status === 400) {
    const body = await safeJson(response);
    throw new EmbeddingError(
      body?.error || 'Query rejected by the matcher.',
      { status: 400, kind: 'validation' }
    );
  }
  if (!response.ok) {
    throw new EmbeddingError(
      'The matcher is having trouble. Try again in a moment.',
      { status: response.status, kind: 'upstream' }
    );
  }

  const body = await safeJson(response);
  const embedding = body?.embedding;
  if (!Array.isArray(embedding)) {
    throw new EmbeddingError(
      'Got a strange response from the matcher.',
      { kind: 'upstream' }
    );
  }

  setCached(trimmed, embedding);
  return embedding;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
