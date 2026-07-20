import palsData from '../data/pals.json';
import combosData from '../data/combos.json';
import parentPairsData from '../data/parentPairs.json';

export interface Pal {
  id: string;
  name: string;
  types: string[];
  rarity: number;
  maleProbability: number;
  isBoss: boolean;
  breedingExclusive: boolean;
  wildCatchable: boolean;
  description: string;
  image: string | null;
}

export type ParentPair = [number, number];

export const PALS: Pal[] = palsData as Pal[];
const COMBOS: number[][] = combosData as number[][];
const PARENT_PAIRS: ParentPair[][] = parentPairsData as ParentPair[][];

const idToIndex = new Map(PALS.map((p, i) => [p.id, i]));
const nameToIndex = new Map(PALS.map((p, i) => [p.name.toLowerCase(), i]));

export function indexOfId(id: string): number | undefined {
  return idToIndex.get(id);
}

export function indexOfName(name: string): number | undefined {
  return nameToIndex.get(name.toLowerCase());
}

/** The species produced by breeding two parents together (order doesn't matter). */
export function breedChild(aIdx: number, bIdx: number): Pal {
  return PALS[COMBOS[aIdx][bIdx]];
}

/** Every unordered pair of parents that produces the given target species. */
export function parentPairsFor(targetIdx: number): ParentPair[] {
  return PARENT_PAIRS[targetIdx] ?? [];
}

export interface PairOption {
  a: Pal;
  b: Pal;
  aIdx: number;
  bIdx: number;
  bothWildCatchable: boolean;
  difficulty: number; // lower = easier; sum of parent rarity, used purely to sort choices
}

/** Parent-pair choices for a target, sorted easiest-first. */
export function pairOptionsFor(targetIdx: number): PairOption[] {
  return parentPairsFor(targetIdx)
    .map(([aIdx, bIdx]) => {
      const a = PALS[aIdx];
      const b = PALS[bIdx];
      return {
        a,
        b,
        aIdx,
        bIdx,
        bothWildCatchable: a.wildCatchable && b.wildCatchable,
        difficulty: a.rarity + b.rarity,
      };
    })
    .sort((x, y) => {
      if (x.bothWildCatchable !== y.bothWildCatchable) return x.bothWildCatchable ? -1 : 1;
      if (x.difficulty !== y.difficulty) return x.difficulty - y.difficulty;
      return x.a.name.localeCompare(y.a.name);
    });
}
