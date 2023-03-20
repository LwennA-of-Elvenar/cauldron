import Head from 'next/head'
import DiamondIngredientConfig from '../components/diamond_ingredients'
import CostLimits from '../components/cost_limits'
import Diplomas from '../components/diplomas'
import DesiredEffects from '../components/desired_effects'
import Potion from '../components/potion'
import PotionStats from '../components/potion_stats'
import {useEffect, useState, useRef} from 'react'
import {calculateChances, optimizePotion} from '../engine/core'
import { readDesiredEffects, readDiamondIngredientsConfig, readDiplomas, saveDesiredEffects, readPotion, setAndSaveStateWrapper, savePotion } from '../engine/cookie'

const Home = ({db}) => {

  let defaultDiamondIngredientConfig = {}
  let defaultPotion = {}
  for (let i=1; i<=12; i++)
  {
    defaultDiamondIngredientConfig[i] = false;
    defaultPotion[i] = 0;
  }
  const defaultCostLimit = {
    witchPoints: 0,
    diamonds: 0
  }
  const defaultPotionStats = {
    witchPoints: 0,
    diamonds: 0,
    effects: []
  }

  const [diamondIngredientConfig, setDiamondIngredientConfig] = useState(defaultDiamondIngredientConfig);
  const [potion, setPotionRaw] = useState(defaultPotion);
  const [costLimit, setCostLimit] = useState(defaultCostLimit);
  const [potionStats, setPotionStats] = useState(defaultPotionStats);
  const [diplomas, setDiplomas] = useState(1);
  const [desiredEffects, setDesiredEffects] = useState({});

  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState(null);
  const [recalculationRequired, setRecalculationRequired] = useState(true);
  const [cookiesLoaded, setCookiesLoaded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const cancelFlag = useRef(false);

  const editable = db.loaded && cookiesLoaded && !busy;

  const setPotion = (setStateFunc) => {
    setAndSaveStateWrapper(
      setStateFunc,
      potion,
      setPotionRaw,
      savePotion
    )
  }

  const engineState = {
    busy: busy,
    setBusy: setBusy,
    cancelFlag: cancelFlag,
    setCancelling: setCancelling,
    setRecalculationRequired: setRecalculationRequired,
    setWarning: setWarning,
    diamondIngredientConfig: diamondIngredientConfig,
    potion: potion,
    setPotion: setPotion,
    setPotionStats: setPotionStats,
    costLimit: costLimit,
    diplomas: diplomas,
    desiredEffects: desiredEffects,
    db: db
  }

  useEffect(() => {
    const savedDiamondIngredientsConfig = readDiamondIngredientsConfig();
    if (savedDiamondIngredientsConfig) setDiamondIngredientConfig(savedDiamondIngredientsConfig);

    const savedDiplomas = readDiplomas();
    if (savedDiplomas) setDiplomas(savedDiplomas);

    const savedDesiredEffects = readDesiredEffects();
    if (saveDesiredEffects) setDesiredEffects(savedDesiredEffects);

    const savedPotion = readPotion();
    if (savedPotion) setPotionRaw(savedPotion);

    setCookiesLoaded(true);
  }, []);

  useEffect(() => {
    cancelFlag.current = cancelling
  }, [cancelling])

  useEffect(() => {
    setRecalculationRequired(true);
  }, [...Object.values(potion), ...Object.values(diamondIngredientConfig), diplomas]);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {db.loaded || (
          <div>
            <h2>Initializing application</h2>
            <p>
              Please wait while we fire up the witch's cauldron...
            </p>
          </div>
        )}
      <main>
        <div className="col">
          <DiamondIngredientConfig editable={editable} diamondIngredientConfig={diamondIngredientConfig} setDiamondIngredientConfig={setDiamondIngredientConfig} />
          <CostLimits editable={editable} effectiveCostLimits={costLimit} setEffectiveCostLimits={setCostLimit} />
          <Diplomas editable={editable} diplomas={diplomas} setDiplomas={setDiplomas} />
          <DesiredEffects editable={editable} cookiesLoaded={cookiesLoaded} diplomas={diplomas} desiredEffects={desiredEffects} setDesiredEffects={setDesiredEffects} />
        </div>
        <div className="col">
          <Potion editable={editable} potion={potion} setPotion={setPotion} />
          <button disabled={!editable} onClick={() => {setPotion(() => defaultPotion)}}>Reset</button><br />
          <button disabled={!editable || !recalculationRequired} onClick={() => {calculateChances(engineState)}}>Calculate Effects</button>
          <button disabled={!editable} onClick={() => {optimizePotion(engineState)}}>Optimize Potion</button>
          <button disabled={!busy || cancelling} onClick={() => setCancelling(true)}>{cancelling? "Cancelling..." : "Cancel"}</button>
          {warning && (<p className="warn">{warning}</p>)}
          <PotionStats potionStats={potionStats} recalculationRequired={recalculationRequired && !busy} />
        </div>
      </main>
      <style jsx>{`
        main {
          display:table-row;
        }
        p.warn {
          color: orange;
        }
        div.col {
          display: table-cell;
          padding-left: 25px;
          padding-right: 25px;
          width:50vw;
        }
      `}</style>
    </>
  )
}

export default Home