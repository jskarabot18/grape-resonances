/**
 * TraceFold
 *
 * The "See how the framework arrived at this" expanded view. Grape-organised
 * layout per Grape_Resonances_PlanningDoc.md §"Trace fold — locked spec
 * (2026-05-10)":
 *
 *   {Grape name}
 *
 *   {Grape narrative from grape_narratives.json}
 *
 *   This grape appeared as the signature of {k} of {N} matched regions:
 *     {Region} ({similarity}) — {cluster metaphor}
 *     {Region} ({similarity}) — {cluster metaphor}
 *
 *   {One-sentence interpretive close}
 *
 *   ...
 *   → See this query in Region Resonances for the regional reading
 *
 * Interpretive close templates depend on aggregator mode (locked Planning Doc
 * spec, "drawn from response templates"). The wordings here are kept compact
 * and in Soul of Wine register; can be tuned by editing the
 * INTERPRETIVE_CLOSE table below.
 */

import { lookupGrapeNarrative } from '../lib/aggregator';

// ---------------------------------------------------------------------------
// Interpretive close templates per Planning Doc trace-fold spec.
//
// 'strong_recurrence_solo'  — single grape recurs in ≥3 regions.
// 'multi_bullseye'          — multiple grapes recur in ≥2 regions each.
// 'prism'                   — no grape recurs; top 2–3 by score.
//
// These are short interpretive sentences, one per response grape, rendered
// after the contributing-regions list. They are intentionally generic across
// the response — the *specific* reading lives in the framing sentence and
// the grape narrative. The close serves as a quiet capstone, not a re-argument.
// ---------------------------------------------------------------------------

const INTERPRETIVE_CLOSE = {
  strong_recurrence_solo: 'The same grape carries the same feeling through different cultural temperaments.',
  multi_bullseye:          'These grapes share a temperament; the framework reads them as siblings.',
  prism:                   'Each grape carries one facet of your word; together they hold what no single one could.',
};

const REGION_RESONANCES_URL = 'https://jskarabot18.github.io/region-resonances/';

export default function TraceFold({ aggregation, coherence, regionIndex, grapeNarratives, matchedRegionCount }) {
  const { mode, grapes, skippedRegions } = aggregation;

  // Pick the interpretive close template based on aggregator mode.
  const closeKey =
    mode === 'strong_recurrence'
      ? 'strong_recurrence_solo'
      : mode === 'multi_bullseye'
      ? 'multi_bullseye'
      : 'prism';
  const closeSentence = INTERPRETIVE_CLOSE[closeKey];

  // Total N is the number of regions the matcher fed to the aggregator,
  // passed in as matchedRegionCount. This is the honest count even when a
  // region's contributions got outranked out of the top-3 response (its
  // grape didn't reach the response but the region was still "matched").
  const N = matchedRegionCount;

  return (
    <div className="space-y-8 text-sm">
      {grapes.map((grape) => (
        <GrapeTrace
          key={grape.name}
          grape={grape}
          N={N}
          narrative={lookupGrapeNarrative(grape.name, grapeNarratives)}
          regionIndex={regionIndex}
          closeSentence={closeSentence}
        />
      ))}

      {skippedRegions.length > 0 && (
        <div className="pt-4 border-t border-parchment-edge text-xs text-ink-subtle italic">
          <p>
            {skippedRegions.length === 1 ? 'One region' : `${skippedRegions.length} regions`}
            {' '}did not surface a grape in v1: {' '}
            {skippedRegions.map((s, i) => (
              <span key={s.region}>
                {i > 0 && ', '}
                {s.region}
              </span>
            ))}.
          </p>
        </div>
      )}

      <div className="pt-6 border-t border-parchment-edge">
        <a
          href={REGION_RESONANCES_URL}
          className="text-sm font-sans text-ink-muted hover:text-wine transition-colors
                     inline-flex items-center gap-2"
        >
          <span aria-hidden="true">→</span>
          See this query in Region Resonances for the regional reading
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GrapeTrace — one grape's entry in the trace fold.
// ---------------------------------------------------------------------------

function GrapeTrace({ grape, N, narrative, regionIndex, closeSentence }) {
  const k = grape.contributingRegions.length;

  return (
    <div>
      <h3 className="font-serif italic text-xl text-ink">{grape.name}</h3>

      {narrative && (
        <p className="mt-2 font-serif text-ink-muted leading-relaxed max-w-2xl">
          {narrative}
        </p>
      )}

      <p className="mt-4 text-xs uppercase tracking-widest text-ink-subtle font-sans">
        {k === 1
          ? `Appeared as the signature of 1 of ${N} matched regions`
          : `Appeared as the signature of ${k} of ${N} matched regions`}
      </p>

      <ul className="mt-2 space-y-1 font-serif text-ink-muted">
        {grape.contributingRegions.map((r) => {
          const idx = regionIndex[r.region];
          const metaphor = idx?.metaphor;
          const asOriginal = r.originalName !== grape.name ? `as ${r.originalName}` : null;
          return (
            <li key={r.region} className="text-sm">
              <span className="text-ink">{r.region}</span>
              <span className="text-ink-subtle">
                {' '}({r.similarity.toFixed(2)})
              </span>
              {metaphor && (
                <span className="text-ink-subtle"> — {metaphor.toLowerCase()}</span>
              )}
              {asOriginal && (
                <span className="text-ink-subtle italic"> · {asOriginal}</span>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-3 font-serif italic text-ink-subtle text-sm leading-relaxed max-w-xl">
        {closeSentence}
      </p>
    </div>
  );
}
