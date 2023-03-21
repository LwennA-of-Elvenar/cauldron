import { useEffect } from 'react';
import { effects } from '../engine/mappings';
import { saveDesiredEffects, setAndSaveStateWrapper } from '../engine/cookie';

const DesiredEffect = ({ editable, effect, weight, setWeight }) => (
  <>
    <div className="row">
      <span className="effect">{effects[effect]}: </span>
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
        padding: 1px;
        text-align: right;
        white-space: nowrap;
      }
    `}</style>
  </>
);

const DesiredEffects = ({
  editable,
  cookiesLoaded,
  diplomas,
  desiredEffects,
  setDesiredEffects,
}) => {
  const effectiveDesiredEffects = [];
  for (let i = 1; i <= diplomas; i += 1) {
    effectiveDesiredEffects.push({
      effect: i,
      weight: desiredEffects[i] || 0.0,
    });
  }

  const setWeight = effect => {
    const setWeightForEffect = weight => {
      if (!/^\d+(?:\.\d+)?$/.test(weight)) return;
      if (weight > 1) return;
      setAndSaveStateWrapper(
        currentEffects => {
          const newEffects = {};
          Object.entries(currentEffects).forEach(entry => {
            const [currentEffect, currentWeight] = entry;
            if (
              currentWeight !== 0.0 &&
              currentEffect !== effect &&
              parseInt(currentEffect, 10) <= parseInt(diplomas, 10)
            ) {
              newEffects[currentEffect] = currentWeight;
            }
          });
          if (weight !== 0.0) {
            newEffects[effect] = parseFloat(weight);
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
    if (cookiesLoaded) setWeight(0)(0.0);
  }, [diplomas]); // eslint-disable-line react-hooks/exhaustive-deps

  const validConfig =
    effectiveDesiredEffects.reduce((prev, curr) => prev + curr.weight, 0) > 0;

  return (
    <>
      <div>
        <h3>Desired Effects</h3>
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
      {validConfig || (
        <div>
          <p className="error">
            You need to choose at least one desired effect.
          </p>
        </div>
      )}
      <style jsx>{`
        p.error {
          color: red;
        }
      `}</style>
    </>
  );
};

export default DesiredEffects;
