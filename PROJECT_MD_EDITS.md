# Draft PROJECT.md edits — for the session that lands sub-item 5 (React scaffold deploy)

These are draft additions to `vinotheca/PROJECT.md` to commit when the
Grape Resonances scaffold deploys and the leaf goes live.

---

## §3 leaves table — Grape Resonances row

Change from:

```
| Correspondence | Grape Resonances | `grape-resonances` (tbd) | Planned — see §6.3 | Grape *Resonances* | A Correspondence of Vinotheca |
```

To:

```
| Correspondence | Grape Resonances | `grape-resonances` | Live | Grape *Resonances* | A Correspondence of Vinotheca |
```

---

## §6.3 — close it

Move the entire §6.3 block to §7 as a closed entry. Renumber subsequent
§6 subsections (§6.4 Winemaker Resonances → §6.3; §6.5 Codex Vinitorum
→ §6.4). Update all cross-references — there are §6.3/§6.4/§6.5 mentions
in §4.11, §4.12, and the §3 leaves table to follow.

---

## §7 — new entry under 2026-05-11 (or whichever date sub-item 5 lands)

```markdown
### 2026-05-11   [or sub-item-5 landing date]

- **Grape Resonances — sub-item 4 closed: aggregator, coherence detector,
  alias file, and test harness.** The recurrence-as-finding rule
  (Planning Doc §"Aggregator selection rule") implemented as
  `aggregate(matchedRegions, regionGrapes, grapeNarratives, aliases)` in
  pure JS, returning `{mode, grapes, skippedRegions}` where mode is one
  of `strong_recurrence`, `multi_bullseye`, or `prism`. Coherence
  detector implemented as `detectCoherence` per the locked rule
  (bullseye if ≥4 of N matched regions share a cluster; prism
  otherwise). A new `grape_aliases.json` file shipped with 12 entries
  (Spätburgunder → Pinot Noir, Shiraz → Syrah, Pinot Grigio → Pinot
  Gris, Pinot Bianco → Pinot Blanc, Weissburgunder → Pinot Blanc,
  Grauburgunder → Pinot Gris, Tinto Fino → Tempranillo, Cannonau →
  Grenache, Garnatxa (Grenache) → Grenache, Carinyena (Carignan) →
  Carignan, Carignano → Carignan, Semillon (Hunter Valley) → Sémillon).
  Eleven signature grapes left unaliased and non-canonical, so silent-
  skipped from the response pool per the v1 scope decision (Carricante,
  Glera, Greco di Tufo, Grillo, Macabeu, Pigato, Pinot Meunier, Pošip,
  Rebula (Ribolla Gialla), Rossese, Savagnin). The alias file decision
  followed three locked answers in conversation: (a) aliases included
  when source and target are the same grape variety, never when grapes
  are merely related; (b) non-canonical, non-aliased signatures silent-
  skip with no automatic promotion to v1.1 of grape_narratives.json;
  (c) when no canonical recurrence emerges, the aggregator falls
  through to prism case using canonical-only. Node test harness
  (`test_aggregator.mjs`) covers six cases including the three locked
  worked examples and two edge paths (alias resolution chain,
  synthetic-region skip). All six pass.

- **Grape Resonances — sub-item 5 closed: React app scaffolded from
  Region Resonances and deployed.** New repo `grape-resonances` created
  at `github.com/jskarabot18/`; site live at
  `https://jskarabot18.github.io/grape-resonances/`. The scaffold
  inherits Region Resonances' matching infrastructure (Cloudflare Worker
  proxy, embedding fetch, cosine similarity matcher, debounce) byte-
  identical; the new surface is the OracleResponse component (grape
  names + framing sentence + verification prompt + collapsed trace
  fold), implementing the locked default response shape from Planning
  Doc line 158. The trace fold is grape-organised per the locked spec:
  each response grape shown with its narrative, its contributing
  regions (similarity + cluster metaphor + original spelling where
  aliased), and an interpretive close sentence drawn from the
  bullseye-single / multi-grape-bullseye / prism response templates.
  A cross-link to Region Resonances closes the fold. The verification
  prompt is privacy-first (Planning Doc Q4): nothing logged anywhere;
  the user's click sets local state and surfaces a quiet
  acknowledgement, that is all. The Cloudflare Worker is reused from
  Region Resonances with the rate-limit budget extended; no new Worker
  spun up.

  Two findings from running the locked worked examples against the
  curated data, worth recording for the Planning Doc's eventual
  revision: (i) "the feeling of brotherhood" was predicted Grenache ·
  Gamay · Shiraz; with Tier 1 + alias resolution (Shiraz → Syrah) +
  recurrence-as-finding on plausible match sets, the actual response
  is Syrah alone (3-region strong recurrence — Châteauneuf-du-Pape,
  Barossa Valley as Shiraz, Walla Walla). Gamay is signature only in
  Beaujolais and so cannot recur; Grenache reaches only 2 of 5
  plausible regions. (ii) The genuine silent-skip path (a matched
  region contributing zero canonical grapes after alias resolution)
  is rarer than initially expected: with the 12-entry alias file in
  place, every region in the current curation contributes at least
  one canonical grape via either a direct match or an alias.
  Etna's Nerello Mascalese is in the canonical 101; Catalonia's
  Garnatxa and Carinyena alias cleanly to Grenache and Carignan;
  Sardinia's Cannonau aliases to Grenache. The silent-skip path is
  still implemented and correctly handled (verified by a synthetic-
  region test in the harness), it just doesn't currently fire on any
  real region.

- **Grape Resonances documentation deferred.** The four PDFs (Summary,
  Methods Primer, Technical Appendix, Data Appendix) following the
  §4.5 canonical framework are not yet authored. The Header.jsx
  Documentation dropdown surfaces the menu items as scaffolding (the
  menu's presence signals the leaf follows the §4.4 Tool pattern), but
  the hrefs currently 404. To be authored in a follow-up session;
  LaTeX templates adaptable from `region-resonances/docs-source/`.
```

---

## §8 — Document changelog entry

```markdown
### 2026-05-11 — v0.22   [or whichever version increments from v0.21]

- §3 leaves table: Grape Resonances row updated from `Planned — see §6.3`
  to `Live`; repo column from `grape-resonances` (tbd) to
  `grape-resonances`.
- §6.3 (Grape Resonances build) closed: all six sub-items now complete.
  Recorded in §7. Subsequent §6 subsections renumbered down by one
  (§6.4 Winemaker Resonances → §6.3; §6.5 Codex Vinitorum → §6.4).
  Cross-references in §4.11 and §4.12 updated to track the
  renumbering.
- §3.1 Works pairings table unchanged (Grape Resonances is a
  Correspondence leaf, not a Works pairing).
- §4.11 closing paragraph: "Grape Resonances (planned, see §6.3)"
  changed to "Grape Resonances" (no section reference needed; the leaf
  is live).
- §7 entry under 2026-05-11 added documenting sub-items 4 and 5 closure
  and the two findings about the brotherhood worked example and the
  silent-skip path.
```
