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

export { imageUseDiamonds, imageUseWitchPoints, imagesIngredients };
