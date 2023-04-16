import { QueryExecResult } from 'sql.js';
import {
  insertPotionIntoDB,
  insertDiamondIngredientConfigIntoDB,
  calculateChancesQuery,
  insertDesiredEffectsIntoDB,
  optimizePotionQuery,
} from './sql';
import { EngineStateType } from '@/pages';
import { PotionType } from '@/components/potion';
import { PotionStatsType } from '@/components/potion_stats';

export enum Operation {
  Idle,
  CalculateChances,
  OptimizePotion,
}

enum CalculationOutcome {
  Same,
  Better,
  Failed,
}

const startOperation = (engineState: EngineStateType) => {
  engineState.setCancelling(false);
  engineState.currentOperation.current = engineState.scheduledOperation.current;
  engineState.scheduledOperation.current = Operation.Idle;
  if (engineState.currentOperation.current == Operation.OptimizePotion) {
    engineState.setWarning(engineState.t('calculation.running'));
  }
};

const finishOperation = (engineState: EngineStateType) => {
  engineState.setCancelling(false);
  engineState.currentOperation.current = Operation.Idle;
  engineState.setWarning(null);
  engineState.runScheduler();
};

const cancelOperation = (engineState: EngineStateType) => {
  engineState.setCancelling(false);
  engineState.currentOperation.current = Operation.Idle;
  engineState.setWarning(engineState.t('calculation.cancelled'));
  engineState.runScheduler();
};

const failOperation = (engineState: EngineStateType, message: string) => {
  engineState.setCancelling(false);
  engineState.currentOperation.current = Operation.Idle;
  engineState.setWarning(message);
  engineState.runScheduler();
};

const formatPotionStats = (result: Array<QueryExecResult>) => {
  const stats: PotionStatsType = {
    witchPoints: 0,
    diamonds: 0,
    effects: [],
  };
  if (result.length < 1) return stats;
  const data = result[0].values;

  stats.witchPoints = data[0][1] as number;
  stats.diamonds = data[0][2] as number;
  if (stats.witchPoints === 0 && stats.diamonds === 0) return stats;
  data.forEach(effect => {
    stats.effects.push({
      effect: effect[0] as number,
      probability: `${(100 * (effect[3] as number)).toFixed(2)}%`,
    });
  });
  return stats;
};

export const calculateChances = (
  engineState: EngineStateType,
  insertStatement: null | string = null,
  callAfter: null | (() => void) = null
) => {
  const { worker } = engineState.db;
  const effectiveInsertStatement =
    insertStatement ||
    insertDiamondIngredientConfigIntoDB(engineState.diamondIngredientConfig) +
      insertPotionIntoDB(engineState.potion);
  const statement =
    effectiveInsertStatement + calculateChancesQuery(engineState.diplomas);

  worker.onmessage = e => {
    const { results } = e.data;
    if (!results) {
      failOperation(
        engineState,
        engineState.t('calculation.engineError', {
          error: e.data.error,
        })
      );
      return;
    }
    engineState.setPotionStats(formatPotionStats(results));
    if (callAfter) {
      callAfter();
    } else {
      engineState.markRecalculationComplete();
    }
  };
  worker.postMessage({
    action: 'exec',
    sql: statement,
  });
};

const convertPotion = (results: Array<QueryExecResult>) => {
  const failure = {
    outcome: CalculationOutcome.Failed,
    newPotion: null,
  };
  if (results.length < 1) return failure;
  const data = results[0].values;
  const sample = data[0][0];
  const harmonic_mean = data[0][3];
  if (harmonic_mean === 0) return failure;
  const potion: PotionType = {};
  for (let i = 0; i < data.length; i += 1) {
    if (data[i][0] !== sample) break;
    potion[data[i][4] as number] = data[i][5] as number;
  }
  return {
    outcome: sample === 0 ? CalculationOutcome.Same : CalculationOutcome.Better,
    newPotion: potion,
  };
};

export const optimizePotion = (
  engineState: EngineStateType,
  continuation = false
) => {
  const { worker } = engineState.db;
  const insertStatement = continuation
    ? ''
    : insertDiamondIngredientConfigIntoDB(engineState.diamondIngredientConfig) +
      insertPotionIntoDB(engineState.potion) +
      insertDesiredEffectsIntoDB(engineState.desiredEffects);
  const statement =
    insertStatement +
    optimizePotionQuery(
      engineState.diplomas,
      engineState.costLimit.witchPoints,
      engineState.costLimit.diamonds
    );

  worker.onmessage = e => {
    const { results } = e.data;
    if (!results) {
      failOperation(
        engineState,
        engineState.t('calculation.engineError', {
          error: e.data.error,
        })
      );
      return;
    }
    const { outcome, newPotion } = convertPotion(results);
    if (outcome == CalculationOutcome.Failed || newPotion === null) {
      failOperation(
        engineState,
        engineState.t('calculation.errorUnableToOptimize')
      );
      return;
    }
    if (outcome == CalculationOutcome.Same) {
      calculateChances(engineState, insertPotionIntoDB(newPotion), () => {
        finishOperation(engineState);
      });
      return;
    }
    engineState.setPotion(() => newPotion);
    if (engineState.cancelFlag.current) {
      calculateChances(engineState, insertPotionIntoDB(newPotion), () => {
        cancelOperation(engineState);
      });
      return;
    }
    calculateChances(engineState, insertPotionIntoDB(newPotion), () => {
      optimizePotion(engineState, true);
    });
  };
  if (!continuation) startOperation(engineState);
  worker.postMessage({
    action: 'exec',
    sql: statement,
  });
};
