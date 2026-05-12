// coherence.js
//
// Detects whether the matched regions form a bullseye (concentrated in one
// Soul of Wine cluster) or a prism (spread across clusters), and selects the
// framing sentence accordingly.
//
// Selection rule, locked 2026-05-10 (cluster_framings.json metadata):
//   bullseye if ≥4 of N matched regions share a cluster; prism otherwise.
//
// Bullseye framings (one per cluster) live in cluster_framings.json under
// `bullseye_framings`. Prism framings live under `prism_framings` and
// include both a general refraction sentence and three cluster-dyad specific
// framings (interior+reinvention, difficulty+ease, interior+moderate).
//
// The coherence detector operates on matched regions, independent of the
// aggregator's grape selection — it asks "what shape is the user's word?",
// not "what grapes did we land on?". The two modes (aggregator mode + coherence
// mode) are orthogonal: a strong-recurrence grape selection can land in either
// a bullseye or a prism cluster pattern. The framing copy reflects the
// cluster shape; the response template reflects the aggregator mode.

const BULLSEYE_THRESHOLD = 4;

// Map of two-cluster sets (sorted, joined by '|') to specific prism-dyad framings.
// Used only when exactly two clusters appear in the matched-region set and one
// of the locked dyads matches. Otherwise prism_general is used.
const PRISM_DYAD_MAP = {
  'New World Reinvention|Old World Interior': 'prism_interior_reinvention',
  'Against the Odds|Outward Ease': 'prism_difficulty_ease',
  'Old World Interior|The Moderates': 'prism_interior_moderate',
};

/**
 * @param {Array<{region: string, similarity: number}>} matchedRegions
 * @param {Object} regionGrapes  Loaded region_grapes.json (not used for coherence,
 *        but kept in the signature for callers that already have it)
 * @param {Object} regions  A map of region name → { cluster, metaphor, ... }
 *        Built from layer1-narratives_6_34_57_AM.json.
 * @returns {{
 *   mode: 'bullseye' | 'prism',
 *   dominantCluster: string | null,
 *   clusterCounts: Object<string, number>,
 *   framingKey: string
 * }}
 */
export function detectCoherence(matchedRegions, regions) {
  const clusterCounts = {};
  for (const { region } of matchedRegions) {
    const rec = regions[region];
    if (!rec || !rec.cluster) continue;
    clusterCounts[rec.cluster] = (clusterCounts[rec.cluster] || 0) + 1;
  }

  // Find the dominant cluster (most-occurring; ties broken by first-seen).
  let dominantCluster = null;
  let dominantCount = 0;
  for (const [cluster, count] of Object.entries(clusterCounts)) {
    if (count > dominantCount) {
      dominantCluster = cluster;
      dominantCount = count;
    }
  }

  if (dominantCount >= BULLSEYE_THRESHOLD) {
    return {
      mode: 'bullseye',
      dominantCluster,
      clusterCounts,
      framingKey: dominantCluster, // used to look up bullseye_framings[dominantCluster]
    };
  }

  // Prism. Try to match a specific dyad framing if exactly two clusters appear.
  const presentClusters = Object.keys(clusterCounts).sort();
  let framingKey = 'prism_general';
  if (presentClusters.length === 2) {
    const dyadKey = presentClusters.join('|');
    if (PRISM_DYAD_MAP[dyadKey]) {
      framingKey = PRISM_DYAD_MAP[dyadKey];
    }
  }

  return {
    mode: 'prism',
    dominantCluster: null, // intentionally null for prism
    clusterCounts,
    framingKey,
  };
}

/**
 * Look up the framing sentence given the coherence result and cluster_framings.json.
 * Returns the sentence; the React layer is responsible for any additional templating
 * (e.g. naming the recurrence in the strong_recurrence aggregator case, where the
 * framing sentence is typically followed by a comma and the three cluster metaphors).
 */
export function lookupFraming(coherenceResult, clusterFramings) {
  if (coherenceResult.mode === 'bullseye') {
    return clusterFramings.bullseye_framings[coherenceResult.framingKey] || null;
  }
  return clusterFramings.prism_framings[coherenceResult.framingKey]
      || clusterFramings.prism_framings.prism_general
      || null;
}

/**
 * Build the region→{cluster, metaphor, country} index from the raw layer-1 narratives file.
 * The narratives file has the shape { metadata, regions: [{name, country, metaphor, cluster, ...}] }.
 */
export function buildRegionIndex(layer1Narratives) {
  const index = {};
  for (const r of layer1Narratives.regions) {
    index[r.region] = {
      cluster: r.cluster,
      metaphor: r.metaphor,
      country: r.country,
    };
  }
  return index;
}
