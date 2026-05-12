/**
 * useGrapeData
 *
 * Loads the four Grape Resonances data files in parallel:
 *   - region_grapes.json       (signature/lesser_known/rare/temperament_seconds per region)
 *   - grape_narratives.json    (Soul of Wine voice character notes, 101 grapes)
 *   - cluster_framings.json    (6 bullseye + 4 prism framing sentences)
 *   - grape_aliases.json       (Spätburgunder → Pinot Noir, etc.)
 *
 * Mirrors the shape and conventions of useEmbeddings: returns
 * { data, loading, error } where `data` is { regionGrapes, grapeNarratives,
 * clusterFramings, grapeAliases } on success.
 *
 * Files served from /<BASE>data/. The four files together are small enough
 * (~80–100 KB combined) that we eagerly load all four at mount; no streaming
 * or staged loading needed.
 */

import { useEffect, useState } from 'react';

const BASE = import.meta.env.BASE_URL;

const FILES = {
  regionGrapes:     `${BASE}data/region_grapes.json`,
  grapeNarratives:  `${BASE}data/grape_narratives.json`,
  clusterFramings:  `${BASE}data/cluster_framings.json`,
  grapeAliases:     `${BASE}data/grape_aliases.json`,
  // layer1_narratives is the canonical source for region → {cluster, metaphor,
  // country}. Used to build the region index that powers coherence detection
  // and the trace fold. Shipped as its own file because we don't want to
  // depend on whatever shape region_embeddings.json happens to be in.
  layer1Narratives: `${BASE}data/layer1_narratives.json`,
};

export function useGrapeData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const entries = Object.entries(FILES);
        const responses = await Promise.all(
          entries.map(async ([key, url]) => {
            const res = await fetch(url);
            if (!res.ok) {
              throw new Error(`Failed to load ${url}: ${res.status}`);
            }
            const json = await res.json();
            return [key, json];
          })
        );

        if (cancelled) return;
        const result = Object.fromEntries(responses);
        setData(result);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Failed to load data files.');
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
