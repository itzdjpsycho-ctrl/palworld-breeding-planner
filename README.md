# Palworld Breeding Planner

A small web app for planning Palworld breeding chains: pick the Pal you want, and see
every parent-pair combination (and, for breeding-exclusive Pals, a drill-down tree of
how to breed *their* parents too).

Live app: https://itzdjpsycho-ctrl.github.io/palworld-breeding-planner/

## Pages

- **Breeding Plan** — pick a goal Pal, browse every parent pair that produces it, and
  expand any breeding-exclusive parent to see how to get that one as well.
- **Pair Calculator** — pick any two Pals and see exactly what breeding them produces.
- **Pals** — browse/search/filter all breedable Pals.

## Project layout

- `palworld_breeding_data.csv`, `palworld_pals_full.json` — source Pal stats/metadata.
- `data-src/` — the breeding outcome matrix used as ground truth (see Credits below).
- `web/` — the React + Vite app. See `web/scripts/build-data.mjs` for how the raw
  sources are merged into `web/src/data/*.json` at build time.

## Development

```bash
cd web
npm install
npm run dev
```

To regenerate `web/src/data/*.json` after changing any source file:

```bash
node web/scripts/build-data.mjs
```

Deployment to GitHub Pages happens automatically on push to `main` via
`.github/workflows/deploy.yml`.

## Credits

Breeding outcomes are computed from `data-src/AllCombos.csv` and `data-src/Pals.csv`,
extracted from Palworld's game files by
[beckerfelipee/PalworldBreedingCalculator](https://github.com/beckerfelipee/PalworldBreedingCalculator)
(MIT License, see `data-src/PalworldBreedingCalculator-LICENSE.txt`). This encodes
Pocketpair's special-combo overrides directly, which a formula-only approach can't
reproduce.

Not affiliated with Pocketpair. Palworld and all Pal names/data are property of
Pocketpair, Inc.
