import Head from 'next/head';
import {
  useEffect,
  useState,
  useRef,
  SetStateAction,
  Dispatch,
  MutableRefObject,
} from 'react';
import { useTranslations } from 'next-intl';
import { DBType } from './_app';
import CostLimits, { EffectiveCostLimitsType } from '@/components/cost_limits';
import Diplomas from '@/components/diplomas';
import DesiredEffects, {
  DesiredEffectsType,
} from '@/components/desired_effects';
import Potion, {
  PotionType,
  DiamondIngredientConfigType,
  getTotalIngredients,
} from '@/components/potion';
import PotionStats, { PotionStatsType } from '@/components/potion_stats';
import { calculateChances, optimizePotion, Operation } from '@/engine/core';
import {
  readDesiredEffects,
  readDiamondIngredientsConfig,
  readDiplomas,
  readPotion,
  setAndSaveStateWrapper,
  savePotion,
} from '@/engine/cookie';
import { GetStaticPropsContext } from 'next';

type HomeProps = {
  db: DBType;
};

export type EngineStateType = {
  t: ReturnType<typeof useTranslations>;
  currentOperation: MutableRefObject<Operation>;
  scheduledOperation: MutableRefObject<Operation>;
  runScheduler: () => void;
  cancelFlag: MutableRefObject<boolean>;
  setCancelling: Dispatch<SetStateAction<boolean>>;
  markRecalculationComplete: () => void;
  setWarning: Dispatch<SetStateAction<null | string>>;
  diamondIngredientConfig: DiamondIngredientConfigType;
  potion: PotionType;
  setPotion: Dispatch<SetStateAction<PotionType>>;
  setPotionStats: Dispatch<SetStateAction<PotionStatsType>>;
  costLimit: EffectiveCostLimitsType;
  diplomas: number;
  desiredEffects: DesiredEffectsType;
  db: DBType;
};

const Home = ({ db }: HomeProps) => {
  const t = useTranslations('app');
  const defaultDiamondIngredientConfig: DiamondIngredientConfigType = {};
  const defaultPotion: PotionType = {};
  for (let i = 1; i <= 12; i += 1) {
    defaultDiamondIngredientConfig[i] = false;
    defaultPotion[i] = 0;
  }
  const defaultCostLimit = {
    witchPoints: 0,
    diamonds: 0,
  };
  const defaultPotionStats: PotionStatsType = {
    witchPoints: 0,
    diamonds: 0,
    effects: [],
  };

  const [diamondIngredientConfig, setDiamondIngredientConfig] = useState(
    defaultDiamondIngredientConfig
  );
  const [potion, setPotionRaw] = useState(defaultPotion);
  const [costLimit, setCostLimit] = useState(defaultCostLimit);
  const [potionStats, setPotionStats] = useState(defaultPotionStats);
  const [diplomas, setDiplomas] = useState(1);
  const [desiredEffects, setDesiredEffects] = useState<DesiredEffectsType>({});

  const [recalculationCounter, setRecalculationCounter] = useState({
    potionChanges: 0,
    lastRecalculation: 0,
  });
  const currentOperation = useRef(Operation.Idle);
  const scheduledOperation = useRef(Operation.CalculateChances); // at the beginning calculate chances of what is loaded from cookies
  const [scheduler, setScheduler] = useState(0);
  const runScheduler = () => {
    setScheduler(s => s + 1);
  };
  const timer: MutableRefObject<null | ReturnType<typeof setTimeout>> =
    useRef(null);

  const [cookiesLoaded, setCookiesLoaded] = useState(false);
  const [warning, setWarning] = useState<null | string>(null);
  const [cancelling, setCancelling] = useState(false);
  const cancelFlag = useRef(cancelling);
  cancelFlag.current = cancelling;

  const editable =
    db.loaded &&
    cookiesLoaded &&
    currentOperation.current != Operation.OptimizePotion;

  const setPotion = (setStateFunc: SetStateAction<PotionType>) => {
    setAndSaveStateWrapper(setStateFunc, potion, setPotionRaw, savePotion);
  };

  const clearRecalculation = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
  };

  const markRecalculationComplete = (counterAtBeginning: number) => {
    const markRecalculationCompleteAsOfBeginning = () => {
      setRecalculationCounter(counter => {
        return {
          ...counter,
          lastRecalculation: counterAtBeginning,
        };
      });
    };
    return markRecalculationCompleteAsOfBeginning;
  };

  const engineState: EngineStateType = {
    t,
    currentOperation,
    scheduledOperation,
    runScheduler,
    cancelFlag,
    setCancelling,
    markRecalculationComplete: markRecalculationComplete(
      recalculationCounter.potionChanges
    ),
    setWarning,
    diamondIngredientConfig,
    potion,
    setPotion,
    setPotionStats,
    costLimit,
    diplomas,
    desiredEffects,
    db,
  };

  // at startup, load all cookies
  // at teardown, clear recalculation timer
  useEffect(() => {
    const savedDiamondIngredientsConfig = readDiamondIngredientsConfig();
    if (savedDiamondIngredientsConfig)
      setDiamondIngredientConfig(savedDiamondIngredientsConfig);

    const savedDiplomas = readDiplomas();
    if (savedDiplomas) setDiplomas(savedDiplomas);

    const savedDesiredEffects = readDesiredEffects();
    if (savedDesiredEffects) setDesiredEffects(savedDesiredEffects);

    const savedPotion = readPotion();
    if (savedPotion) setPotionRaw(savedPotion);

    setCookiesLoaded(true);
    return () => {
      clearRecalculation();
    };
  }, []);

  // whenever the potion or something affecting the chances changes,
  // increase a recalculation counter.
  useEffect(() => {
    setRecalculationCounter(counter => {
      return {
        ...counter,
        potionChanges: counter.potionChanges + 1,
      };
    });
  }, [
    ...Object.values(potion), // eslint-disable-line react-hooks/exhaustive-deps
    ...Object.values(diamondIngredientConfig), // eslint-disable-line react-hooks/exhaustive-deps
    diplomas,
  ]);

  // When the recalculation counter changes, the chances will be calculated.
  // At the end of the calculation (markRecalculationComplete), the value of the counter at the begin
  // of the calculation is saved (lastRecalculation). This allows to identify if something
  // changed while the recalculation was running and retrigger a new recalculation.
  // The calculation is not performed immediately, but scheduled and only run if no changes for a certain
  // time were detected
  useEffect(() => {
    if (
      recalculationCounter.potionChanges !=
      recalculationCounter.lastRecalculation
    ) {
      clearRecalculation();
      scheduledOperation.current = Operation.CalculateChances;
      timer.current = setTimeout(() => {
        runScheduler();
      }, 300);
    }
  }, [
    recalculationCounter.potionChanges,
    recalculationCounter.lastRecalculation,
  ]);

  // check if there is a scheduled operation that can be run (i.e. app is initialized and nothing running yet)
  useEffect(
    () => {
      if (
        db.loaded &&
        cookiesLoaded &&
        currentOperation.current == Operation.Idle &&
        scheduledOperation.current != Operation.Idle
      ) {
        if (scheduledOperation.current == Operation.CalculateChances) {
          clearRecalculation();
          calculateChances(engineState);
        } else if (scheduledOperation.current == Operation.OptimizePotion) {
          clearRecalculation();
          optimizePotion(engineState);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      scheduler,
      db.loaded,
      cookiesLoaded,
      currentOperation.current,
      scheduledOperation.current,
    ]
  );

  return (
    <>
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content={t('description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!db.loaded ? (
        <div>
          <h2>{t('initialization.title')}</h2>
          <p>{t('initialization.text')}</p>
        </div>
      ) : (
        <main>
          <div className="col">
            <CostLimits
              editable={editable}
              effectiveCostLimits={costLimit}
              setEffectiveCostLimits={setCostLimit}
            />
            <Diplomas
              editable={editable}
              diplomas={diplomas}
              setDiplomas={setDiplomas}
            />
            <DesiredEffects
              editable={editable}
              cookiesLoaded={cookiesLoaded}
              diplomas={diplomas}
              desiredEffects={desiredEffects}
              setDesiredEffects={setDesiredEffects}
            />
          </div>
          <div className="col">
            <Potion
              editable={editable}
              potion={potion}
              setPotion={setPotion}
              diamondIngredientConfig={diamondIngredientConfig}
              setDiamondIngredientConfig={setDiamondIngredientConfig}
            />
            <button
              type="button"
              disabled={!editable}
              onClick={() => {
                setPotion(() => defaultPotion);
              }}
            >
              {t('actions.reset')}
            </button>
            <br />
            <button
              type="button"
              hidden={!editable}
              onClick={() => {
                scheduledOperation.current = Operation.OptimizePotion;
                runScheduler();
              }}
            >
              {t('actions.optimize')}
            </button>
            <button
              type="button"
              hidden={currentOperation.current != Operation.OptimizePotion}
              disabled={
                currentOperation.current != Operation.OptimizePotion ||
                cancelling
              }
              onClick={() => setCancelling(true)}
            >
              {cancelling ? t('actions.cancelInProgress') : t('actions.cancel')}
            </button>
            {warning && <p className="warn">{warning}</p>}
            <PotionStats
              potionStats={potionStats}
              hasValidIngredients={
                getTotalIngredients(potion) > 0 &&
                getTotalIngredients(potion) <= 25
              }
            />
          </div>
        </main>
      )}
      <style jsx>{`
        main {
          display: table-row;
        }
        p.warn {
          color: orange;
        }
        div.col {
          display: table-cell;
          padding-left: 25px;
          padding-right: 25px;
          width: 50vw;
        }
      `}</style>
    </>
  );
};

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const locale = context.locale == 'default' ? 'en' : context.locale;
  return {
    props: {
      messages: (await import(`../messages/${locale}.json`)).default,
    },
  };
};

export default Home;
