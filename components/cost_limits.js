import {useState, useEffect} from 'react';
import { readCostLimits, saveCostLimits, setAndSaveStateWrapper } from '../engine/cookie';

const CostLimits = ({editable, effectiveCostLimits, setEffectiveCostLimits}) => {
    const defaultCostLimits = {
        unlimited: false,
        witchPoints: '1000',
        diamonds: '0',
    }

    const [costLimit, setCostLimit] = useState(defaultCostLimits);

    useEffect(() => {
        const savedCostLimit = readCostLimits();
        if (savedCostLimit) {
            setCostLimit(savedCostLimit);
        }
    }, []);

    useEffect(() => {
        const witchPoints = costLimit.unlimited? 99999999 : costLimit.witchPoints || 0;
        const diamonds = costLimit.unlimited? 999 : costLimit.diamonds || 0;
        if ((effectiveCostLimits.witchPoints != witchPoints) 
            || (effectiveCostLimits.diamonds != diamonds)) {
            setEffectiveCostLimits({
                witchPoints: witchPoints,
                diamonds: diamonds
            })
        }
    }, [...Object.values(effectiveCostLimits), ...Object.values(costLimit)])

    const setUnlimitedState = (unlimitedState) => {
        setAndSaveStateWrapper(
            (currentLimit) => {
                return {
                    ...currentLimit,
                    unlimited: unlimitedState
                }
            },
            costLimit,
            setCostLimit,
            saveCostLimits
        );
    }

    const setWitchPointLimit = (witchPoints) => {
        if (costLimit.unlimited) return;
        if (!/^\d*$/.test(witchPoints)) return;

        setAndSaveStateWrapper(
            (currentLimit) => {
                return {
                    ...currentLimit,
                    witchPoints: witchPoints
                }
            },
            costLimit,
            setCostLimit,
            saveCostLimits
        );
    }

    const setDiamondLimit = (diamonds) => {
        if (costLimit.unlimited) return;
        if (!/^\d*$/.test(diamonds)) return;
        
        if (costLimit.unlimited) return;

        setAndSaveStateWrapper(
            (currentLimit) => {
                return {
                    ...currentLimit,
                    diamonds: diamonds
                }
            },
            costLimit,
            setCostLimit,
            saveCostLimits
        );

    }

    return (
        <div>
            <h3>Configure Cost Limit</h3>
            <label>
                <input id="unlimited" disabled={!editable} type="checkbox" checked={costLimit.unlimited} onChange={() => setUnlimitedState(!costLimit.unlimited)} />
                unlimited
            </label>
            <br />
            Max. Witch Points: <input id="witchpoints" disabled={!editable || costLimit.unlimited} type="text" value={costLimit.unlimited ? "\u221E" : costLimit.witchPoints} onChange={(e) => setWitchPointLimit(e.target.value)} />
            <br />
            Max. Diamonds: <input id="diamonds" disabled={!editable || costLimit.unlimited} type="text" value={costLimit.unlimited ? "\u221E" : costLimit.diamonds} onChange={(e) => setDiamondLimit(e.target.value)} />
        </div>
    )

}

export default CostLimits