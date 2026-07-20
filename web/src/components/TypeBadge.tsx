import { typeColor } from '../lib/typeColors';

export function TypeBadge({ type }: { type: string }) {
  if (!type) return null;
  const color = typeColor(type);
  return (
    <span
      className="type-badge"
      style={{ backgroundColor: `${color}26`, color, borderColor: `${color}55` }}
    >
      {type}
    </span>
  );
}

export function TypeBadges({ types }: { types: string[] }) {
  return (
    <span className="type-badges">
      {types.filter(Boolean).map((t) => (
        <TypeBadge key={t} type={t} />
      ))}
    </span>
  );
}
