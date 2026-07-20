// Builds web/src/data/{pals.json,combos.json} from the raw source files in the repo root.
//
// Sources:
//  - ../../palworld_breeding_data.csv   (id/name/types/rarity/breedable, user-provided)
//  - ../../palworld_pals_full.json      (full pal stats incl. zukanIndexSuffix, user-provided)
//  - ../../data-src/Pals.csv            (289 pal names, row/column order for the matrix)
//  - ../../data-src/AllCombos.csv       (289x289 breeding outcome matrix, semicolon separated)
//
// The matrix (MIT licensed, from github.com/beckerfelipee/PalworldBreedingCalculator) is the
// ground truth for breeding outcomes: it already bakes in Pocketpair's special-combo overrides
// (e.g. Relaxaurus x Sparkit -> Relaxaurus Lux) that the combi-rank formula alone can't produce.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

// A few names differ by a single letter/typo between the two source datasets.
const NAME_ALIASES = {
  'Ribunny': 'Ribbuny',
  'Ribunny Botan': 'Ribbuny Botan',
};
// Matrix-only entry with no equivalent row in our full stats dataset; map it to its closest match.
const ID_OVERRIDES = {
  'Gumoss (Special)': { id: 'boss_plantslime_flower', displayName: 'Gumoss (Special)' },
};

function parseCsvLine(line) {
  return line.split(',');
}

function loadBreedingCsv() {
  const text = readFileSync(path.join(ROOT, 'palworld_breeding_data.csv'), 'utf8').trim();
  const [, ...lines] = text.split(/\r?\n/);
  return lines.map((line) => {
    const c = parseCsvLine(line);
    return {
      id: c[0],
      name: c[1],
      types: c[2].split('|'),
      rarity: Number(c[3]),
      combiRank: Number(c[4]),
      maleProbability: Number(c[6]),
      breedable: c[7] === 'true',
      isBoss: c[8] === 'true',
      isRaidBoss: c[9] === 'true',
    };
  });
}

function loadFullJson() {
  const raw = readFileSync(path.join(ROOT, 'palworld_pals_full.json'), 'utf8');
  return JSON.parse(raw);
}

function loadMatrix() {
  const names = readFileSync(path.join(ROOT, 'data-src', 'Pals.csv'), 'utf8')
    .replace(/^﻿/, '')
    .trim()
    .split(/\r?\n/)
    .map((s) => s.trim());
  const rows = readFileSync(path.join(ROOT, 'data-src', 'AllCombos.csv'), 'utf8')
    .replace(/^﻿/, '')
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(';').map((s) => s.trim()));
  return { names, rows };
}

function main() {
  const breedingRows = loadBreedingCsv();
  const fullJson = loadFullJson();
  const { names: matrixNames, rows: matrix } = loadMatrix();

  const byName = new Map(breedingRows.map((r) => [r.name, r]));
  const fullByName = new Map(fullJson.map((p) => [p.name, p]));
  const fullById = new Map(fullJson.map((p) => [p.id, p]));

  const pals = matrixNames.map((matrixName) => {
    const override = ID_OVERRIDES[matrixName];
    const lookupName = NAME_ALIASES[matrixName] ?? matrixName;

    const csvRow = byName.get(lookupName);
    const fullRow = override ? fullById.get(override.id) : fullByName.get(lookupName);

    if (!fullRow) {
      throw new Error(`No metadata found for matrix pal "${matrixName}"`);
    }

    const breedingExclusive = fullRow.zukanIndexSuffix === 'B';

    return {
      id: fullRow.id,
      name: override?.displayName ?? matrixName,
      types: csvRow ? csvRow.types : fullRow.type,
      rarity: csvRow ? csvRow.rarity : fullRow.rarity,
      maleProbability: csvRow ? csvRow.maleProbability : fullRow.maleProbability,
      isBoss: !!fullRow.isBoss,
      breedingExclusive,
      wildCatchable: !breedingExclusive,
    };
  });

  const nameToIndex = new Map(matrixNames.map((n, i) => [n, i]));
  const combos = matrix.map((row) =>
    row.map((childName) => {
      const idx = nameToIndex.get(childName);
      if (idx === undefined) {
        throw new Error(`Unknown child pal "${childName}" in combo matrix`);
      }
      return idx;
    }),
  );

  // Reverse index: for each child pal index, every unordered parent-index pair that produces it.
  const reverse = pals.map(() => []);
  for (let i = 0; i < combos.length; i++) {
    for (let j = i; j < combos[i].length; j++) {
      const childIdx = combos[i][j];
      reverse[childIdx].push([i, j]);
    }
  }

  const outDir = path.join(__dirname, '..', 'src', 'data');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, 'pals.json'), JSON.stringify(pals));
  writeFileSync(path.join(outDir, 'combos.json'), JSON.stringify(combos));
  writeFileSync(path.join(outDir, 'parentPairs.json'), JSON.stringify(reverse));

  console.log(`Wrote ${pals.length} pals, ${combos.length}x${combos[0].length} combo matrix.`);
}

main();
