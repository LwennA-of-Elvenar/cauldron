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
} from '@/components/potion';
import PotionStats, { PotionStatsType } from '@/components/potion_stats';
import { calculateChances, optimizePotion } from '@/engine/core';
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
  busy: boolean;
  setBusy: Dispatch<SetStateAction<boolean>>;
  cancelFlag: MutableRefObject<boolean>;
  setCancelling: Dispatch<SetStateAction<boolean>>;
  setRecalculationRequired: Dispatch<SetStateAction<boolean>>;
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

  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState<null | string>(null);
  const [recalculationRequired, setRecalculationRequired] = useState(true);
  const [cookiesLoaded, setCookiesLoaded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const cancelFlag = useRef(false);

  const editable = db.loaded && cookiesLoaded && !busy;

  const setPotion = (setStateFunc: SetStateAction<PotionType>) => {
    setAndSaveStateWrapper(setStateFunc, potion, setPotionRaw, savePotion);
  };

  const engineState: EngineStateType = {
    busy,
    setBusy,
    cancelFlag,
    setCancelling,
    setRecalculationRequired,
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
  }, []);

  useEffect(() => {
    cancelFlag.current = cancelling;
  }, [cancelling]);

  useEffect(() => {
    setRecalculationRequired(true);
  }, [
    ...Object.values(potion), // eslint-disable-line react-hooks/exhaustive-deps
    ...Object.values(diamondIngredientConfig), // eslint-disable-line react-hooks/exhaustive-deps
    diplomas,
  ]);

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
              disabled={!editable || !recalculationRequired}
              onClick={() => {
                calculateChances(engineState);
              }}
            >
              {t('actions.calculateEffects')}
            </button>
            <button
              type="button"
              disabled={!editable}
              onClick={() => {
                optimizePotion(engineState);
              }}
            >
              {t('actions.optimize')}
            </button>
            <button
              type="button"
              disabled={!busy || cancelling}
              onClick={() => setCancelling(true)}
            >
              {cancelling ? t('actions.cancelInProgress') : t('actions.cancel')}
            </button>
            {warning && <p className="warn">{warning}</p>}
            <PotionStats
              potionStats={potionStats}
              recalculationRequired={recalculationRequired && !busy}
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
