import { Dispatch, SetStateAction } from 'react';
import { Cookies } from 'react-cookie';
import { CostLimitsType } from '@/components/cost_limits';
import { DesiredEffectsType } from '@/components/desired_effects';
import { PotionType, DiamondIngredientConfigType } from '@/components/potion';

const COOKIE_PREFIX = 'cauldron_config';

const saveConfig = (
  cookieName: string,
  configObject:
    | PotionType
    | CostLimitsType
    | DiamondIngredientConfigType
    | DesiredEffectsType
    | number
) => {
  const cookies = new Cookies();
  cookies.set(`${COOKIE_PREFIX}_${cookieName}`, JSON.stringify(configObject), {
    maxAge: 315360000,
  });
};

const readConfig = (cookieName: string) => {
  const cookies = new Cookies();
  const rawCookie = cookies.get(`${COOKIE_PREFIX}_${cookieName}`, {
    doNotParse: true,
  });
  if (!rawCookie) return null;
  const configObject = JSON.parse(rawCookie);
  return configObject;
};

export const setAndSaveStateWrapper = <T>(
  newState: SetStateAction<T>,
  currentState: T,
  setStateFunc: Dispatch<SetStateAction<T>>,
  saveCookieFunc: (newState: T) => void
) => {
  const isNotFunction = <T>(
    maybeFunction: SetStateAction<T>
  ): maybeFunction is T => typeof maybeFunction !== 'function';
  setStateFunc(newState);
  const evaluatedNewState = isNotFunction(newState)
    ? newState
    : newState(currentState);
  saveCookieFunc(evaluatedNewState);
};

export const saveDiamondIngredientsConfig = (
  config: DiamondIngredientConfigType
) => {
  saveConfig('diamonds_ingredient_config', config);
};

export const readDiamondIngredientsConfig = (): DiamondIngredientConfigType =>
  readConfig('diamonds_ingredient_config');

export const saveCostLimits = (config: CostLimitsType) => {
  saveConfig('cost_limit', config);
};

export const readCostLimits = (): CostLimitsType => readConfig('cost_limit');

export const saveDiplomas = (config: number) => {
  saveConfig('diplomas', config);
};

export const readDiplomas = (): number => readConfig('diplomas');

export const saveDesiredEffects = (config: DesiredEffectsType) => {
  saveConfig('desired_effects', config);
};

export const readDesiredEffects = (): DesiredEffectsType =>
  readConfig('desired_effects');

export const savePotion = (config: PotionType) => {
  saveConfig('potion', config);
};

export const readPotion = (): PotionType => readConfig('potion');
