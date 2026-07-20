export const TYPE_COLORS: Record<string, string> = {
  normal: '#9CA3AF',
  fire: '#F0623C',
  water: '#3B9BF0',
  grass: '#5FB84E',
  electric: '#F0C93C',
  ice: '#5CCBD6',
  ground: '#B08454',
  dark: '#7C5CC9',
  dragon: '#8C5CF0',
  neutral: '#9CA3AF',
};

export function typeColor(type: string): string {
  return TYPE_COLORS[type] || '#6B7280';
}

/** The color representing a Pal's primary (first-listed) type. */
export function primaryTypeColor(types: string[]): string {
  return typeColor(types[0] ?? '');
}
