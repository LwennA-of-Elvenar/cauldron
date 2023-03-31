import { Dispatch, SetStateAction } from 'react';
import { saveDiamondIngredientsConfig } from '@/engine/cookie';

type ElementProps = {
  ingredientID: number;
  requiresDiamonds: boolean;
  setRequiresDiamonds: (requiresDiamonds: boolean) => void;
};

const SingleDiamondIngredient = ({
  editable,
  ingredientID,
  requiresDiamonds,
  setRequiresDiamonds,
}: { editable: boolean } & ElementProps) => (
  <input
    id={ingredientID.toString()}
    disabled={!editable}
    type="checkbox"
    checked={requiresDiamonds}
    onChange={() => {
      setRequiresDiamonds(!requiresDiamonds);
    }}
  />
);

type DiamondIngredientRowProps = {
  editable: boolean;
  elements: Array<ElementProps>;
};

const DiamondIngredientRow = ({
  editable,
  elements,
}: DiamondIngredientRowProps) => (
  <div>
    {elements.map((element, index) => (
      <SingleDiamondIngredient key={index} editable={editable} {...element} />
    ))}
  </div>
);

export type DiamondIngredientConfigType = {
  [x: number]: boolean;
};

type DiamondIngredientConfigProps = {
  editable: boolean;
  diamondIngredientConfig: DiamondIngredientConfigType;
  setDiamondIngredientConfig: Dispatch<
    SetStateAction<DiamondIngredientConfigType>
  >;
};

type RowType = {
  [x: number]: Array<ElementProps>;
};

const DiamondIngredientConfig = ({
  editable,
  diamondIngredientConfig,
  setDiamondIngredientConfig,
}: DiamondIngredientConfigProps) => {
  const rows: RowType = {};

  const setRequiresDiamonds = (ingredientID: number) => {
    const setRequiresDiamondsForIngredient = (requiresDiamonds: boolean) => {
      const getNewConfig = (config: DiamondIngredientConfigType) => ({
        ...config,
        [ingredientID]: requiresDiamonds,
      });
      setDiamondIngredientConfig(getNewConfig);
      saveDiamondIngredientsConfig(getNewConfig(diamondIngredientConfig));
    };
    return setRequiresDiamondsForIngredient;
  };

  Object.entries(diamondIngredientConfig).forEach(entry => {
    const ingredientID = parseInt(entry[0]);
    const requiresDiamonds = entry[1];
    const row = Math.trunc((ingredientID - 1) / 4);
    const element = {
      ingredientID: ingredientID,
      requiresDiamonds,
      setRequiresDiamonds: setRequiresDiamonds(ingredientID),
    };
    const currentRow = rows[row] || [];
    currentRow.push(element);
    rows[row] = currentRow;
  });

  const validConfig =
    Object.values(diamondIngredientConfig).reduce(
      (prev, curr) => prev + (curr ? 1 : 0),
      0
    ) === 4;

  return (
    <>
      <div>
        <h3>Select Diamond Ingredients</h3>
      </div>
      <div>
        {Object.keys(rows).map((rowNumber, index) => (
          <DiamondIngredientRow
            key={index}
            editable={editable}
            elements={rows[parseInt(rowNumber)]}
          />
        ))}
      </div>
      {validConfig || (
        <div>
          <p className="error">
            Please select exactly 4 ingredients that need diamonds.
          </p>
        </div>
      )}
      <style jsx>{`
        p.error {
          color: red;
        }
      `}</style>
    </>
  );
};

export default DiamondIngredientConfig;
