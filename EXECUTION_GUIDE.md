# Grape Resonances — Execution Guide

This guide walks the path from a forked `region-resonances` repo to a
deployed `grape-resonances` leaf. The new code is in this bundle; the
infrastructure (Tailwind config, deploy workflow, matcher/api/hook
modules, base CSS, common components) is reused from Region Resonances
unchanged.

**Pre-requisite:** sub-item 4 already done — the aggregator, coherence
detector, alias file, and test harness were authored in the previous
session and are now folded into `app/src/lib/` and `app/public/data/`.

---

## Step 1 — Create the new repo

On GitHub:

1. Create a new empty repo: `jskarabot18/grape-resonances`. Public.
2. Don't initialise with README/license — the bundle has them.

Locally, in `~/Documents/jure/wine/`:

```bash
# Clone Region Resonances locally (or use your existing clone)
git clone https://github.com/jskarabot18/region-resonances.git grape-resonances
cd grape-resonances

# Detach from Region Resonances and point at the new repo
rm -rf .git
git init
git remote add origin https://github.com/jskarabot18/grape-resonances.git
git branch -M main
```

You now have Region Resonances' entire file tree, ready to be modified.

---

## Step 2 — Replace files from this bundle

The bundle contains the files that differ from Region Resonances. Copy
them in over the cloned tree, preserving paths.

### Files to **copy fresh** (replace what's there)

| From bundle                                           | To repo path                                       |
|-------------------------------------------------------|----------------------------------------------------|
| `app/package.json`                                    | `app/package.json`                                 |
| `app/vite.config.js`                                  | `app/vite.config.js`                               |
| `app/src/App.jsx`                                     | `app/src/App.jsx`                                  |
| `app/src/components/Header.jsx`                       | `app/src/components/Header.jsx`                    |
| `app/src/lib/aggregator.js`                           | `app/src/lib/aggregator.js`                        |
| `app/src/lib/coherence.js`                            | `app/src/lib/coherence.js`                         |
| `app/src/lib/useGrapeData.js`                         | `app/src/lib/useGrapeData.js`                      |
| `app/src/components/OracleResponse.jsx`               | `app/src/components/OracleResponse.jsx`            |
| `app/src/components/TraceFold.jsx`                    | `app/src/components/TraceFold.jsx`                 |
| `app/src/components/VerificationPrompt.jsx`           | `app/src/components/VerificationPrompt.jsx`        |
| `app/public/data/region_grapes.json`                  | `app/public/data/region_grapes.json`               |
| `app/public/data/grape_narratives.json`               | `app/public/data/grape_narratives.json`            |
| `app/public/data/cluster_framings.json`               | `app/public/data/cluster_framings.json`            |
| `app/public/data/grape_aliases.json`                  | `app/public/data/grape_aliases.json`               |
| `app/public/data/layer1_narratives.json`              | `app/public/data/layer1_narratives.json`           |
| `README.md`                                           | `README.md`                                        |

### Files to **delete** (no longer used)

The Grape Resonances surface is the oracle response, not region cards.
The Region Resonances result components are gone:

```bash
rm app/src/components/ResultsPanel.jsx
rm app/src/components/BrowseMode.jsx
# Anything else in components/ that's specifically region-card UI.
# Check with: ls app/src/components/ — anything not in Step 2's
# "files to copy fresh" list above is fair game to inspect.
```

Region Resonances' `app/public/data/region_embeddings.json` **stays** —
the matcher still consumes it. So does anything in `app/public/docs/`
(Region Resonances' PDFs are not used here, but they don't conflict;
strip them if you want a cleaner repo).

### Files to **edit lightly** (small targeted changes)

These need a one- or two-line tweak rather than full replacement. Diffs
shown as before/after lines.

**`app/index.html`** — title and meta description only.

```diff
-    <title>Region Resonances · A Correspondence of Vinotheca</title>
-    <meta
-      name="description"
-      content="A Vinotheca companion tool that matches user-entered metaphors to wine regions via semantic similarity."
-    />
+    <title>Grape Resonances · A Correspondence of Vinotheca</title>
+    <meta
+      name="description"
+      content="A Vinotheca Correspondence tool that returns the grapes which resonate with a user-entered feeling, phrase, or situation."
+    />
```

(If there's a favicon `<link>` pointing at `/region-resonances/favicon.svg`,
change to `/grape-resonances/favicon.svg`. If you've kept the same favicon
file, just copy it across; otherwise leave the line — a missing favicon
is silent.)

**`.github/workflows/deploy.yml`** — usually no change needed. The
workflow runs `npm run build` and uploads `app/dist/` to GitHub Pages;
the repo name is implicit, the workflow doesn't reference it.

### Files to **keep as-is** from Region Resonances

These do not change. Don't touch them:

- `app/src/main.jsx`
- `app/src/index.css` (or whatever the base stylesheet is called)
- `app/src/components/Footer.jsx`
- `app/src/components/InputPanel.jsx`
- `app/src/lib/useEmbeddings.js`
- `app/src/lib/useDebouncedValue.js`
- `app/src/lib/api.js`
- `app/src/lib/matcher.js`
- `app/tailwind.config.js`
- `app/postcss.config.js`
- `app/public/data/region_embeddings.json`
- `LICENSE`

---

## Step 3 — Sanity checks before commit

```bash
# Confirm the new lib modules are in place
ls app/src/lib/aggregator.js app/src/lib/coherence.js app/src/lib/useGrapeData.js

# Confirm the five data files are in public/data/
ls app/public/data/region_grapes.json \
   app/public/data/grape_narratives.json \
   app/public/data/cluster_framings.json \
   app/public/data/grape_aliases.json \
   app/public/data/layer1_narratives.json

# Confirm Header.jsx says "Grape Resonances", not "Region Resonances"
grep -c "Grape Resonances" app/src/components/Header.jsx
# expect: ≥ 2  (wordmark + topstrip)

# Confirm App.jsx imports OracleResponse, not ResultsPanel
grep "OracleResponse\|ResultsPanel" app/src/App.jsx
# expect: import line for OracleResponse; no ResultsPanel anywhere

# Confirm vite.config.js base path
grep "base:" app/vite.config.js
# expect: base: '/grape-resonances/',
```

If all four pass, you're good to commit.

---

## Step 4 — Install, build, and dev-test

```bash
cd app
npm install            # picks up package.json with the new name
npm run dev            # opens http://localhost:5173 by default
```

Test queries (the three locked worked examples):

| Query                                          | Expected response                                      |
|-----------------------------------------------|--------------------------------------------------------|
| `falling deeply in love`                       | Pinot Noir (strong recurrence, Old World Interior cluster framing) |
| `the feeling of brotherhood`                   | Likely Syrah alone (revised from the Planning Doc — see findings) |
| `making a decision about the move across the country` | Riesling + Chenin Blanc (multi-bullseye, prism cluster framing) |

The matched-region set will depend on what the live embedding match
returns. The aggregator behaves correctly on whatever the matcher
returns; the worked-example responses are the *typical* outputs, not
guaranteed outputs.

Expand the trace fold on each response to confirm it shows the grape
narrative, contributing regions with similarity scores and cluster
metaphors, and the cross-link to Region Resonances at the bottom.

---

## Step 5 — Commit and push

```bash
cd ..   # back to repo root
git add .
git status
# Confirm: only the files listed in Step 2 appear as added/modified;
# nothing stray.

git commit -m "Initial Grape Resonances scaffold (forked from Region Resonances)"
git push -u origin main
```

---

## Step 6 — Enable GitHub Pages

In the new repo's Settings → Pages:

- Source: GitHub Actions
- The workflow will run on push to `main`. Watch the Actions tab; the
  first build is typically 1–3 minutes.

Once deployed, hard-refresh `https://jskarabot18.github.io/grape-resonances/`
to confirm.

---

## Step 7 — Cross-link from parent Vinotheca

Edit `vinotheca/index.html` to add Grape Resonances to the Correspondence
subsection alongside Region Resonances. The pattern matches Region
Resonances' card; copy that card and adjust title, eyebrow, and href.

---

## Step 8 — Update PROJECT.md

When the deploy is verified live:

1. Move §6.3 (Grape Resonances) into §7 (Recently completed) as a closed
   entry with the date.
2. Update §3 leaves table: Grape Resonances row from `Planned — see §6.3`
   to `Live`; repo column from `grape-resonances` (tbd) to
   `grape-resonances`.
3. Append a v0.22 entry to §8 (Document changelog).

Draft text for the §7 entry and the v0.22 changelog entry is in
`PROJECT_MD_EDITS.md` in this bundle.

---

## Step 9 — Followups (not blocking)

- **Author the four PDF documents** — Summary, Methods Primer, Technical
  Appendix, Data Appendix. The doc-menu hrefs in Header.jsx currently
  point at `app/public/docs/grape-resonances-*.pdf` which 404 until the
  PDFs land. Pattern mirrors Region Resonances' PDF set; LaTeX templates
  in the existing `region-resonances/docs-source/` are adaptable.
- **Update Planning Doc with the brotherhood finding** — the Planning
  Doc's "the feeling of brotherhood" worked example predicted Grenache ·
  Gamay · Shiraz, but with Tier 1 + alias resolution (Shiraz → Syrah) +
  recurrence-as-finding, the rule lands on Syrah alone. Worth a short
  amendment to the Planning Doc's "Worked examples" section noting the
  revision against actual data.
- **Local cleanup** — once the new repo is verified live, consider
  whether `working_files/` (held alongside the planning docs locally)
  should be archived; the data files in it are duplicated in
  `grape-resonances/app/public/data/` now.

---

## Findings from sub-item 4 worth noting in the §7 entry

1. **Brotherhood's worked example didn't survive contact with the data.**
   The Planning Doc predicted Grenache · Gamay · Shiraz; the actual rule
   on plausible match sets returns Syrah alone (3-region strong
   recurrence). Not a bug — the rule doing its job. The Planning Doc
   may want a "revised against curated data" addendum.

2. **The genuine silent-skip case is rarer than expected.** With the
   alias table in place, almost every region contributes at least one
   canonical grape via a signature spelling or alias. Etna contributes
   Nerello Mascalese (canonical); Catalonia contributes Grenache and
   Carignan via Garnatxa/Carinyena aliases; Sardinia contributes
   Grenache via Cannonau. The only path that skips a region is when
   *every* signature canonicalises away — in the current curation, this
   requires regions like Liguria where only one of three signatures
   (Vermentino) survives canonicalisation, which doesn't actually
   silent-skip the region.

3. **Pinot Noir is signature in 8 of 59 regions, not 5.** The Planning
   Doc's "falling deeply in love" worked example assumed 5 specific
   matched regions; with the actual data, Pinot Noir is signature in
   Burgundy, Champagne, Patagonia, Central Otago, Sonoma, Santa
   Barbara, Santa Cruz Mountains, and Willamette Valley. The recurrence
   rule still returns Pinot Noir alone regardless of which subset the
   matcher surfaces, as long as ≥3 of them appear.
