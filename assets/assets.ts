import ingredient1 from './ingredient.inline.png';
import ingredient2 from './ingredient.inline.png';
import ingredient3 from './ingredient.inline.png';
import ingredient4 from './ingredient.inline.png';
import ingredient5 from './ingredient.inline.png';
import ingredient6 from './ingredient.inline.png';
import ingredient7 from './ingredient.inline.png';
import ingredient8 from './ingredient.inline.png';
import ingredient9 from './ingredient.inline.png';
import ingredient10 from './ingredient.inline.png';
import ingredient11 from './ingredient.inline.png';
import ingredient12 from './ingredient.inline.png';
import effect1 from './effects/Effect_Coins.inline.png';
import effect2 from './effects/Effect_Supplies.inline.png';
import effect3 from './effects/Effect_B_Strenght.inline.png';
import effect4 from './effects/Effect_G1.inline.png';
import effect5 from './effects/Effect_G2.inline.png';
import effect6 from './effects/Effect_G3.inline.png';
import effect7 from './effects/Effect_TG_Strenght.inline.png';
import effect8 from './effects/Effect_Chapters.inline.png';
import effect9 from './effects/Effect_Orcs.inline.png';
import effect10 from './effects/Effect_Mana.inline.png';
import effect11 from './effects/Effect_MC_Strenght.inline.png';
import effect12 from './effects/Effect_Seeds.inline.png';
import effect13 from './effects/Effect_Sg1.inline.png';
import effect14 from './effects/Effect_Sg2.inline.png';
import effect15 from './effects/Effect_Sg3.inline.png';
import effect16 from './effects/Effect_TG_Health.inline.png';
import effect17 from './effects/Effect_MC_Health.inline.png';
import effect18 from './effects/Effect_Unurim.inline.png';
import effect19 from './effects/Effect_Ag1.inline.png';
import effect20 from './effects/Effect_Ag2.inline.png';
import imageUseWitchPoints from './use_witch_points.inline.png';
import imageUseDiamonds from './use_diamonds.inline.png';

type ImageMapping = {
  [x: number]: string;
};

const imagesIngredients: ImageMapping = {
  1: ingredient1,
  2: ingredient2,
  3: ingredient3,
  4: ingredient4,
  5: ingredient5,
  6: ingredient6,
  7: ingredient7,
  8: ingredient8,
  9: ingredient9,
  10: ingredient10,
  11: ingredient11,
  12: ingredient12,
};

const imagesEffects: ImageMapping = {
  1: effect1,
  2: effect2,
  3: effect3,
  4: effect4,
  5: effect5,
  6: effect6,
  7: effect7,
  8: effect8,
  9: effect9,
  10: effect10,
  11: effect11,
  12: effect12,
  13: effect13,
  14: effect14,
  15: effect15,
  16: effect16,
  17: effect17,
  18: effect18,
  19: effect19,
  20: effect20,
};

export {
  imageUseDiamonds,
  imageUseWitchPoints,
  imagesIngredients,
  imagesEffects,
};