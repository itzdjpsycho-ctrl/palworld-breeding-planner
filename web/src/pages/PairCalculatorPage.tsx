import { useMemo, useState } from 'react';
import { PALS, breedChild } from '../lib/breeding';
import { PalPicker } from '../components/PalPicker';
import { PalDetailHeader } from '../components/PalDetailHeader';

export function PairCalculatorPage() {
  const [aIdx, setAIdx] = useState<number | null>(null);
  const [bIdx, setBIdx] = useState<number | null>(null);

  const child = useMemo(() => {
    if (aIdx === null || bIdx === null) return null;
    return breedChild(aIdx, bIdx);
  }, [aIdx, bIdx]);

  return (
    <div className="page">
      <h1>Pair Calculator</h1>
      <p className="page-intro">Pick two Pals to see exactly what breeding them together produces.</p>
      <div className="pair-calc-inputs">
        <PalPicker value={aIdx} onChange={setAIdx} placeholder="First parent…" />
        <div className="pair-plus">+</div>
        <PalPicker value={bIdx} onChange={setBIdx} placeholder="Second parent…" />
      </div>

      {child && (
        <div className="plan-target pair-calc-result">
          <PalDetailHeader pal={child} label="Produces" />
        </div>
      )}

      <p className="pals-count">{PALS.length} breedable Pals in this dataset.</p>
    </div>
  );
}
