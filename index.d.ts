declare module '*.inline.png' {
  const value: string;
  export default value;
}
// Use type safe message keys with `next-intl`
type Messages = typeof import('./messages/en.json');
type EffectIngredientMapping = {
  [x: string]: string;
};
declare interface IntlMessages extends Messages {
  effects: EffectIngredientMapping;
  ingredients: EffectIngredientMapping;
}
