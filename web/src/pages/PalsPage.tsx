import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PALS, type Pal } from '../lib/breeding';
import { TypeBadges } from '../components/TypeBadge';
import { PalImage } from '../components/PalImage';
import { RarityBadge } from '../components/RarityBadge';
import { glassStyle } from '../lib/glass';

type SortKey = 'name-asc' | 'name-desc' | 'rarity-asc' | 'rarity-desc' | 'type';

const SORTERS: Record<SortKey, (a: Pal, b: Pal) => number> = {
  'name-asc': (a, b) => a.name.localeCompare(b.name),
  'name-desc': (a, b) => b.name.localeCompare(a.name),
  'rarity-asc': (a, b) => a.rarity - b.rarity || a.name.localeCompare(b.name),
  'rarity-desc': (a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name),
  type: (a, b) =>
    (a.types[0] ?? '').localeCompare(b.types[0] ?? '') || a.name.localeCompare(b.name),
};

export function PalsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [wildOnly, setWildOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('name-asc');

  const allTypes = useMemo(() => {
    const s = new Set<string>();
    PALS.forEach((p) => p.types.forEach((t) => t && s.add(t)));
    return [...s].sort();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PALS.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (typeFilter && !p.types.includes(typeFilter)) return false;
      if (wildOnly && !p.wildCatchable) return false;
      return true;
    }).sort(SORTERS[sortKey]);
  }, [search, typeFilter, wildOnly, sortKey]);

  return (
    <div className="page">
      <h1>Pals</h1>
      <p className="page-intro">Browse all {PALS.length} breedable Pals in this dataset.</p>
      <div className="pals-filters">
        <input
          type="text"
          className="pair-search"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {allTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
          <option value="name-asc">Name (A → Z)</option>
          <option value="name-desc">Name (Z → A)</option>
          <option value="rarity-asc">Rarity (low → high)</option>
          <option value="rarity-desc">Rarity (high → low)</option>
          <option value="type">Type</option>
        </select>
        <label className="easy-toggle">
          <input type="checkbox" checked={wildOnly} onChange={(e) => setWildOnly(e.target.checked)} />
          Wild-catchable only
        </label>
      </div>
      <p className="pals-count">{filtered.length} Pals shown.</p>
      <div className="pals-grid">
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/breeding-plan?target=${p.id}`}
            className="pal-grid-card"
            style={glassStyle(p.types)}
          >
            <div className="pal-grid-card-head">
              <PalImage pal={p} size={56} />
              <div>
                <div className="parent-card-name">{p.name}</div>
                <TypeBadges types={p.types} />
              </div>
            </div>
            <div className="pal-grid-card-footer">
              <RarityBadge rarity={p.rarity} compact />
              {!p.wildCatchable && <span className="tag tag-breed tag-sm">Breeding-only</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
