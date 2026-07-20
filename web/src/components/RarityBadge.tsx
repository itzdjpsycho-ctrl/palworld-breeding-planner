import { rarityTier } from '../lib/rarity';

export function RarityBadge({ rarity, compact }: { rarity: number; compact?: boolean }) {
  const tier = rarityTier(rarity);
  return (
    <span
      className={compact ? 'rarity-badge rarity-badge-compact' : 'rarity-badge'}
      style={{ color: tier.color, backgroundColor: `${tier.color}22`, borderColor: `${tier.color}55` }}
      title={`${tier.label} (rarity ${rarity})`}
    >
      ★ {rarity}
      {!compact && ` ${tier.label}`}
    </span>
  );
}
