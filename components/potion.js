import PropTypes from 'prop-types';

const SinglePotionIngredient = ({
  editable,
  ingredientID,
  amount,
  setAmount,
}) => (
  <>
    <input
      id={`potionIngredient${ingredientID.toString()}`}
      disabled={!editable}
      type="number"
      min="0"
      max="25"
      value={amount}
      onChange={e => {
        setAmount(e.target.value);
      }}
    />
    <style jsx>{`
      input {
        width: 3em;
      }
    `}</style>
  </>
);

const SinglePotionIngredientProps = {
  ingredientID: PropTypes.number,
  amount: PropTypes.number,
  setAmount: PropTypes.func,
};

SinglePotionIngredient.propTypes = {
  editable: PropTypes.bool,
  ...SinglePotionIngredientProps,
};

const PotionIngredientRow = ({ editable, elements }) => (
  <div>
    {elements.map((element, index) => (
      <SinglePotionIngredient key={index} editable={editable} {...element} />
    ))}
  </div>
);

PotionIngredientRow.propTypes = {
  editable: PropTypes.bool,
  elements: PropTypes.arrayOf(PropTypes.shape(SinglePotionIngredientProps)),
};

const Potion = ({ editable, potion, setPotion }) => {
  const rows = {};

  const setAmount = ingredientID => {
    const setAmountForIngredient = amount => {
      if (!/^\d+$/.test(amount)) return;
      if (amount > 25) return;
      setPotion(config => ({
        ...config,
        [ingredientID]: parseInt(amount, 10),
      }));
    };
    return setAmountForIngredient;
  };

  Object.entries(potion).forEach(entry => {
    const [ingredientID, amount] = entry;
    const row = Math.trunc((ingredientID - 1) / 4);
    const element = {
      ingredientID: parseInt(ingredientID, 10),
      amount,
      setAmount: setAmount(ingredientID),
    };
    const currentRow = rows[row] || [];
    currentRow.push(element);
    rows[row] = currentRow;
  });

  const validConfig =
    Object.values(potion).reduce((prev, curr) => prev + curr, 0) <= 25;

  return (
    <>
      <div>
        <h3>Potion</h3>
      </div>
      <div>
        {Object.keys(rows).map((rowNumber, index) => (
          <PotionIngredientRow
            key={index}
            editable={editable}
            elements={rows[rowNumber]}
          />
        ))}
      </div>
      {validConfig || (
        <div>
          <p className="error">
            You cannot use more than 25 ingredients in one potion.
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

Potion.propTypes = {
  editable: PropTypes.bool,
  potion: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  setPotion: PropTypes.func,
};

export default Potion;
