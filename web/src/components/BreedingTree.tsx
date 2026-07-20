import { useMemo, useState } from 'react';
import { PALS, pairOptionsFor, type Pal, type PairOption } from '../lib/breeding';
import { TypeBadges } from './TypeBadge';
import { PalImage } from './PalImage';

const PAGE_SIZE = 12;
const MAX_DEPTH = 6;

function RarityDots({ rarity }: { rarity: number }) {
  return <span className="rarity" title={`Rarity ${rarity}`}>★ {rarity}</span>;
}

function ParentCard({
  idx,
  ancestors,
  depth,
}: {
  idx: number;
  ancestors: number[];
  depth: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const pal: Pal = PALS[idx];
  const canExpand = depth < MAX_DEPTH && !ancestors.includes(idx);

  return (
    <div className="parent-card">
      <div className="parent-card-head">
        <PalImage pal={pal} size={40} />
        <div className="parent-card-info">
          <div className="parent-card-name">{pal.name}</div>
          <TypeBadges types={pal.types} />
        </div>
        <RarityDots rarity={pal.rarity} />
      </div>
      {pal.wildCatchable ? (
        <div className="tag tag-wild">Catchable in the wild</div>
      ) : (
        <div className="tag tag-breed">Breeding-exclusive</div>
      )}
      {canExpand && (
        <button type="button" className="expand-btn" onClick={() => setExpanded((v) => !v)}>
          {expanded ? '▾ Hide breeding options' : `▸ How to breed ${pal.name}`}
        </button>
      )}
      {expanded && (
        <div className="nested-tree">
          <PairChoiceList targetIdx={idx} ancestors={[...ancestors, idx]} depth={depth + 1} />
        </div>
      )}
    </div>
  );
}

export function PairChoiceList({
  targetIdx,
  ancestors,
  depth,
}: {
  targetIdx: number;
  ancestors: number[];
  depth: number;
}) {
  const [easyOnly, setEasyOnly] = useState(true);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allOptions = useMemo(() => pairOptionsFor(targetIdx), [targetIdx]);

  const validOptions = useMemo(
    () => allOptions.filter((o) => !ancestors.includes(o.aIdx) && !ancestors.includes(o.bIdx)),
    [allOptions, ancestors],
  );

  const filtered = useMemo(() => {
    let list = validOptions;
    if (easyOnly) list = list.filter((o) => o.bothWildCatchable);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) => o.a.name.toLowerCase().includes(q) || o.b.name.toLowerCase().includes(q),
      );
    }
    return list;
  }, [validOptions, easyOnly, search]);

  const easyCount = validOptions.filter((o) => o.bothWildCatchable).length;
  const visible = filtered.slice(0, visibleCount);

  if (validOptions.length === 0) {
    return (
      <p className="empty-note">
        No breeding pairs found (this Pal may only be obtainable another way, e.g. capture).
      </p>
    );
  }

  return (
    <div className="pair-choice-list">
      <div className="pair-choice-controls">
        <label className="easy-toggle">
          <input
            type="checkbox"
            checked={easyOnly}
            onChange={(e) => {
              setEasyOnly(e.target.checked);
              setVisibleCount(PAGE_SIZE);
            }}
          />
          Only pairs catchable in the wild ({easyCount})
        </label>
        <input
          type="text"
          className="pair-search"
          placeholder="Filter by parent name…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
        />
      </div>
      <p className="pair-count">
        {filtered.length} combination{filtered.length === 1 ? '' : 's'} produce this Pal
        {easyOnly ? ' (wild-catchable parents only)' : ''}.
      </p>
      <ul className="pair-list">
        {visible.map((o: PairOption) => (
          <li key={`${o.aIdx}-${o.bIdx}`} className="pair-item">
            <ParentCard idx={o.aIdx} ancestors={ancestors} depth={depth} />
            <div className="pair-plus">+</div>
            <ParentCard idx={o.bIdx} ancestors={ancestors} depth={depth} />
          </li>
        ))}
      </ul>
      {filtered.length > visible.length && (
        <button
          type="button"
          className="show-more-btn"
          onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
        >
          Show {Math.min(PAGE_SIZE, filtered.length - visible.length)} more
        </button>
      )}
    </div>
  );
}

export function BreedingTree({ targetIdx }: { targetIdx: number }) {
  return <PairChoiceList targetIdx={targetIdx} ancestors={[targetIdx]} depth={1} />;
}
