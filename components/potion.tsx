import { Dispatch, SetStateAction } from 'react';

type SinglePotionIngredientType = {
  ingredientID: number;
  amount: number;
  setAmount: (amount: string) => void;
};

type SinglePotionIngredientProps = {
  editable: boolean;
} & SinglePotionIngredientType;

const SinglePotionIngredient = ({
  editable,
  ingredientID,
  amount,
  setAmount,
}: SinglePotionIngredientProps) => (
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

type PotionIngredientRowProps = {
  editable: boolean;
  elements: Array<SinglePotionIngredientType>;
};

const PotionIngredientRow = ({
  editable,
  elements,
}: PotionIngredientRowProps) => (
  <div>
    {elements.map((element, index) => (
      <SinglePotionIngredient key={index} editable={editable} {...element} />
    ))}
  </div>
);

export type PotionType = {
  [x: number]: number;
};

type PotionProps = {
  editable: boolean;
  potion: PotionType;
  setPotion: Dispatch<SetStateAction<PotionType>>;
};

type RowType = {
  [x: number]: Array<SinglePotionIngredientType>;
};

const Potion = ({ editable, potion, setPotion }: PotionProps) => {
  const rows: RowType = {};

  const setAmount = (ingredientID: number) => {
    const setAmountForIngredient = (amount_str: string) => {
      if (!/^\d+$/.test(amount_str)) return;
      const amount = parseInt(amount_str);
      if (amount > 25) return;
      setPotion(config => ({
        ...config,
        [ingredientID]: amount,
      }));
    };
    return setAmountForIngredient;
  };

  Object.entries(potion).forEach(entry => {
    const ingredientID = parseInt(entry[0]);
    const amount = entry[1];
    const row = Math.trunc((ingredientID - 1) / 4);
    const element = {
      ingredientID: ingredientID,
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
            elements={rows[parseInt(rowNumber)]}
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

export default Potion;
