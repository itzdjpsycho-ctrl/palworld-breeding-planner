import type { Pal } from '../lib/breeding';
import { PalImage } from './PalImage';
import { TypeBadges } from './TypeBadge';
import { RarityBadge } from './RarityBadge';
import { glassStyle } from '../lib/glass';

export function PalDetailHeader({ pal, label }: { pal: Pal; label?: string }) {
  return (
    <div className="pal-detail-header" style={glassStyle(pal.types)}>
      <PalImage pal={pal} size={72} />
      <div className="pal-detail-info">
        {label && <span className="result-label">{label}</span>}
        <h2>{pal.name}</h2>
        <TypeBadges types={pal.types} />
        <div className="pal-detail-meta">
          <RarityBadge rarity={pal.rarity} />
          <span>♂ {pal.maleProbability}% / ♀ {100 - pal.maleProbability}%</span>
          {!pal.wildCatchable && <span className="tag tag-breed">Breeding-exclusive</span>}
          {pal.wildCatchable && <span className="tag tag-wild">Catchable in the wild</span>}
        </div>
        {pal.description && <p className="pal-detail-description">{pal.description}</p>}
      </div>
    </div>
  );
}
