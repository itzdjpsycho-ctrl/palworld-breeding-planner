import type { CSSProperties } from 'react';
import { primaryTypeColor } from './typeColors';

/** Semi-transparent "glass" tint/border/glow for a card, colored by the Pal's primary type. */
export function glassStyle(types: string[]): CSSProperties {
  const color = primaryTypeColor(types);
  return {
    background: `linear-gradient(160deg, ${color}2E 0%, var(--bg-card) 62%)`,
    borderColor: `${color}66`,
    ['--glow' as string]: `${color}59`,
  };
}
