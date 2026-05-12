/**
 * App
 *
 * Forked from region-resonances/app/src/App.jsx. The orchestrator pattern is
 * preserved — debounce, abort-controlled embedding fetch, ranking — and the
 * response surface is swapped. Where Region Resonances renders a list of
 * region cards, Grape Resonances takes the top-N matched regions and feeds
 * them to:
 *
 *   1. aggregate()         — groups matched-region signatures into 2–4
 *                            response grapes per the locked recurrence-as-
 *                            finding rule (Tier 1 only, canonical-101 surface,
 *                            aliases applied).
 *   2. detectCoherence()   — bullseye (≥4 of N share a cluster) vs prism.
 *   3. <OracleResponse>    — renders grape names + one framing sentence +
 *                            verification prompt + collapsed trace fold.
 *
 * Per §4.11 (Correspondence is oracular): the default response is maximally
 * compressed. The trace fold is collapsed by default and surfaces the
 * grape_narratives, contributing regions, and the locked cluster metaphors.
 *
 * Browse mode (Region Resonances' empty-query default) does not apply here:
 * the oracle has nothing to browse. When the query is empty we show the
 * input panel alone with a quiet prompt.
 */

import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import InputPanel from './components/InputPanel';
import OracleResponse from './components/OracleResponse';
import { useEmbeddings } from './lib/useEmbeddings';
import { useDebouncedValue } from './lib/useDebouncedValue';
import { useGrapeData } from './lib/useGrapeData';
import { fetchQueryEmbedding, EmbeddingError } from './lib/api';
import { rankRegionsByQuery } from './lib/matcher';

const DEBOUNCE_MS = 600;

// Top-N matched regions fed to the aggregator. Planning Doc uses N=5 for the
// "falling deeply in love" worked example; the recurrence-as-finding rule is
// calibrated against that cardinality.
const TOP_N = 5;

export default function App() {
  const { regions, loading: embeddingsLoading, error: embeddingsError } = useEmbeddings();
  const { data: grapeData, loading: grapeDataLoading, error: grapeDataError } = useGrapeData();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);

  const [ranked, setRanked] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);

  const abortRef = useRef(null);

  useEffect(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setRanked(null);
      setStatus('idle');
      setErrorMessage(null);
      return;
    }

    if (!regions) {
      // Embeddings not yet loaded.
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setErrorMessage(null);

    fetchQueryEmbedding(trimmed, controller.signal)
      .then((vector) => {
        if (controller.signal.aborted) return;
        const result = rankRegionsByQuery(vector, regions);
        setRanked(result);
        setStatus('ready');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        // Preserve prior results across transient errors (Google behaviour).
        setStatus('error');
        if (err instanceof EmbeddingError) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Something unexpected happened.');
        }
      });

    return () => controller.abort();
  }, [debouncedQuery, regions]);

  const dataReady = regions && grapeData;
  const hasResponse = ranked && ranked.length > 0 && dataReady;
  const queryIsEmpty = debouncedQuery.trim().length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        {(embeddingsError || grapeDataError) && (
          <div className="card p-6 max-w-2xl">
            <p className="font-serif text-wine text-lg">
              Couldn&rsquo;t load the framework.
            </p>
            <p className="mt-2 text-ink-muted text-sm">
              {embeddingsError || grapeDataError}. Try refreshing the page.
            </p>
          </div>
        )}

        {(embeddingsLoading || grapeDataLoading) && !embeddingsError && !grapeDataError && (
          <p className="text-ink-subtle italic font-serif">
            Gathering the regions and the grapes&hellip;
          </p>
        )}

        {dataReady && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1">
              <InputPanel
                query={query}
                onQueryChange={setQuery}
                status={status}
                errorMessage={errorMessage}
              />
            </div>
            <div className="lg:col-span-2">
              {hasResponse && (
                <OracleResponse
                  ranked={ranked}
                  topN={TOP_N}
                  grapeData={grapeData}
                />
              )}
              {!hasResponse && queryIsEmpty && (
                <EmptyState />
              )}
              {/*
                Loading/error mid-query intentionally renders nothing here.
                The InputPanel handles status feedback.
              */}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmptyState — quiet prompt when no query yet entered. The oracle has nothing
// to browse, so we say what kind of question it answers instead.
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="card p-8 max-w-2xl">
      <p className="font-serif italic text-ink-muted text-lg leading-relaxed">
        This tool answers feelings, memories, and moments.
      </p>
      <p className="mt-4 text-ink-muted text-sm leading-relaxed">
        Try a word or phrase about what you&rsquo;re carrying tonight, rather than
        what you&rsquo;re cooking. The framework returns one to three grapes that
        hold that temperament, drawn through the cultural identities of the wine
        regions they grow in.
      </p>
    </div>
  );
}
