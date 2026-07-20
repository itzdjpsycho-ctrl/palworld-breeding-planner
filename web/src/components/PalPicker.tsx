import { useMemo, useRef, useState } from 'react';
import { PALS, type Pal } from '../lib/breeding';
import { TypeBadges } from './TypeBadge';

interface Props {
  value: number | null;
  onChange: (idx: number) => void;
  placeholder?: string;
}

export function PalPicker({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected: Pal | null = value !== null ? PALS[value] : null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? PALS.filter((p) => p.name.toLowerCase().includes(q)) : PALS;
    return list
      .map((p) => ({ p, idx: PALS.indexOf(p) }))
      .sort((a, b) => a.p.name.localeCompare(b.p.name))
      .slice(0, 40);
  }, [query]);

  return (
    <div
      className="pal-picker"
      ref={containerRef}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <input
        type="text"
        className="pal-picker-input"
        placeholder={placeholder ?? 'Search for a Pal…'}
        value={open ? query : (selected?.name ?? '')}
        onFocus={() => {
          setOpen(true);
          setQuery('');
        }}
        onChange={(e) => setQuery(e.target.value)}
      />
      {open && (
        <ul className="pal-picker-list">
          {results.length === 0 && <li className="pal-picker-empty">No matches</li>}
          {results.map(({ p, idx }) => (
            <li key={p.id}>
              <button
                type="button"
                className="pal-picker-option"
                onClick={() => {
                  onChange(idx);
                  setOpen(false);
                  setQuery('');
                }}
              >
                <span className="pal-picker-option-name">{p.name}</span>
                <TypeBadges types={p.types} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
