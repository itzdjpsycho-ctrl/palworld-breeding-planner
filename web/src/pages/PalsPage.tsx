import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PALS } from '../lib/breeding';
import { TypeBadges } from '../components/TypeBadge';
import { PalImage } from '../components/PalImage';
import { RarityBadge } from '../components/RarityBadge';
import { rarityTier } from '../lib/rarity';

export function PalsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [wildOnly, setWildOnly] = useState(false);

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
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [search, typeFilter, wildOnly]);

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
            style={{ borderTopColor: rarityTier(p.rarity).color }}
          >
            <div className="pal-grid-card-head">
              <PalImage pal={p} size={44} />
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
