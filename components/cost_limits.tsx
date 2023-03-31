import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import {
  readCostLimits,
  saveCostLimits,
  setAndSaveStateWrapper,
} from '@/engine/cookie';

export type EffectiveCostLimitsType = {
  witchPoints: number;
  diamonds: number;
};

export type CostLimitsType = {
  unlimited: boolean;
} & EffectiveCostLimitsType;

type CostLimitsProps = {
  editable: boolean;
  effectiveCostLimits: EffectiveCostLimitsType;
  setEffectiveCostLimits: Dispatch<SetStateAction<EffectiveCostLimitsType>>;
};

const CostLimits = ({
  editable,
  effectiveCostLimits,
  setEffectiveCostLimits,
}: CostLimitsProps) => {
  const defaultCostLimits = {
    unlimited: false,
    witchPoints: 1000,
    diamonds: 0,
  };

  const [costLimit, setCostLimit] = useState<CostLimitsType>(defaultCostLimits);

  useEffect(() => {
    const savedCostLimit = readCostLimits();
    if (savedCostLimit) {
      setCostLimit(savedCostLimit);
    }
  }, []);

  useEffect(() => {
    const witchPoints = costLimit.unlimited
      ? 99999999
      : costLimit.witchPoints || 0;
    const diamonds = costLimit.unlimited ? 999 : costLimit.diamonds || 0;
    if (
      effectiveCostLimits.witchPoints !== witchPoints ||
      effectiveCostLimits.diamonds !== diamonds
    ) {
      setEffectiveCostLimits({
        witchPoints,
        diamonds,
      });
    }
  }, [
    effectiveCostLimits.witchPoints,
    effectiveCostLimits.diamonds,
    costLimit.unlimited,
    costLimit.witchPoints,
    costLimit.diamonds,
    setEffectiveCostLimits,
  ]);

  const setUnlimitedState = (unlimitedState: boolean) => {
    setAndSaveStateWrapper(
      (currentLimit: CostLimitsType) => ({
        ...currentLimit,
        unlimited: unlimitedState,
      }),
      costLimit,
      setCostLimit,
      saveCostLimits
    );
  };

  const setWitchPointLimit = (witchPoints: string) => {
    if (costLimit.unlimited) return;
    if (!/^\d*$/.test(witchPoints)) return;

    setAndSaveStateWrapper(
      (currentLimit: CostLimitsType) => ({
        ...currentLimit,
        witchPoints: parseInt(witchPoints),
      }),
      costLimit,
      setCostLimit,
      saveCostLimits
    );
  };

  const setDiamondLimit = (diamonds: string) => {
    if (costLimit.unlimited) return;
    if (!/^\d*$/.test(diamonds)) return;

    if (costLimit.unlimited) return;

    setAndSaveStateWrapper(
      (currentLimit: CostLimitsType) => ({
        ...currentLimit,
        diamonds: parseInt(diamonds),
      }),
      costLimit,
      setCostLimit,
      saveCostLimits
    );
  };

  return (
    <div>
      <h3>Configure Cost Limit</h3>
      <label>
        <input
          id="unlimited"
          disabled={!editable}
          type="checkbox"
          checked={costLimit.unlimited}
          onChange={() => setUnlimitedState(!costLimit.unlimited)}
        />
        unlimited
      </label>
      <br />
      Max. Witch Points:{' '}
      <input
        id="witchpoints"
        disabled={!editable || costLimit.unlimited}
        type="text"
        value={costLimit.unlimited ? '\u221E' : costLimit.witchPoints}
        onChange={e => setWitchPointLimit(e.target.value)}
      />
      <br />
      Max. Diamonds:{' '}
      <input
        id="diamonds"
        disabled={!editable || costLimit.unlimited}
        type="text"
        value={costLimit.unlimited ? '\u221E' : costLimit.diamonds}
        onChange={e => setDiamondLimit(e.target.value)}
      />
    </div>
  );
};

export default CostLimits;
