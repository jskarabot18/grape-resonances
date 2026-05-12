# Grape Resonances

A Vinotheca Correspondence tool. The user types a word, a phrase, a feeling,
or a situation; the tool returns one to three grapes that hold that
temperament, mediated through the cultural identities of the 59 Soul of
Wine regions.

This is not a recommender. It is an **oracle in the classical sense** —
an instrument of self-recognition where the user brings a question and
receives a compressed, considered offering against which their own
situation becomes legible. The framework's reasoning is collapsed into a
"see how the framework arrived at this" fold for the curious; the default
response is maximally compressed.

**Live:** [https://jskarabot18.github.io/grape-resonances/](https://jskarabot18.github.io/grape-resonances/)

**Sibling tool:** [Region Resonances](https://jskarabot18.github.io/region-resonances/)
— same matching engine, regions as the response surface rather than grapes.

## Architecture

Forked from `region-resonances`; the matching engine, Cloudflare Worker
proxy, and embedding ranking are byte-identical. The only new surface is
how the matched regions are aggregated into grape names and framed.

```
user query  → (Region Resonances pipeline)
            → top-N matched regions
            → aggregator: signature grapes → recurrence-as-finding selection
            → coherence detector: bullseye (≥4 of N share a cluster) vs prism
            → OracleResponse: grape names + framing sentence + verification + trace fold
```

The aggregator and coherence detector are pure functions; both run in the
browser, both ship with a Node test harness (see
`working_files/test_aggregator.mjs` in the planning materials).

## Data files

Four JSON files under `app/public/data/` plus the layer-1 narratives:

- `region_grapes.json` — for each of 59 regions, four tiers of grape
  associations (signature, lesser_known, rare, temperament_seconds).
  v1 aggregator consults Tier 1 only.
- `grape_narratives.json` — Soul of Wine voice character notes for 101
  canonical grapes (53 reds, 48 whites). Used in the trace fold; the
  default response shows grape names only.
- `cluster_framings.json` — six bullseye framings (one per Soul of Wine
  cluster) plus four prism framings (general refraction + three
  cluster-dyad specific framings).
- `grape_aliases.json` — 12 entries mapping regional synonyms in
  `region_grapes.json`'s signature field to their canonical-101 names
  (Spätburgunder → Pinot Noir; Shiraz → Syrah; etc.). Applied at
  aggregation time so recurrence is counted correctly across cultures.
- `layer1_narratives.json` — the 59 region identity narratives from
  Soul of Wine, extracted for embedding. Used here as the canonical
  source for region → {cluster, metaphor, country}.

## Planning documents

The build is documented across two planning files in the Vinotheca
project:

- `Grape_Resonances_PlanningDoc.md` (companion to
  `Region_Resonances_PlanningDoc.md`) — architecture decisions, worked
  examples, locked aggregator rule, locked trace fold spec.
- `vinotheca/PROJECT.md` §6.3 — the build's recorded state in the
  Vinotheca project-state document.

## Local development

```bash
cd app
npm install
npm run dev
```

The Cloudflare Worker that proxies OpenAI's embedding API is shared with
Region Resonances; the dev environment uses the same endpoint with the
rate-limit budget extended.

## License

CC BY-NC 4.0. See `LICENSE`.
