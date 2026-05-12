// aggregator.js
//
// Turns the matcher's top-N matched regions into 2–4 response grapes for
// the Grape Resonances oracle, per the "recurrence as finding" rule locked
// 2026-05-10 in Grape_Resonances_PlanningDoc.md §"Aggregator selection rule".
//
// v1 uses Tier 1 (signature) only. Lesser-known and rare tiers are not
// consulted; the deeper data remains in region_grapes.json for v1.1/v2.
//
// Pipeline:
//   1. For each matched region, read its signature grapes from region_grapes.json.
//   2. Canonicalise each signature via grape_aliases.json (Spätburgunder → Pinot Noir,
//      Shiraz → Syrah, etc.).
//   3. Silent-skip any name that is neither in the canonical 101 nor in the
//      alias table. The 101 is the user-facing surface (PROJECT.md scope
//      decision, locked 2026-05-10).
//   4. Tally how many regions each canonical grape recurs across, and
//      compute a similarity-weighted score.
//   5. Select by the recurrence-led rule:
//        - one grape recurs in ≥3 regions  →  return that grape alone (strong recurrence)
//        - 2–4 grapes recur in ≥2 regions  →  return those (multi-grape bullseye, capped at 4)
//        - no grape recurs                 →  return top 2–3 by weighted score (prism)
//      If the strong-recurrence grape is non-canonical (no narrative), fall through
//      to the prism case using canonical-only.

const MAX_MULTI_BULLSEYE = 4;
const PRISM_TOP_N_MIN = 2;
const PRISM_TOP_N_MAX = 3;
const STRONG_RECURRENCE_THRESHOLD = 3;
const MULTI_BULLSEYE_THRESHOLD = 2;

/**
 * Build the set of canonical-101 grape names from grape_narratives.json.
 * Accepts the file's top-level structure ({_metadata, reds, whites}).
 */
export function canonicalGrapeSet(grapeNarratives) {
  const reds = Object.keys(grapeNarratives.reds || {});
  const whites = Object.keys(grapeNarratives.whites || {});
  return new Set([...reds, ...whites]);
}

/**
 * Canonicalise a single signature-tier grape name.
 * Returns the canonical-101 name if the input is itself canonical, if it has
 * an alias that targets a canonical name, or null if neither applies (silent skip).
 */
export function canonicaliseGrape(name, canonicalSet, aliases) {
  if (canonicalSet.has(name)) return name;
  const aliased = aliases[name];
  if (aliased && canonicalSet.has(aliased)) return aliased;
  return null;
}

/**
 * Aggregate matched regions into response grapes.
 *
 * @param {Array<{region: string, similarity: number}>} matchedRegions
 *        Top-N regions from the matcher, ordered by similarity descending.
 * @param {Object} regionGrapes  Loaded region_grapes.json
 * @param {Object} grapeNarratives  Loaded grape_narratives.json
 * @param {Object} aliases  Loaded grape_aliases.json (without _metadata)
 * @returns {{
 *   mode: 'strong_recurrence' | 'multi_bullseye' | 'prism',
 *   grapes: Array<{name: string, contributingRegions: Array<{region: string, similarity: number, originalName: string}>, weightedScore: number}>,
 *   skippedRegions: Array<{region: string, reason: string, originalSignatures: string[]}>
 * }}
 */
export function aggregate(matchedRegions, regionGrapes, grapeNarratives, aliases) {
  const canonicalSet = canonicalGrapeSet(grapeNarratives);

  // Strip _metadata from aliases for lookups
  const aliasMap = {};
  for (const [k, v] of Object.entries(aliases)) {
    if (k !== '_metadata') aliasMap[k] = v;
  }

  // Step 1+2+3: Collect canonicalised signatures per region.
  // For each matched region, the set of canonical grapes it contributes.
  // We deduplicate within a region (a region can't double-count itself).
  const regionToCanonicalGrapes = new Map(); // region -> Set of canonical names
  const grapeOriginalNames = new Map(); // canonical grape -> Map(region -> originalName)
  const skippedRegions = [];

  for (const { region, similarity } of matchedRegions) {
    const entry = regionGrapes[region];
    if (!entry) {
      skippedRegions.push({
        region,
        reason: 'region not found in region_grapes.json',
        originalSignatures: [],
      });
      continue;
    }
    const signatures = entry.signature || [];
    const canonicalsForRegion = new Set();
    const originalForRegion = new Map(); // canonical -> the original spelling we saw here

    for (const sig of signatures) {
      const canonical = canonicaliseGrape(sig, canonicalSet, aliasMap);
      if (canonical === null) continue; // silent skip
      // If we've already seen this canonical for this region under another spelling,
      // keep the first original (typically the unaliased spelling wins because
      // canonical names are tried before aliased ones in canonicaliseGrape).
      if (!canonicalsForRegion.has(canonical)) {
        canonicalsForRegion.add(canonical);
        originalForRegion.set(canonical, sig);
      }
    }

    if (canonicalsForRegion.size === 0) {
      skippedRegions.push({
        region,
        reason: 'no signature grapes survived canonicalisation',
        originalSignatures: [...signatures],
      });
      continue;
    }

    regionToCanonicalGrapes.set(region, canonicalsForRegion);
    for (const canonical of canonicalsForRegion) {
      if (!grapeOriginalNames.has(canonical)) {
        grapeOriginalNames.set(canonical, new Map());
      }
      grapeOriginalNames.get(canonical).set(region, originalForRegion.get(canonical));
    }
  }

  // Step 4: Tally.
  // For each canonical grape, list (region, similarity) for every contributing region.
  const grapeContributions = new Map(); // canonical -> Array<{region, similarity, originalName}>
  const similarityByRegion = new Map(
    matchedRegions.map(({ region, similarity }) => [region, similarity])
  );

  for (const [region, canonicals] of regionToCanonicalGrapes.entries()) {
    const sim = similarityByRegion.get(region) ?? 0;
    for (const canonical of canonicals) {
      if (!grapeContributions.has(canonical)) {
        grapeContributions.set(canonical, []);
      }
      grapeContributions.get(canonical).push({
        region,
        similarity: sim,
        originalName: grapeOriginalNames.get(canonical).get(region),
      });
    }
  }

  // Build the rankable list. Preserve match-order ties by similarity-weighted score.
  const ranked = [...grapeContributions.entries()].map(([name, contribs]) => {
    const weightedScore = contribs.reduce((acc, c) => acc + c.similarity, 0);
    return {
      name,
      contributingRegions: contribs.sort((a, b) => b.similarity - a.similarity),
      weightedScore,
      recurrenceCount: contribs.length,
    };
  });

  // Step 5: Select.
  // (a) Strong recurrence: one grape in ≥3 regions.
  // Sort by recurrence first, then weighted score, so ties go to the higher-scoring grape.
  const sortedByRecurrence = [...ranked].sort(
    (a, b) => b.recurrenceCount - a.recurrenceCount || b.weightedScore - a.weightedScore
  );

  if (sortedByRecurrence.length > 0 && sortedByRecurrence[0].recurrenceCount >= STRONG_RECURRENCE_THRESHOLD) {
    const top = sortedByRecurrence[0];
    // Per Q3 locked answer: strong-recurrence grape is always canonical here
    // (non-canonical were already filtered). But guard anyway.
    return {
      mode: 'strong_recurrence',
      grapes: [stripCount(top)],
      skippedRegions,
    };
  }

  // (b) Multi-grape bullseye: 2–4 grapes recur in ≥2 regions each.
  const multiCandidates = sortedByRecurrence.filter(
    (g) => g.recurrenceCount >= MULTI_BULLSEYE_THRESHOLD
  );
  if (multiCandidates.length >= 2) {
    return {
      mode: 'multi_bullseye',
      grapes: multiCandidates.slice(0, MAX_MULTI_BULLSEYE).map(stripCount),
      skippedRegions,
    };
  }

  // (c) Prism: no grape recurs in ≥2 regions. Return top 2–3 by similarity-weighted score.
  // Canonical-only is already enforced (non-canonical were silent-skipped at step 3).
  const sortedByScore = [...ranked].sort((a, b) => b.weightedScore - a.weightedScore);
  const prismCount = Math.min(
    Math.max(PRISM_TOP_N_MIN, Math.min(PRISM_TOP_N_MAX, sortedByScore.length)),
    sortedByScore.length
  );
  return {
    mode: 'prism',
    grapes: sortedByScore.slice(0, prismCount).map(stripCount),
    skippedRegions,
  };
}

function stripCount({ name, contributingRegions, weightedScore }) {
  return { name, contributingRegions, weightedScore };
}

/**
 * Look up a grape's narrative from grape_narratives.json. The file is
 * organised as { _metadata, reds: {...}, whites: {...} }. We check both
 * colour branches and return the first match, or null if the grape has
 * no narrative (e.g. a non-canonical grape that slipped through).
 */
export function lookupGrapeNarrative(grapeName, grapeNarratives) {
  if (grapeNarratives.reds && grapeName in grapeNarratives.reds) {
    return grapeNarratives.reds[grapeName];
  }
  if (grapeNarratives.whites && grapeName in grapeNarratives.whites) {
    return grapeNarratives.whites[grapeName];
  }
  return null;
}
