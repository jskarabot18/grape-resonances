/**
 * matcher.js
 *
 * Pure-function similarity math. Given a query vector and the array of
 * pre-computed region vectors, return an array of {region, similarity}
 * tuples sorted descending by similarity.
 *
 * The vectors from text-embedding-3-small are already L2-normalised
 * (magnitude ≈ 1.0), which means cosine similarity reduces to the dot
 * product. We don't rely on that — we compute full cosine — because if
 * we ever swap models, the math should still work.
 */

/**
 * Compute cosine similarity between two equal-length numeric vectors.
 * Returns a value in roughly [-1, 1]. For unit vectors, [0, 1] in practice.
 */
export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    throw new Error('cosineSimilarity: vectors must be equal-length arrays');
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Rank all regions by similarity to a query vector.
 * Returns a new array — does not mutate the input.
 *
 * Each item in the result has the original region's fields plus a
 * `similarity` field (the raw cosine score, 0-1) and `score` (a 0-100
 * percentage suitable for display).
 */
export function rankRegionsByQuery(queryVector, regions) {
  const ranked = regions.map((region) => {
    const similarity = cosineSimilarity(queryVector, region.embedding);
    return {
      ...region,
      similarity,
      score: Math.round(similarity * 100),
    };
  });
  ranked.sort((x, y) => y.similarity - x.similarity);
  return ranked;
}

/**
 * Convert a cluster name to a CSS class suffix.
 * "Old World Interior" -> "old-world-interior"
 * Used to apply the correct .pill--<cluster> class.
 */
export function clusterClassSuffix(cluster) {
  return cluster.toLowerCase().replace(/\s+/g, '-');
}
