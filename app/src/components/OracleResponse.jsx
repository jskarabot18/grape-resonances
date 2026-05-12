/**
 * OracleResponse
 *
 * The Grape Resonances response surface, per the locked default response
 * shape (Grape_Resonances_PlanningDoc.md §"Default response shape (locked
 * 2026-05-10)"):
 *
 *   {Grape A} · {Grape B} · {Grape C}
 *
 *   {One-sentence framing}
 *
 *   Does this resonate? [yes] [partially] [no]
 *
 *   ↳ See how the framework arrived at this   [collapsed]
 *
 * The component takes the matcher's ranked output, the top-N count, and the
 * four loaded data files. It runs the aggregator and coherence detector,
 * looks up the framing sentence, and renders the four bands above.
 *
 * Per §4.11 (Correspondence is oracular): compression is the design.
 * Restraint here is structural — the framing is one sentence, not a
 * paragraph; the verification prompt is binary-ish, not a 5-star rating;
 * the trace is closed by default, not preceded by a teaser.
 */

import { useMemo, useState } from 'react';
import { aggregate } from '../lib/aggregator';
import { detectCoherence, lookupFraming, buildRegionIndex } from '../lib/coherence';
import TraceFold from './TraceFold';
import VerificationPrompt from './VerificationPrompt';

export default function OracleResponse({ ranked, topN, grapeData }) {
  const { regionGrapes, grapeNarratives, clusterFramings, grapeAliases, layer1Narratives } = grapeData;

  // Build the region index from the dedicated layer-1 narratives file.
  // This is the canonical source for region → {cluster, metaphor, country},
  // independent of whatever shape Region Resonances' embeddings file happens
  // to use. Built once per render of the loaded data, not per query.
  const regionIndex = useMemo(
    () => buildRegionIndex(layer1Narratives),
    [layer1Narratives]
  );

  const topMatches = useMemo(
    () =>
      ranked.slice(0, topN).map((r) => ({
        region: r.region,
        similarity: r.similarity,
      })),
    [ranked, topN]
  );

  const aggregation = useMemo(
    () => aggregate(topMatches, regionGrapes, grapeNarratives, grapeAliases),
    [topMatches, regionGrapes, grapeNarratives, grapeAliases]
  );

  const coherence = useMemo(
    () => detectCoherence(topMatches, regionIndex),
    [topMatches, regionIndex]
  );

  const framingSentence = lookupFraming(coherence, clusterFramings);

  // Compose the framing tail for the strong-recurrence case.
  // When one grape recurs across multiple regions, the framing names the
  // recurrence using each contributing region's cluster metaphor.
  // Example: "Pinot Noir — the wine of falling in love, in this framework's
  // reading, though it appears three times: as devotion (Burgundy), as
  // idealism (Willamette), as patient continuation (Santa Cruz Mountains)."
  const framingTail = useMemo(() => {
    if (aggregation.mode !== 'strong_recurrence') return null;
    const grape = aggregation.grapes[0];
    if (!grape) return null;
    const metaphors = grape.contributingRegions
      .map((c) => {
        const idx = regionIndex[c.region];
        return idx?.metaphor ? `as ${idx.metaphor.toLowerCase()} (${c.region})` : null;
      })
      .filter(Boolean);
    if (metaphors.length === 0) return null;
    const joined =
      metaphors.length === 1
        ? metaphors[0]
        : metaphors.slice(0, -1).join(', ') + ', and ' + metaphors[metaphors.length - 1];
    return `It appears ${numberWord(metaphors.length)} times: ${joined}.`;
  }, [aggregation, regionIndex]);

  return (
    <section className="card p-8" aria-label="Oracle response">
      {/* Band 1: grape names */}
      <h2 className="font-serif text-3xl md:text-4xl text-ink leading-tight tracking-tight">
        {aggregation.grapes.map((g, i) => (
          <span key={g.name}>
            {i > 0 && <span className="text-ink-subtle mx-2">·</span>}
            <span className="italic">{g.name}</span>
          </span>
        ))}
      </h2>

      {/* Band 2: framing sentence */}
      <p className="mt-5 font-serif text-ink-muted text-lg leading-relaxed max-w-2xl">
        {framingSentence}
        {framingTail && (
          <>
            {' '}
            <span className="text-ink-subtle">{framingTail}</span>
          </>
        )}
      </p>

      {/* Band 3: verification prompt */}
      <div className="mt-8">
        <VerificationPrompt />
      </div>

      {/* Band 4: trace fold (collapsed by default) */}
      <div className="mt-8 pt-6 border-t border-parchment-edge">
        <TraceFoldDisclosure
          aggregation={aggregation}
          coherence={coherence}
          regionIndex={regionIndex}
          grapeNarratives={grapeNarratives}
          matchedRegionCount={topMatches.length}
        />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// TraceFoldDisclosure — the "See how the framework arrived at this" toggle.
// ---------------------------------------------------------------------------

function TraceFoldDisclosure({ aggregation, coherence, regionIndex, grapeNarratives, matchedRegionCount }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-sm font-sans uppercase tracking-widest text-ink-muted
                   hover:text-wine transition-colors flex items-center gap-2"
      >
        <span aria-hidden="true">{open ? '▾' : '↳'}</span>
        See how the framework arrived at this
      </button>

      {open && (
        <div className="mt-6">
          <TraceFold
            aggregation={aggregation}
            coherence={coherence}
            regionIndex={regionIndex}
            grapeNarratives={grapeNarratives}
            matchedRegionCount={matchedRegionCount}
          />
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------

function numberWord(n) {
  // Used only for the strong-recurrence framing tail. The cardinality is
  // bounded by topN (5), so this small lookup is sufficient.
  const words = ['zero', 'one', 'two', 'three', 'four', 'five'];
  return words[n] || String(n);
}
