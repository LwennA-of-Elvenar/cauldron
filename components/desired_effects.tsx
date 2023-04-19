import { Dispatch, ReactNode, SetStateAction, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { saveDesiredEffects, setAndSaveStateWrapper } from '@/engine/cookie';
import { EffectText, EffectImage } from '@/components/effect';
import { ErrorLevel } from '@/components/message_banner';

type DesiredEffectProps = {
  editable: boolean;
  effect: number;
  weight: number;
  setWeight: (newWeight: string) => void;
};

const DesiredEffect = ({
  editable,
  effect,
  weight,
  setWeight,
}: DesiredEffectProps) => {
  return (
    <>
      <div className="row">
        <span className="effect">
          <EffectText effect={effect} /> <EffectImage effect={effect} />{' '}
        </span>
        <span className="weight">
          <input
            id={`effect${effect.toString()}`}
            disabled={!editable}
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={weight}
            onChange={e => setWeight(e.target.value)}
          />
        </span>
        <span className="weightDisplay">{weight.toFixed(2)}</span>
      </div>
      <style jsx>{`
        div.row {
          display: table-row;
        }
        span.effect,
        span.weight,
        span.weightDisplay {
          display: table-cell;
          padding: 2px;
          text-align: right;
          white-space: nowrap;
        }
        span,
        input {
          vertical-align: middle;
        }
      `}</style>
    </>
  );
};

export type DesiredEffectsType = {
  [x: number]: number;
};

type DesiredEffectsProps = {
  editable: boolean;
  cookiesLoaded: boolean;
  diplomas: number;
  desiredEffects: DesiredEffectsType;
  setDesiredEffects: Dispatch<SetStateAction<DesiredEffectsType>>;
  setMessage: (
    scope: string,
    level: ErrorLevel,
    message: ReactNode | null
  ) => void;
};

const DesiredEffects = ({
  editable,
  cookiesLoaded,
  diplomas,
  desiredEffects,
  setDesiredEffects,
  setMessage,
}: DesiredEffectsProps) => {
  const t = useTranslations('desiredEffects');
  const effectiveDesiredEffects = [];
  for (let i = 1; i <= diplomas; i += 1) {
    effectiveDesiredEffects.push({
      effect: i,
      weight: desiredEffects[i] || 0.0,
    });
  }

  const setWeight = (effect: number) => {
    const setWeightForEffect = (weight_str: string) => {
      if (!/^\d+(?:\.\d+)?$/.test(weight_str)) return;
      const weight = parseFloat(weight_str);
      if (weight > 1) return;
      setAndSaveStateWrapper(
        (currentEffects: DesiredEffectsType) => {
          const newEffects: DesiredEffectsType = {};
          Object.entries(currentEffects).forEach(entry => {
            const currentEffect = parseInt(entry[0]);
            const currentWeight = entry[1];
            if (
              currentWeight !== 0.0 &&
              currentEffect !== effect &&
              currentEffect <= diplomas
            ) {
              newEffects[currentEffect] = currentWeight;
            }
          });
          if (weight !== 0.0) {
            newEffects[effect] = weight;
          }
          return newEffects;
        },
        desiredEffects,
        setDesiredEffects,
        saveDesiredEffects
      );
    };
    return setWeightForEffect;
  };

  useEffect(() => {
    if (cookiesLoaded) setWeight(0)('0.0');
  }, [diplomas]); // eslint-disable-line react-hooks/exhaustive-deps

  const validConfig =
    effectiveDesiredEffects.reduce((prev, curr) => prev + curr.weight, 0) > 0;

  useEffect(() => {
    setMessage(
      'desiredEffects',
      ErrorLevel.Error,
      validConfig ? null : t('errorNoEffectChosen')
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validConfig]);

  return (
    <>
      <div>
        <h3>{t('title')}</h3>
        {effectiveDesiredEffects.map((effect, index) => (
          <DesiredEffect
            key={index}
            editable={editable}
            effect={effect.effect}
            weight={effect.weight}
            setWeight={setWeight(effect.effect)}
          />
        ))}
      </div>
    </>
  );
};

export default DesiredEffects;
