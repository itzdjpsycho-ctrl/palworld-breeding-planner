import { useState } from 'react';
import type { Pal } from '../lib/breeding';
import { typeColor } from '../lib/typeColors';

interface Props {
  pal: Pal;
  size?: number;
}

export function PalImage({ pal, size = 40 }: Props) {
  const [failed, setFailed] = useState(false);
  const color = typeColor(pal.types[0] ?? '');

  if (!pal.image || failed) {
    return (
      <div
        className="pal-image-fallback"
        style={{ width: size, height: size, backgroundColor: `${color}26`, color }}
      >
        {pal.name.charAt(0)}
      </div>
    );
  }

  return (
    <img
      className="pal-image"
      src={pal.image}
      alt={pal.name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
