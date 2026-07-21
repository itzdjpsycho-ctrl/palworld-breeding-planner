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

export interface BreedStep {
  aIdx: number;
  bIdx: number;
  childIdx: number;
}

export interface BreedChain {
  steps: BreedStep[];
}

export interface MultipalResult {
  /** Empty array means the target is already one of the owned Pals (no breeding needed). */
  chains: BreedChain[];
  /** True if the search space was capped before it could fully prove "no path exists". */
  truncated: boolean;
  /** True when the search fell back to the single-seed mode (only one owned Pal given). */
  seedMode: boolean;
}

const DEFAULT_MAX_DEPTH = 6;
const DEFAULT_MAX_PATHS = 4;
const DEFAULT_MAX_STATES = 200000;

function sortedUnique(idxs: number[]): number[] {
  return [...new Set(idxs)].sort((a, b) => a - b);
}

/**
 * Forward search: starting from exactly the given owned Pals (no outside help), repeatedly
 * breed any two currently-available Pals and add the result to the pool, looking for breeding
 * chains that produce the target. Requires 2+ owned Pals, since a single Pal has no partner to
 * breed with. Keeps searching deeper (up to maxDepth) even after the first chain is found, so
 * that shorter chains are always listed first but alternative, slightly longer routes are
 * still surfaced up to maxPaths — rather than stopping at the very first depth with any hit.
 */
function findChainsFromInventory(
  ownedIdxs: number[],
  targetIdx: number,
  requiredIdxs: number[],
  maxDepth: number,
  maxPaths: number,
  maxStates: number,
): { chains: BreedChain[]; truncated: boolean } {
  const startArr = sortedUnique(ownedIdxs);
  if (startArr.includes(targetIdx)) return { chains: [{ steps: [] }], truncated: false };

  let frontier: { arr: number[]; steps: BreedStep[] }[] = [{ arr: startArr, steps: [] }];
  const visited = new Set<string>([startArr.join(',')]);
  let statesExplored = 0;
  let truncated = false;
  const results: BreedChain[] = [];

  const qualifies = (steps: BreedStep[]) =>
    requiredIdxs.every((r) => steps.some((s) => s.aIdx === r || s.bIdx === r));

  for (let depth = 0; depth < maxDepth && results.length < maxPaths; depth++) {
    const nextFrontier: { arr: number[]; steps: BreedStep[] }[] = [];

    frontierLoop: for (const entry of frontier) {
      const arr = entry.arr;
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const a = arr[i];
          const b = arr[j];
          const childIdx = COMBOS[a][b];
          if (arr.includes(childIdx)) continue;

          const newArr = [...arr, childIdx].sort((x, y) => x - y);
          const key = newArr.join(',');
          if (visited.has(key)) continue;
          visited.add(key);
          statesExplored++;

          const steps = [...entry.steps, { aIdx: a, bIdx: b, childIdx }];
          if (childIdx === targetIdx) {
            if (qualifies(steps)) {
              results.push({ steps });
              if (results.length >= maxPaths) break frontierLoop;
            }
          } else {
            nextFrontier.push({ arr: newArr, steps });
          }

          if (statesExplored > maxStates) {
            truncated = true;
            break frontierLoop;
          }
        }
      }
    }

    if (truncated || nextFrontier.length === 0) break;
    frontier = nextFrontier;
  }

  return { chains: results, truncated };
}

/**
 * Backward search: starting from the target, walk its parent-pair options (cheapest/most
 * wild-catchable first) looking for the shortest ancestry line that passes through the seed
 * Pal, treating every other parent along the way as freely obtainable. Used when only one
 * owned Pal is given, matching "search across all Pals" rather than a fixed inventory.
 */
function findChainToSeed(seedIdx: number, targetIdx: number, maxDepth: number): BreedChain | null {
  if (seedIdx === targetIdx) return { steps: [] };

  const memo = new Map<number, { dist: number; aIdx: number; bIdx: number; via: 'a' | 'b' } | null>();
  const visiting = new Set<number>();

  function distanceFrom(node: number): number {
    return node === seedIdx ? 0 : (solve(node)?.dist ?? Infinity);
  }

  function solve(node: number): { dist: number; aIdx: number; bIdx: number; via: 'a' | 'b' } | null {
    if (memo.has(node)) return memo.get(node) ?? null;
    if (visiting.has(node)) return null;
    visiting.add(node);

    let best: { dist: number; aIdx: number; bIdx: number; via: 'a' | 'b' } | null = null;
    for (const opt of pairOptionsFor(node)) {
      const da = distanceFrom(opt.aIdx);
      const db = distanceFrom(opt.bIdx);
      const via: 'a' | 'b' = da <= db ? 'a' : 'b';
      const d = 1 + Math.min(da, db);
      if (d <= maxDepth && (!best || d < best.dist)) {
        best = { dist: d, aIdx: opt.aIdx, bIdx: opt.bIdx, via };
        if (best.dist === 1) break;
      }
    }
    visiting.delete(node);
    memo.set(node, best);
    return best;
  }

  const result = solve(targetIdx);
  if (!result) return null;

  const backward: BreedStep[] = [];
  let cur = targetIdx;
  while (cur !== seedIdx) {
    const r = memo.get(cur);
    if (!r) break;
    backward.push({ aIdx: r.aIdx, bIdx: r.bIdx, childIdx: cur });
    cur = r.via === 'a' ? r.aIdx : r.bIdx;
  }
  backward.reverse();
  return { steps: backward };
}

export interface MultipalOptions {
  maxDepth?: number;
  maxPaths?: number;
  maxStates?: number;
  lockedIdxs?: number[];
}

/**
 * Find breeding chains from a pool of owned Pals to a target. With 2+ owned Pals, only those
 * Pals (plus whatever they produce along the way) are used. With exactly 1 owned Pal, the
 * search instead looks across every Pal for the shortest ancestry line that uses it.
 */
export function findMultipalChains(
  ownedIdxs: number[],
  targetIdx: number,
  options: MultipalOptions = {},
): MultipalResult {
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const maxPaths = options.maxPaths ?? DEFAULT_MAX_PATHS;
  const maxStates = options.maxStates ?? DEFAULT_MAX_STATES;
  const owned = sortedUnique(ownedIdxs);

  if (owned.length <= 1) {
    const seedIdx = owned[0];
    const chain = seedIdx === undefined ? null : findChainToSeed(seedIdx, targetIdx, maxDepth);
    return { chains: chain ? [chain] : [], truncated: false, seedMode: true };
  }

  const lockedIdxs = (options.lockedIdxs ?? []).filter((i) => owned.includes(i));
  const { chains, truncated } = findChainsFromInventory(
    owned,
    targetIdx,
    lockedIdxs,
    maxDepth,
    maxPaths,
    maxStates,
  );
  return { chains, truncated, seedMode: false };
}

export interface ReachablePal {
  child: Pal;
  aIdx: number;
  bIdx: number;
  /** True if both parents shown are Pals you own; false if one is a Pal you'd need to breed first. */
  direct: boolean;
  /** Number of breeding generations needed to reach this Pal from the owned pool. */
  depth: number;
}

/**
 * Every distinct Pal reachable by repeatedly breeding from the owned pool within maxDepth
 * generations. Each new generation only breeds the just-produced Pal against the rest of the
 * pool (rather than re-combining every earlier intermediate with every other one) — this
 * mirrors how you'd actually breed forward from your latest hatch, and keeps the reachable set
 * from ballooning into pairings that don't represent a realistic breeding order.
 */
export function possibleChildren(ownedIdxs: number[], maxDepth = DEFAULT_MAX_DEPTH): ReachablePal[] {
  const owned = sortedUnique(ownedIdxs);
  const ownedSet = new Set(owned);
  const found = new Map<number, { aIdx: number; bIdx: number; depth: number }>();

  type State = { pool: number[]; lastAdded: number | null; depth: number };
  const queue: State[] = [{ pool: owned, lastAdded: null, depth: 0 }];
  const visitedStates = new Set<string>([owned.join(',')]);

  for (let qi = 0; qi < queue.length; qi++) {
    const { pool, lastAdded, depth } = queue[qi];
    const pairs: [number, number][] = [];
    if (lastAdded === null) {
      for (let i = 0; i < pool.length; i++)
        for (let j = i + 1; j < pool.length; j++) pairs.push([pool[i], pool[j]]);
    } else {
      for (const p of pool) if (p !== lastAdded) pairs.push([lastAdded, p]);
    }

    for (const [a, b] of pairs) {
      const childIdx = COMBOS[a][b];
      if (!found.has(childIdx) && !ownedSet.has(childIdx)) {
        found.set(childIdx, { aIdx: a, bIdx: b, depth: depth + 1 });
      }
      if (!pool.includes(childIdx) && depth + 1 < maxDepth) {
        const newPool = [...pool, childIdx].sort((x, y) => x - y);
        const key = childIdx + '|' + newPool.join(',');
        if (!visitedStates.has(key)) {
          visitedStates.add(key);
          queue.push({ pool: newPool, lastAdded: childIdx, depth: depth + 1 });
        }
      }
    }
  }

  const results: ReachablePal[] = [];
  for (const [idx, pair] of found) {
    results.push({
      child: PALS[idx],
      aIdx: pair.aIdx,
      bIdx: pair.bIdx,
      direct: pair.depth === 1,
      depth: pair.depth,
    });
  }
  return results.sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.child.name.localeCompare(b.child.name);
  });
}
