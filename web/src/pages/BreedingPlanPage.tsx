import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PALS, indexOfId } from '../lib/breeding';
import { PalPicker } from '../components/PalPicker';
import { PalDetailHeader } from '../components/PalDetailHeader';
import { BreedingTree } from '../components/BreedingTree';

export function BreedingPlanPage() {
  const [searchParams] = useSearchParams();
  const initialIdx = (() => {
    const id = searchParams.get('target');
    if (!id) return null;
    const idx = indexOfId(id);
    return idx ?? null;
  })();
  const [targetIdx, setTargetIdx] = useState<number | null>(initialIdx);
  const target = targetIdx !== null ? PALS[targetIdx] : null;

  return (
    <div className="page">
      <h1>Breeding Plan</h1>
      <p className="page-intro">
        Pick the Pal you want to end up with. You'll get every parent-pair combination that
        produces it — expand any breeding-exclusive parent to see how to breed that one too.
      </p>
      <div className="target-picker">
        <PalPicker value={targetIdx} onChange={setTargetIdx} placeholder="Choose your goal Pal…" />
      </div>

      {target && (
        <div className="plan-result">
          <div className="plan-target">
            <PalDetailHeader pal={target} />
          </div>
          <BreedingTree key={targetIdx} targetIdx={targetIdx as number} />
        </div>
      )}
    </div>
  );
}
