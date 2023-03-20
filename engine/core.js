import {insertPotionIntoDB, insertDiamondIngredientConfigIntoDB, calculateChancesQuery, insertDesiredEffectsIntoDB, optimizePotionQuery} from './sql'

const startOperation = (engineState) => {
    engineState.setCancelling(false);
    engineState.setBusy(true);
    engineState.setWarning("running...");
}

const finishOperation = (engineState) => {
    engineState.setCancelling(false);
    engineState.setBusy(false);
    engineState.setWarning(null);
}

const cancelOperation = (engineState) => {
    engineState.setCancelling(false);
    engineState.setBusy(false);
    engineState.setWarning("Operation cancelled");
}

const failOperation = (engineState, message) => {
    engineState.setCancelling(false);
    engineState.setBusy(false);
    engineState.setWarning(message);
}

const formatPotionStats = (result) => {
    let stats = {
        witchPoints: 0,
        diamonds: 0,
        effects: []
    }
    if (result.length < 1) return stats;
    const data = result[0].values
    stats.witchPoints = data[0][1];
    stats.diamonds = data[0][2];
    if ((stats.witchPoints == 0) && (stats.diamonds == 0)) return stats;
    data.forEach((effect) => {
        stats.effects.push({
            effect: effect[0].toString(),
            probability: `${(100 * effect[3]).toFixed(2)}%`
        })
    })
    return stats;
}

export const calculateChances = (engineState, insertStatement = null, callback = null) => {
    const worker = engineState.db.worker;
    const effectiveInsertStatement = insertStatement || insertDiamondIngredientConfigIntoDB(engineState.diamondIngredientConfig)
        + insertPotionIntoDB(engineState.potion);
    const statement = effectiveInsertStatement
        + calculateChancesQuery(engineState.diplomas);

    worker.onmessage = (e) => {
        const results = e.data.results;
        if (!results) {
            failOperation(engineState, e.data.error);
            return;
        }
        engineState.setPotionStats(formatPotionStats(results));
        engineState.setRecalculationRequired(false);
        if (callback)
        {
            callback();
        } else {
            finishOperation(engineState);
        }
    }
    if (!callback) startOperation(engineState);
    worker.postMessage({
        action: 'exec',
        sql: statement
    })
}

const convertPotion = (results) => {
    const failure = {
        outcome: "failed",
        potion: null
    }
    if (results.length < 1) return failure;
    const data = results[0].values
    const sample = data[0][0];
    const harmonic_mean = data[0][3];
    if (harmonic_mean == 0) return failure;
    let potion = {}
    for (let i = 0; i < data.length; i++){
        if (data[i][0] != sample) break;
        potion[data[i][4]] = data[i][5];
    }
    return {
        outcome: (sample == 0) ? "same" : "better",
        newPotion: potion
    }
}

export const optimizePotion = (engineState, continuation = false) => {
    const worker = engineState.db.worker;
    const insertStatement = continuation ? "" :
        insertDiamondIngredientConfigIntoDB(engineState.diamondIngredientConfig)
        + insertPotionIntoDB(engineState.potion)
        + insertDesiredEffectsIntoDB(engineState.desiredEffects)
    const statement = insertStatement
        + optimizePotionQuery(engineState.diplomas, engineState.costLimit.witchPoints, engineState.costLimit.diamonds);

    worker.onmessage = (e) => {
        const results = e.data.results;
        if (!results) {
            failOperation(engineState, e.data.error);
            return;
        }
        const {outcome, newPotion} = convertPotion(results);
        if (outcome == "failed"){
            failOperation(engineState, "The witch's assistant was unable to find a potion matching all desired effects. Try to remove some desired effects, or increase the cost limit, or start with a potion that uses e.g. one of each ingredient.");
            return;
        }
        if (outcome == "same"){
            calculateChances(
                engineState,
                insertPotionIntoDB(newPotion),
                () => {finishOperation(engineState);}
            )
            return;
        }
        if (engineState.cancelFlag.current){
            calculateChances(
                engineState,
                insertPotionIntoDB(newPotion),
                () => {cancelOperation(engineState);}
            )
            return;
        }
        calculateChances(
            engineState,
            insertPotionIntoDB(newPotion),
            () => {optimizePotion(engineState, true);}
        )
        engineState.setPotion(() => newPotion);
    }
    if (!continuation) startOperation(engineState);
    worker.postMessage({
        action: 'exec',
        sql: statement
    })
}