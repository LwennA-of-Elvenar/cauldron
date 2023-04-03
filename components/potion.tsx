import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import {
  parseInteger,
  parseAndSetValues,
  isEquivalent,
  disallowNonDigits,
} from '@/engine/input_validation';

type SinglePotionIngredientType = {
  ingredientID: number;
  amount: number;
  setAmount: (amount: number) => void;
};

type SinglePotionIngredientProps = {
  editable: boolean;
} & SinglePotionIngredientType;

const SinglePotionIngredient = ({
  editable,
  ingredientID,
  amount,
  setAmount,
}: SinglePotionIngredientProps) => {
  const [internalAmount, setInternalAmount] = useState<string>(
    amount.toString()
  );

  useEffect(() => {
    if (!isEquivalent(amount, internalAmount)) {
      setInternalAmount(amount.toString());
    }
  }, [amount]); // eslint-disable-line react-hooks/exhaustive-deps

  const isValidAmount = (amount: number) => {
    if (amount < 0) return false;
    if (amount > 25) return false;
    return true;
  };

  return (
    <>
      <input
        id={`potionIngredient${ingredientID.toString()}`}
        disabled={!editable}
        type="number"
        min="0"
        max="25"
        value={internalAmount}
        onBeforeInput={disallowNonDigits}
        onChange={e => {
          parseAndSetValues(
            e.target.value,
            parseInteger,
            isValidAmount,
            setInternalAmount,
            setAmount
          );
        }}
        onBlur={e => {
          if (e.target.value == '') {
            setInternalAmount('0');
          }
        }}
      />
      <style jsx>{`
        input {
          width: 3em;
        }
      `}</style>
    </>
  );
};

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
    const setAmountForIngredient = (amount: number) => {
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
