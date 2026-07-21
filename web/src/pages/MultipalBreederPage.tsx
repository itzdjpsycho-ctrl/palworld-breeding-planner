import { useMemo, useState } from 'react';
import {
  PALS,
  findMultipalChains,
  possibleChildren,
  type MultipalResult,
} from '../lib/breeding';
import { PalPicker } from '../components/PalPicker';
import { PalImage } from '../components/PalImage';
import { BreedChainCard } from '../components/BreedChainCard';

interface ParentSlot {
  idx: number;
  locked: boolean;
}

const MAX_STATES_PRESETS = [
  { value: 200000, label: 'Default (200k)' },
  { value: 300000, label: 'Slightly Large (300k)' },
  { value: 500000, label: 'Large (500k)' },
  { value: 700000, label: 'Larger (700k)' },
  { value: 1000000, label: 'Crazy (1m)' },
];

export function MultipalBreederPage() {
  const [parents, setParents] = useState<ParentSlot[]>([]);
  const [adding, setAdding] = useState(false);
  const [targetIdx, setTargetIdx] = useState<number | null>(null);
  const [maxDepth, setMaxDepth] = useState(6);
  const [maxPaths, setMaxPaths] = useState(4);
  const [maxStates, setMaxStates] = useState(MAX_STATES_PRESETS[0].value);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<MultipalResult | null>(null);
  const [children, setChildren] = useState<ReturnType<typeof possibleChildren> | null>(null);

  const ownedIdxs = useMemo(() => parents.map((p) => p.idx), [parents]);
  const lockedIdxs = useMemo(() => parents.filter((p) => p.locked).map((p) => p.idx), [parents]);

  function addParent(idx: number) {
    setParents((prev) => (prev.some((p) => p.idx === idx) ? prev : [...prev, { idx, locked: false }]));
    setAdding(false);
    setResult(null);
    setChildren(null);
  }

  function removeParent(idx: number) {
    setParents((prev) => prev.filter((p) => p.idx !== idx));
    setResult(null);
    setChildren(null);
  }

  function toggleLock(idx: number) {
    setParents((prev) => prev.map((p) => (p.idx === idx ? { ...p, locked: !p.locked } : p)));
  }

  function handleCalculate() {
    if (parents.length === 0 || targetIdx === null) return;
    setChildren(null);
    setResult(
      findMultipalChains(ownedIdxs, targetIdx, {
        maxDepth,
        maxPaths,
        maxStates,
        lockedIdxs,
      }),
    );
  }

  function handleListChildren() {
    if (parents.length < 2) return;
    setResult(null);
    setChildren(possibleChildren(ownedIdxs, maxDepth));
  }

  const canCalculate = parents.length > 0 && targetIdx !== null;

  return (
    <div className="page">
      <h1>Multipal Breeder</h1>
      <p className="page-intro">
        Add the Pals you currently own, pick a Pal you want to end up with, and this finds
        breeding chains that get you there. Add just one parent to search across every Pal
        instead of a fixed pool. Lock a parent to force the chain to use it.
      </p>

      <div className="multipal-parents">
        {parents.map((p) => {
          const pal = PALS[p.idx];
          return (
            <div key={p.idx} className="multipal-parent-slot">
              <button
                type="button"
                className="multipal-remove-btn"
                onClick={() => removeParent(p.idx)}
                aria-label={`Remove ${pal.name}`}
                title={`Remove ${pal.name}`}
              >
                ×
              </button>
              <button
                type="button"
                className={`multipal-lock-btn${p.locked ? ' locked' : ''}`}
                onClick={() => toggleLock(p.idx)}
                aria-label={p.locked ? `Unlock ${pal.name}` : `Lock ${pal.name}`}
                title={p.locked ? 'Locked — must appear in the chain' : 'Unlocked — optional'}
              >
                {p.locked ? '🔒' : '🔓'}
              </button>
              <PalImage pal={pal} size={64} />
              <span className="multipal-parent-name">{pal.name}</span>
            </div>
          );
        })}
        <div className="multipal-add-slot">
          <button type="button" className="multipal-add-btn" onClick={() => setAdding((v) => !v)}>
            +<span>Add parents</span>
          </button>
          {adding && (
            <div className="multipal-add-picker">
              <PalPicker value={null} onChange={addParent} placeholder="Search for a Pal…" />
            </div>
          )}
        </div>
      </div>

      <div className="multipal-controls">
        <PalPicker value={targetIdx} onChange={setTargetIdx} placeholder="Desired child…" />
        <button type="button" className="btn-primary" disabled={!canCalculate} onClick={handleCalculate}>
          Calculate
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={parents.length < 2}
          onClick={handleListChildren}
        >
          List Possible Children
        </button>
      </div>

      <button type="button" className="advanced-toggle" onClick={() => setShowAdvanced((v) => !v)}>
        ⚙ Advanced
      </button>
      {showAdvanced && (
        <div className="advanced-panel">
          <label>
            Max breeds deep
            <input
              type="number"
              min={1}
              max={10}
              value={maxDepth}
              onChange={(e) => setMaxDepth(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
            />
          </label>
          <label>
            Max paths to find
            <input
              type="number"
              min={1}
              max={10}
              value={maxPaths}
              onChange={(e) => setMaxPaths(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
            />
          </label>
          <label>
            Search thoroughness
            <select value={maxStates} onChange={(e) => setMaxStates(Number(e.target.value))}>
              {MAX_STATES_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <p className="advanced-note">
            Max breeds deep applies to both Calculate and List Possible Children. By default, the
            calculator checks up to 200k potential chains. With a lot of owned Pals it might stop
            before finding a result — raise this to search further, at the cost of taking longer
            to calculate.
          </p>
        </div>
      )}

      {result && (
        <div className="multipal-results">
          {result.seedMode && parents.length === 1 && (
            <p className="empty-note">
              Only one parent selected — searching breeding chains across every Pal that pass
              through {PALS[parents[0].idx].name}.
            </p>
          )}
          {result.chains.length === 0 && (
            <p className="empty-note">
              No valid path found within {maxDepth} breed{maxDepth === 1 ? '' : 's'}
              {result.truncated ? ' (search limit reached — try fewer owned Pals or a lower max depth)' : ''}.
              Try increasing the max depth under Advanced, or add more owned Pals.
            </p>
          )}
          {result.chains.length > 0 && result.chains[0].steps.length === 0 && (
            <p className="empty-note">You already own that Pal — no breeding needed.</p>
          )}
          {result.chains.some((c) => c.steps.length > 0) && (
            <>
              <p className="pair-count">
                Found {result.chains.length} path{result.chains.length === 1 ? '' : 's'}.
              </p>
              <div className="multipal-chains-grid">
                {result.chains.map((chain, i) => (
                  <BreedChainCard key={i} chain={chain} highlightIdxs={ownedIdxs} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {children && (
        <div className="multipal-results">
          <p className="pair-count">
            {children.length} distinct Pal{children.length === 1 ? '' : 's'} reachable by breeding
            your current parents within {maxDepth} breed{maxDepth === 1 ? '' : 's'} — including
            multi-generation chains, not just direct pairs.
          </p>
          {children.length === 0 ? (
            <p className="empty-note">Add at least two parents to see what they can produce.</p>
          ) : (
            <div className="multipal-children-grid">
              {children.map(({ child, aIdx, bIdx, direct, depth }) => (
                <div key={child.id} className="multipal-child-card">
                  <PalImage pal={child} size={48} />
                  <div>
                    <div className="multipal-parent-name">{child.name}</div>
                    <div className="multipal-child-source">
                      from {PALS[aIdx].name} + {PALS[bIdx].name}
                      {!direct && ` (${depth} breeds)`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
