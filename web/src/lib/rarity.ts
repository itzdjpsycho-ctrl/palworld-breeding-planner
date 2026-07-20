export interface RarityTier {
  label: string;
  color: string;
}

// Palworld's own rarity stat ranges roughly 1-10 for standard Pals, then jumps to
// ~20 for the handful of ultra-rare/mythical ones (Jetragon, Paladius, etc).
const TIERS: { max: number; label: string; color: string }[] = [
  { max: 2, label: 'Common', color: '#9CA3AF' },
  { max: 4, label: 'Uncommon', color: '#4ADE80' },
  { max: 6, label: 'Rare', color: '#38BDF8' },
  { max: 8, label: 'Epic', color: '#C084FC' },
  { max: 10, label: 'Legendary', color: '#F0B429' },
  { max: Infinity, label: 'Mythical', color: '#F43F5E' },
];

export function rarityTier(rarity: number): RarityTier {
  const tier = TIERS.find((t) => rarity <= t.max) ?? TIERS[TIERS.length - 1];
  return { label: tier.label, color: tier.color };
}
