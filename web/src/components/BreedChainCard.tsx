import { PALS, type BreedChain } from '../lib/breeding';
import { PalImage } from './PalImage';

function ChainPal({ idx, highlighted }: { idx: number; highlighted: boolean }) {
  const pal = PALS[idx];
  return (
    <div className="chain-pal">
      <PalImage pal={pal} size={40} />
      <span className={highlighted ? 'chain-pal-name owned' : 'chain-pal-name'}>{pal.name}</span>
    </div>
  );
}

/** One breeding chain rendered as a vertical list of "A + B = C" steps. */
export function BreedChainCard({ chain, highlightIdxs }: { chain: BreedChain; highlightIdxs: number[] }) {
  const owned = new Set(highlightIdxs);
  return (
    <div className="chain-card">
      {chain.steps.map((step, i) => (
        <div className="chain-step" key={i}>
          <span className="chain-check">✓</span>
          <ChainPal idx={step.aIdx} highlighted={owned.has(step.aIdx)} />
          <span className="chain-op">+</span>
          <ChainPal idx={step.bIdx} highlighted={owned.has(step.bIdx)} />
          <span className="chain-op">=</span>
          <ChainPal idx={step.childIdx} highlighted={owned.has(step.childIdx)} />
        </div>
      ))}
    </div>
  );
}
