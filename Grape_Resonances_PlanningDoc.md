# Grape Resonances — Planning Doc

> A Correspondence tool that returns the grape (or two-to-three grapes) that resonates with a user's word, phrase, feeling, or situation — mediated through region-character matching against the Soul of Wine corpus.

**Status:** Planned — sibling to Region Resonances, builds on the same architecture and data.

---

## What this is

Grape Resonances is the second Correspondence leaf after Region Resonances. The user types a word, phrase, feeling, or situation, and the tool returns one to four grapes, framed as *the wines that hold this temperament, in the framework's reading*.

It is not a recommender. It is an **oracle in the classical sense** — an instrument of self-recognition where the user brings a question, receives a compressed and considered answer, and verifies the answer against their own felt sense. The success state is the user's pause and recognition: *yes, that is exactly what I drink when I feel that way*. The framework underneath makes the recognition non-arbitrary; the compression of the response makes the recognition possible.

This sits in the lineage of *I Ching*, tarot, and other classical instruments where the answer is shaped enough for the user to find their situation in it without being so specific that the tool claims to know what it cannot. The wine domain is one of the few consumer cultural domains rich enough to carry oracular weight, because Soul of Wine has done the substrate work of treating wine regions as carriers of distinct temperaments rather than as commodities.

---

## How it relates to Region Resonances

The two tools are **complementary acts**, not redundant ones.

- **Region Resonances** maps feelings to *places*. The user comes away with five regions and a temperament-portrait. The implicit invitation: *go to Tokaj, go to Galicia, go to Otago.* The wine is in the room, but the room is what's offered. The outward turn — feeling pointing at the world.
- **Grape Resonances** maps feelings to *wines*. The user comes away with one to three grapes. The invitation: *drink this, tonight, now.* The wine is the room. The inward turn — feeling pointing at the body and the immediate sensory present.

The two tools share the same underlying matching engine (semantic embedding against the 59 region narratives). The difference is in the response surface — region cards versus grape names — and in the framing copy that converts the match into a portrait or an oracle answer respectively.

---

## The architectural decision: region-mediation, not direct grape matching

A direct grape-to-feeling matcher was considered and rejected. The grape data Vinotheca has (TasteRank's sensory profiles, Grand Cru Atlas's site associations) is not the right substrate for matching against emotional input. TasteRank's similarity structure is *palate-driven* — Pinot Noir's nearest sensory neighbours are not necessarily the grapes that share Burgundy's *temperament*. Embedding "old soul" against sensory descriptors would either return noise or produce confident-looking matches that mean nothing.

The honest path: **region as the temperament-carrier, grape as the consequence**.

```
User input ──► Embedding match against 59 region narratives (existing infrastructure)
            ──► Top-N regions surfaced
            ──► For each region, lookup curated grape associations
            ──► Aggregate across cluster, weighted by region similarity
            ──► Return 1–4 grapes with framing copy
```

This means the grape recommendation is *defensible*: not *this grape embodies your feeling* (a claim we can't support), but *these are the grapes that the cultures of this temperament grow* (a claim that follows from the data). The user can trace the reasoning if they want to. The trace doesn't have to be visible by default — and in oracle-mode, it shouldn't be — but it has to *exist*.

### Why TasteRank is not used in matching

TasteRank from Grape Affinities was considered as either the primary matching engine or a coherence check on results. Both uses were rejected for v1.

- TasteRank as primary engine collapses temperament into palate; that's the wrong projection.
- TasteRank as coherence check (does this lesser-known grape cluster sensorily with the others?) was considered but cut for v1 — it adds complexity without serving the oracle frame, and it implicitly suggests palate is the right axis for evaluation.

TasteRank may earn a role in a future *Sensory Bridge* feature — a small expandable panel after the main response that says *if you want to follow this temperament into adjacent flavours, here are the sensory neighbours*. This stays out of v1.

---

## Data sources

### Existing (no new work)

- **`regions.json`** — canonical list of 59 regions, metaphors, cluster assignments. Already in use by Region Resonances.
- **Layer 1 PDF** — 59 identity narratives, ~280–320 words each. Already extracted and embedded for Region Resonances.
- **`region_embeddings.json`** — pre-computed 1536-dimension vectors for each region. Already shipping.

### New work required

#### `region_grapes.json` (curated)

For each of the 59 regions, four fields:

```json
{
  "Burgundy": {
    "signature": ["Pinot Noir", "Chardonnay"],
    "lesser_known": ["Aligoté", "Gamay (Hautes-Côtes)"],
    "rare": ["Sacy", "César"],
    "temperament_seconds": ["Aligoté"]
  },
  "Tokaj": {
    "signature": ["Furmint"],
    "lesser_known": ["Hárslevelű", "Sárga Muskotály"],
    "rare": ["Kabar", "Zéta"],
    "temperament_seconds": ["Hárslevelű"]
  }
  ...
}
```

- **signature** — what the region is famous for; the grape any wine-curious person already associates with the place.
- **lesser_known** — recognized by occasional readers but not the obvious answer.
- **rare** — even moderately serious enthusiasts haven't heard of these.
- **temperament_seconds** — the lesser-known grape from this region that *most embodies the region's identity*. This is the curatorial key — when aggregating across the cluster for Tier 2, we pull `temperament_seconds`, not arbitrary lesser-knowns. This ensures coherence across the response.

**Estimated curation time:** ~10 hours of focused work. 59 regions × ~10 minutes each. This is the foundational deliverable; everything else depends on it being honest.

**Curation principle:** tiers are region-relative (what the region keeps), not market-relative (what the global wine market notices). Furmint is *signature* in Tokaj even though it's globally lesser-known.

**Important curatorial note from worked examples:** Some regions (Walla Walla, parts of New Zealand) don't have natural Tier 2 candidates because they grow mostly international varieties. The aggregator should *not force* a Tier 2 grape per region — it selects the strongest 2–3 across the cluster and accepts asymmetry.

#### `grape_narratives.json` (authored)

One or two sentences per grape, in Soul of Wine voice, focused on *character* rather than tasting notes. Static text shipped in JSON. Used as the descriptive copy under each grape in the response.

Example entries:

```json
{
  "Pinot Noir": "The grape that disappears into its terroir; loved equally by Burgundy's devotees, Willamette's idealists, and Santa Cruz's obsessives, in three different keys.",
  "Aligoté": "Burgundy's patient white; the grape kept growing on the slopes that didn't make the cut for Pinot, ripening late into wines of unexpected nerve.",
  "Furmint": "Tokaj's other voice; the grape that holds sweetness and severity in the same bottle.",
  "Saint Laurent": "The Pfalz's quiet red; an Austrian-German grape grown for centuries at communal tables before anyone thought to call it serious."
}
```

**Estimated authoring time:** ~10–15 hours for ~100 grapes (the canonical set across the curated `region_grapes.json` tiers). Can be expanded incrementally — start with the grapes that appear in the curated tiers and grow over time.

**Voice constraint:** must match Soul of Wine register. Declarative but not preachy. Character-focused, not flavor-focused. One sentence preferred; two if necessary; three is too many.

#### `cluster_framings.json` (authored)

For each of the 6 identity clusters (Old World Interior, Outward Ease, etc.), a hand-written intro sentence that names the temperament when that cluster dominates the user's matched regions. Plus 2–4 *facet framings* for queries that span multiple clusters (the prism case — see §"Bullseyes vs. prisms" below).

Example:

```json
{
  "Old World Interior": "Your word points to the patient, custodial cultures — places where time is the essential ingredient and the winemaker is a keeper, not a maker.",
  "Outward Ease": "Your word points to the communal cultures — places where wine is part of the table, not separate from it.",
  "New World Reinvention": "Your word points to the cultures of conviction-without-evidence — places that decided they should exist and then made themselves.",
  "Against the Odds": "Your word points to the cultures of endurance — places where difficulty is not an obstacle but the substance.",
  "Old World Exterior": "Your word points to the institutional cultures — places where wine is also a system of relations, of trade, of inheritance made legible.",
  "The Moderates": "Your word points to the cultures of equilibrium — places that have found their voice without choosing the loudest register.",

  "_facet_framings": {
    "prism": "Your word refracts. In this framework's reading, it is not one feeling but several — and the regions your phrase pulls hold different facets of it."
  }
}
```

**Authoring time:** ~2 hours. Six cluster intros + a small set of facet framings. Critical piece of writing — this is what the user reads first, and it has to land.

---

## The response — oracle, not search

This is the design hinge. Grape Resonances should be **maximally compressed** by default. The user gets the grape names. Everything else is scaffolding.

### Default response shape

```
{Grape A} · {Grape B} · {Grape C}

{One-sentence framing drawn from cluster_framings.json or the prism template}

Does this resonate? [yes] [partially] [no]

↳ See how the framework arrived at this  [collapsed by default]
```

That is the entire response. Two to four grape names, one framing sentence, one verification prompt, one collapsed fold for the user who wants the trace.

### Worked examples

These have been validated in conversation as landing the way the oracle frame requires:

**Query: "the feeling of brotherhood"**
Response: *Grenache · Gamay · Shiraz — the wines of brotherhood, in this framework's reading; the grapes the communal cultures grow at the table.*

**Query: "falling deeply in love"**
Response: *Pinot Noir — the wine of falling in love, in this framework's reading, though it appears three times: as devotion (Burgundy), as faith (Willamette), as cost (Santa Cruz Mountains).*

**Query: "making a decision about the move across the country"**
Response: *Riesling · Chenin Blanc · Furmint — the wines of the threshold; grapes that hold multiple possibilities at once and never fully resolve into one. The wines for being in the middle of something.*

These examples exhibit the tool's signature behaviors:

- **Recurrence as finding.** The Pinot Noir example surfaces the same grape three times across regions and *names* this as the answer rather than treating it as redundancy.
- **Color and structure as findings.** The threshold example notices that all three grapes are white and share the property of "not committing to one style," and surfaces this as the response's character.
- **Reading past the surface.** The threshold query is about deciding, not moving — the tool reads the underlying state (irresolution, holding) rather than the topical surface (relocation).

### Bullseyes vs. prisms

A real architectural finding from worked examples: **some queries land on a single coherent temperament (bullseyes); some refract into multiple coherent facets (prisms).**

- *Brotherhood* is a bullseye — five regions, one cluster (mostly Outward Ease), one temperament. Response: synthesize across the cluster, return 2–3 grapes, single framing.
- *Falling deeply in love* is a prism — five regions, multiple clusters, five different facets of one experience. Response: name the prism explicitly, surface the recurrence (Pinot Noir three times), use the prism framing template.

**Detection rule for v1 (proposed):** examine the variance of matched regions on the six D-axes. Below a threshold, treat as bullseye. Above the threshold, treat as prism. Exact threshold to be tuned during prototype testing.

### What the response is *not*

- Not a list of regions. The user sees grapes, optionally followed by a small note about which regions contributed (in the expanded fold). Region cards stay in Region Resonances.
- Not a tasting note. No flavor descriptors, no acidity scales, no food pairings. Character only.
- Not a portfolio. Two to four grapes, max. Five is too many; the compression is doing real work.
- Not justified at length. The framing sentence does the work of contextualization. Long explanation breaks the oracle frame.

### Graceful refusal of wrong-shaped queries

Some queries are not in the oracle's domain:
- *What's a good white wine* (search query)
- *Pasta with Bolognese — what wine* (pairing query)
- *What's the best 2019 Bordeaux* (catalogue query)

The tool should detect these (likely via a small classifier or keyword pattern) and redirect honestly:

> *This tool answers feelings, memories, and moments. Try a sentence about what you're carrying tonight rather than what you're cooking.*

The refusal is part of the tool's character. Oracles that try to answer everything stop being oracles.

---

## Tech stack

Inherited from Region Resonances (matching pattern intentionally):

- **Frontend:** React + Vite, GitHub Pages deployment
- **Embeddings:** OpenAI text-embedding-3-small via Cloudflare Worker proxy (same Worker, possibly same endpoint, with rate-limit budget extended)
- **Matching:** cosine similarity in browser against the same 59-region embedding file
- **New data files:** `region_grapes.json`, `grape_narratives.json`, `cluster_framings.json`

### Repo structure (anticipated)

```
grape-resonances/
├── public/
│   └── data/
│       ├── region_embeddings.json     (copied from region-resonances)
│       ├── region_grapes.json         (NEW — curated)
│       ├── grape_narratives.json      (NEW — authored)
│       └── cluster_framings.json      (NEW — authored)
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── InputPanel.jsx
│   │   ├── OracleResponse.jsx
│   │   ├── GrapeNames.jsx
│   │   ├── FramingSentence.jsx
│   │   ├── VerificationPrompt.jsx
│   │   └── TraceFold.jsx              (the collapsed "how the framework arrived at this")
│   └── lib/
│       ├── matcher.js                 (cosine similarity — shared with region-resonances)
│       ├── aggregator.js              (region matches → grape lists)
│       ├── coherence.js               (bullseye vs prism detection)
│       └── api.js                     (Cloudflare Worker call — shared infrastructure)
└── scripts/
    └── (no new scripts needed — embeddings already pre-computed)
```

---

## Build sequence

1. **Curate `region_grapes.json`** — ~10 hours, focused curatorial work. The foundation; everything depends on this being honest. Estimate: 2 working days.
2. **Author `grape_narratives.json`** — ~10–15 hours of writing in Soul of Wine voice for ~100 canonical grapes. Estimate: 2 working days, can overlap with §1.
3. **Author `cluster_framings.json`** — ~2 hours. Six cluster intros + prism framing. Critical writing piece. Estimate: half a day.
4. **Build the aggregator and coherence detector** — ~50–100 lines of JS. Region matches → tier-1 + tier-2 grapes; bullseye vs prism detection. Estimate: half a day.
5. **Build the React app** — scaffold from Region Resonances. Strip down the region-card UI; replace with grape-name response. Add verification prompt and trace fold. Estimate: 1 day.
6. **Test with curated queries** — iterate the bullseye/prism threshold, the framing copy, the asymmetry handling. Use the three worked examples (brotherhood, falling in love, decision about the move) plus 5–10 new queries. Estimate: half a day.
7. **Deploy and integrate into Vinotheca catalogue** — link from parent under Correspondence (alongside Region Resonances). Estimate: 1 hour.

**Total: ~6 working days from start to live.** The curation/authoring (steps 1–3) is the bulk of the work and the part that determines quality. The build itself is small.

---

## Open questions to resolve before building

1. **Repo decision** — separate `grape-resonances` repo, or sub-route within `region-resonances`? Lean: separate repo, mirroring the family pattern. Same arguments as for region-resonances having its own repo.
2. **Same Cloudflare Worker, or new one?** — likely the same, with rate-limit budget extended. No technical reason to fork.
3. **Curation: solo author, or solicited input from wine experts?** — solo for v1 (preserves voice consistency); could solicit feedback before launch.
4. **Verification prompt — does it write anything anywhere?** — privacy-first ethos says no. The prompt is purely for the user's pause; nothing recorded, nothing tracked. The act of clicking is its own moment.
5. **Trace fold contents** — when the user expands "see how the framework arrived at this," what shows? Probably: the matched regions with similarity scores, a one-line per region tying it to a grape, and a link to Region Resonances for the same query. Worth designing carefully — this is where curious users go to understand the framework.
6. **Tier 2 in the response** — the planning has Tier 1 (signature) as the default response. Tier 2 (`temperament_seconds`) might appear as a *go deeper* expansion below the main answer, or might only appear in the trace fold, or might not appear in v1 at all. Recommendation: ship v1 with Tier 1 only; add Tier 2 as v1.1 once the oracle frame is established.
7. **Wrong-shaped query detection** — exact mechanism (keyword list, small classifier, LLM call) to be decided. Probably a simple keyword/pattern detector for v1.
8. **Cross-link with Region Resonances** — should typing the same query in both tools surface comparable results? Probably yes; the matching engine is the same. The trace fold could include "see this query in Region Resonances →" and vice versa.

---

## What this tool is, finally

Grape Resonances is the working surface where Soul of Wine's analytical project meets the user's interior life. Region Resonances established that surface for places; Grape Resonances completes it for wines, which is where the user's life actually touches the wine world day-to-day.

It is an **oracle** — an instrument of self-recognition mediated through a serious cultural framework. Its authority comes from the framework's traceability (every answer can be followed back through region narratives to defensible reasoning) and from the response's compression (the user is given a shape, not a lecture, and the recognition happens in the silence).

It is the second member of Vinotheca's **Correspondence** section — the section where the user becomes the active provider of their own input and receives back not data but recognition. The section's character, drawn out across the conversation that produced this doc:

> *Correspondence is the part of Vinotheca where the user is taken seriously as a subject of inquiry rather than as a market segment. The atlases are for the world; the studies are for the structure; the affinities tools are for the geometry; Correspondence is for the encounter.*

In Bourdieu's terms, the tool exposes the structural fact that taste classifies the classifier — but turns that exposure to a warm purpose: helping the user see, through the act of attending to wine carefully, something true about themselves they did not know they knew.

*In vino, cognitio.*

---

*Planning doc · Drafted May 2026, after the Region Resonances tool launched and shortly after the conversation that named the oracle character of Correspondence as a section. Will be updated when build begins.*
