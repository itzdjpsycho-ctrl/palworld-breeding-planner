import { useId, useState } from 'react';
import type { Pal } from '../lib/breeding';
import { typeColor } from '../lib/typeColors';

// Heart outline in a 0-100 viewBox, used both to clip the Pal art and to draw the
// glowing neon frame around it.
const HEART_PATH =
  'M50 90C50 90 8 61 8 31C8 11 24 0 40 0C48 0 50 9 50 19C50 9 52 0 60 0C76 0 92 11 92 31C92 61 50 90 50 90Z';

interface Props {
  pal: Pal;
  size?: number;
}

export function PalImage({ pal, size = 40 }: Props) {
  const [failed, setFailed] = useState(false);
  const clipId = useId();
  const color = typeColor(pal.types[0] ?? '');
  const showImage = pal.image && !failed;

  return (
    <svg
      className="pal-heart"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={pal.name}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={HEART_PATH} />
        </clipPath>
      </defs>
      {showImage ? (
        <image
          href={pal.image ?? undefined}
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
          onError={() => setFailed(true)}
        />
      ) : (
        <g clipPath={`url(#${clipId})`}>
          <rect width="100" height="100" fill={`${color}33`} />
          <text
            x="50"
            y="64"
            textAnchor="middle"
            fontSize="44"
            fontWeight="700"
            fill={color}
            fontFamily="var(--display)"
          >
            {pal.name.charAt(0)}
          </text>
        </g>
      )}
      <path d={HEART_PATH} className="pal-heart-outline" />
    </svg>
  );
}
