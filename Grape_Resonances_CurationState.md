# `region_grapes.json` — Curation Deliverable

> Working note for the `region_grapes.json` data file produced for Grape
> Resonances. Scope is the curation only; project state for Grape Resonances
> lives in `vinotheca/PROJECT.md` §6.3. The companion architecture and
> worked-examples document is `Grape_Resonances_PlanningDoc.md`.

**Completed:** 2026-05-10 (across four sessions)
**Closes:** PROJECT.md §6.3, sub-item 1 — *"Curate `region_grapes.json` — for each of 59 regions, four fields (signature, lesser_known, rare, temperament_seconds). ~10 hours of focused curation."*
**File:** `region_grapes.json` (59 regions, fully validated)

---

## Final state

| Cluster | Regions | Status |
|---|---|---|
| Old World Interior | 10 | Complete |
| Outward Ease | 5 | Complete |
| Old World Exterior | 7 | Complete |
| Against the Odds | 10 | Complete |
| New World Reinvention | 12 | Complete |
| The Moderates | 15 | Complete |
| **Total** | **59** | **Complete** |

**Validation:**
- Subset rule (`temperament_seconds` ⊆ `lesser_known`): clean across all 59 regions.
- All regions have non-empty `signature` and `lesser_known`.
- 4 regions have empty `temperament_seconds`: Beaujolais, Marlborough, Central Otago, Wachau. All single-grape (or in Wachau's case two-grape) regional assertions — narratively justified.

---

## Curation rules (final, locked in `_metadata.curation_rules`)

- **`signature`** — what the region is famous for; 1–4 grapes (4 used only when the regional identity is genuinely multi-pillar, e.g. Sonoma, Alsace).
- **`lesser_known`** — recognised by occasional readers, not headline; tier from which `temperament_seconds` is drawn.
- **`rare`** — even moderately serious enthusiasts haven't heard; up to 4; may be empty.
- **`temperament_seconds`** — the lesser_known grape that most embodies the region's identity; subset of `lesser_known`; may be empty for regions without natural Tier-2 candidates.
- **Empty `temperament_seconds`** — valid routes: (1) single-grape regional assertion (Beaujolais, Marlborough, Central Otago); (2) deliberate two-grape regional assertion where the pair *is* the identity (Wachau).
- **Parentheticals** allowed for disambiguation (e.g. `"Pinela"`, `"Carménère"`, `"Rebula (Ribolla Gialla)"`).
- **Region-relative tiers**, not market-relative.

---

## Same-grape cross-region patterns

The downstream aggregator (PROJECT.md §6.3, sub-item 4) will need to handle these. Roles are distinct in each region.

| Grape | Count | Regions (with role) |
|---|---|---|
| Cabernet Franc | 3 | Mendoza (acceleration), Stellenbosch (aspiration), Finger Lakes (conviction) |
| Sémillon / Semillon | 3 | Bordeaux (generosity/business), Patagonia (extremity-survival), Margaret River (composure) |
| Zinfandel | 2 | Santa Cruz Mountains (patient continuation), Napa Valley (quiet survival under ambition) |
| Cinsault | 2 | Provence (tranquility), Swartland (rebellion) |
| Grenache | 2 | Barossa Valley (pre-Shiraz survival), Paso Robles (Rhône-Ranger independence) |
| Syrah | 2 | Hawke's Bay (quiet confidence), Santa Barbara (serendipitous discovery) |

**Spelling note:** Sémillon (with accent) is used for French/Spanish-speaking regions (Bordeaux, Patagonia); Semillon (no accent) is used for Australian regions (Margaret River, Hunter Valley) per local convention. Intentional regional spelling; aggregator should normalise when comparing across regions.

---

## Cluster reflections

### Old World Interior — 10/10
> Aligoté · Marsanne · Elbling · Spätburgunder · Hárslevelű · Piedirosso · Nerello Cappuccio · Freisa · Treixadura · Zinfandel

5 whites, 5 reds. Cluster signal: *grapes whose value is held against commercial drift; patient continuation as inquiry*.

### Outward Ease — 5/5
> Cinsault · Pinot Grigio · Merlot

Plus 2 empty (Beaujolais, Marlborough). Cluster signal: *the grape that does the cluster's particular work invisibly* — pleasure-work, commerce-work, community-work.

### Old World Exterior — 7/7
> Babić · Sémillon · Pinot Gris (Fromenteau) · Counoise · Gutedel · Dornfelder · Graciano

4 reds + 3 whites, 0 empty. Cluster signal: *the grape that carries the region's specific way of being outwardly oriented*.

### Against the Odds — 10/10
> Roter Veltliner · Trousseau · Assyrtiko · Aidani · Bosco · Vernaccia di Oristano · Tinto Cão · Albillo · Grenache · Verdelho

5 whites + 5 reds, 0 empty. Cluster signal: *grapes whose continued existence has no commercial argument and survives because the region refused to stop growing them*.

### New World Reinvention — 12/12
> Perricone · Xarel·lo · Cabernet Franc · Sémillon · — · Cabernet Franc · Cinsault · Riesling · Cabernet Franc · Zinfandel · Grenache · Carignan

Plus 1 empty (Central Otago). Cluster signal: *what was nearly lost in the bulk-production era and found again*. Six of twelve regions have a *rescued from neglect* grape as `temperament_seconds`.

### The Moderates — 15/15
> Zweigelt · Gelber Muskateller · — · Muscat · Pineau d'Aunis · Silvaner · Kerner · Ribolla Gialla · Canaiolo · Pinela · Semillon · Carménère · Syrah · Syrah · Gamay Noir

Plus 1 empty (Wachau). Cluster signal: *quiet preservation grapes that the disciplined/mature/composed cultures of moderation continue to grow without commercial pressure*. The OW Alpine arc (Kamptal → Wachau → Alsace → Nahe → Alto Adige → Friuli → Brda) is the most coherent — cross-border or near-extinct rescue logic dominates. The NW moderate-climate arc (Margaret River → Maipo → Hawke's Bay → Santa Barbara → Willamette) is dominated by *Bordeaux/Burgundy international varieties plus one quiet-second-grape* logic.

---

## Curatorial principles confirmed across all six clusters

1. **Region-relative tiers, not market-relative.** Furmint is signature in Tokaj; Pinot Grigio is lesser_known in Veneto despite global Pinot Grigio fame.
2. **Do not retreat from the unfashionable signal.** When a narrative honours commerce, survival, or rebellion, pick the grape that carries that signal even if it is wine-snob-irrespectable (Pinot Grigio for Veneto, Sémillon for Bordeaux, Dornfelder for Pfalz, Zinfandel for Napa, Carignan for Sonoma).
3. **Prefer region-specific over cluster-shared.** When two regions could plausibly share a `temperament_seconds`, pick the more region-specific answer for each. Same-grape repeats only when the *role* is genuinely distinct.
4. **The grape with the worst commercial case often wins.** Especially in Against the Odds and New World Reinvention, but applies elsewhere.
5. **Empty is honest.** When a region is genuinely mono- or two-grape, the empty `temperament_seconds` is more truthful than a forced choice.
6. **Cross-border continuums (Friuli/Brda, Steiermark/Slovenian Štajerska, Bordeaux/Spanish heritage) deserve recognition** — the temperament_seconds should *differentiate* sibling regions even when their signatures overlap.

---

## Notes for downstream §6.3 work

- **Aggregator (sub-item 4)** must handle: (a) region-specific tier weighting, (b) same-grape-different-regions (six patterns above), (c) spelling normalisation (Sémillon ↔ Semillon), (d) fall-through behaviour when `temperament_seconds` is empty (use `signature` instead).
- **Empty pattern (4 regions):** Outward Ease 2, NW Reinvention 1, Moderates 1. All four are single- or two-grape regional assertions where the *signature itself is the identity*.
- **Cab Franc 3× pattern** (Mendoza/Stellenbosch/Finger Lakes — acceleration/aspiration/conviction) is a real signal about the present moment in international wine — *the international ambitious-region grape*. Worth a paragraph in the paired Study, when written.

---

## Session pace (curation only)

- Session 1: 10 regions (Old World Interior)
- Session 2: 5 regions (Outward Ease)
- Session 3: 17 regions (Old World Exterior + Against the Odds)
- Session 4: 27 regions (New World Reinvention + The Moderates)
- **Total: 59 regions across 4 sessions.**

Plus one mid-session amendment (Provence subset-rule fix: Cinsault moved from `signature` to `lesser_known`, Grenache becomes sole signature) and one mid-session correction (Wachau Grüner Veltliner restored to signature alongside Riesling).
