import PropTypes from 'prop-types';
import { saveDiamondIngredientsConfig } from '../engine/cookie';

const SingleDiamondIngredient = ({
  editable,
  ingredientID,
  requiresDiamonds,
  setRequiresDiamonds,
}) => (
  <input
    id={ingredientID}
    disabled={!editable}
    type="checkbox"
    checked={requiresDiamonds}
    onChange={() => {
      setRequiresDiamonds(!requiresDiamonds);
    }}
  />
);

const SingleIngredientProps = {
  ingredientID: PropTypes.number,
  requiresDiamonds: PropTypes.bool,
  setRequiresDiamonds: PropTypes.func,
};

SingleDiamondIngredient.propTypes = {
  editable: PropTypes.bool,
  ...SingleIngredientProps,
};

const DiamondIngredientRow = ({ editable, elements }) => (
  <div>
    {elements.map((element, index) => (
      <SingleDiamondIngredient key={index} editable={editable} {...element} />
    ))}
  </div>
);

DiamondIngredientRow.propTypes = {
  editable: PropTypes.bool,
  elements: PropTypes.arrayOf(PropTypes.shape(SingleIngredientProps)),
};

const DiamondIngredientConfig = ({
  editable,
  diamondIngredientConfig,
  setDiamondIngredientConfig,
}) => {
  const rows = {};

  const setRequiresDiamonds = ingredientID => {
    const setRequiresDiamondsForIngredient = requiresDiamonds => {
      const getNewConfig = config => ({
        ...config,
        [ingredientID]: requiresDiamonds,
      });
      setDiamondIngredientConfig(getNewConfig);
      saveDiamondIngredientsConfig(getNewConfig(diamondIngredientConfig));
    };
    return setRequiresDiamondsForIngredient;
  };

  Object.entries(diamondIngredientConfig).forEach(entry => {
    const [ingredientID, requiresDiamonds] = entry;
    const row = Math.trunc((ingredientID - 1) / 4);
    const element = {
      ingredientID: parseInt(ingredientID, 10),
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
            elements={rows[rowNumber]}
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

DiamondIngredientConfig.propTypes = {
  editable: PropTypes.bool,
  diamondIngredientConfig: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  setDiamondIngredientConfig: PropTypes.func,
};

export default DiamondIngredientConfig;
