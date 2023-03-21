import { Cookies } from 'react-cookie';

const COOKIE_PREFIX = 'cauldron_config';

const saveConfig = (cookieName, configObject) => {
  const cookies = new Cookies();
  cookies.set(`${COOKIE_PREFIX}_${cookieName}`, JSON.stringify(configObject), {
    maxAge: 315360000,
  });
};

const readConfig = cookieName => {
  const cookies = new Cookies();
  const rawCookie = cookies.get(`${COOKIE_PREFIX}_${cookieName}`, {
    doNotParse: true,
  });
  if (!rawCookie) return null;
  const configObject = JSON.parse(rawCookie);
  return configObject;
};

export const setAndSaveStateWrapper = (
  newStateFunc,
  currentState,
  setStateFunc,
  saveCookieFunc
) => {
  setStateFunc(newStateFunc);
  saveCookieFunc(newStateFunc(currentState));
};

export const saveDiamondIngredientsConfig = config => {
  saveConfig('diamonds_ingredient_config', config);
};

export const readDiamondIngredientsConfig = () =>
  readConfig('diamonds_ingredient_config');

export const saveCostLimits = config => {
  saveConfig('cost_limit', config);
};

export const readCostLimits = () => readConfig('cost_limit');

export const saveDiplomas = config => {
  saveConfig('diplomas', config);
};

export const readDiplomas = () => readConfig('diplomas');

export const saveDesiredEffects = config => {
  saveConfig('desired_effects', config);
};

export const readDesiredEffects = () => readConfig('desired_effects');

export const savePotion = config => {
  saveConfig('potion', config);
};

export const readPotion = () => readConfig('potion');
