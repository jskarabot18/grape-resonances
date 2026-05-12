/**
 * useEmbeddings
 *
 * Loads region_embeddings.json once on mount and returns:
 *   { regions, loading, error }
 *
 * The file is ~1.8 MB but it's static and cacheable — the browser
 * downloads it once and then it's free for every subsequent query.
 */
import { useEffect, useState } from 'react';

// Vite resolves this URL relative to the public/ directory at build time.
// In dev, it's served from /region_embeddings.json (via public/).
// In production GitHub Pages build, it's at /region-resonances/region_embeddings.json.
import.meta.env; // touch to silence import warnings in some setups

const EMBEDDINGS_URL = import.meta.env.BASE_URL + 'region_embeddings.json';

export function useEmbeddings() {
  const [state, setState] = useState({
    regions: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch(EMBEDDINGS_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!Array.isArray(data?.regions) || data.regions.length !== 59) {
          throw new Error(
            `Expected 59 regions in embeddings file, got ${data?.regions?.length}`
          );
        }
        setState({ regions: data.regions, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          regions: null,
          loading: false,
          error: err.message || 'Failed to load region embeddings',
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
