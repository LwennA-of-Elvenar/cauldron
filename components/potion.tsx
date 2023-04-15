import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import Image from 'next/image';
import {
  parseInteger,
  parseAndSetValues,
  isEquivalent,
  disallowNonDigits,
} from '@/engine/input_validation';
import { saveDiamondIngredientsConfig } from '@/engine/cookie';
import {
  imageUseDiamonds,
  imageUseWitchPoints,
  imagesIngredients,
} from '@/assets/assets';

type SinglePotionIngredientType = {
  ingredientID: number;
  amount: number;
  setAmount: (amount: number) => void;
  requiresDiamonds: boolean;
  setRequiresDiamonds: (requiresDiamonds: boolean) => void;
};

type SinglePotionIngredientProps = {
  editable: boolean;
} & SinglePotionIngredientType;

const SinglePotionIngredient = ({
  editable,
  ingredientID,
  amount,
  setAmount,
  requiresDiamonds,
  setRequiresDiamonds,
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
      <div className="table">
        <div className="row">
          <Image
            alt="ingredient"
            unoptimized
            src={imagesIngredients[ingredientID]}
            height="64"
            width="64"
            style={{
              display: 'table-cell',
              height: 'auto',
              width: '100%',
            }}
          />
        </div>
        <div className="row">
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
        </div>
        <div className="row">
          <div
            className={`diamondSelection ${editable ? 'enabled' : 'disabled'}`}
            onClick={() => {
              if (editable) setRequiresDiamonds(!requiresDiamonds);
            }}
          >
            <div className={`${requiresDiamonds && 'hiddenButton'}`}>
              <Image
                alt="use witch points"
                unoptimized
                src={imageUseWitchPoints}
                height="64"
                width="64"
                style={{
                  display: 'block',
                  height: 'auto',
                  width: '100%',
                }}
              />
            </div>
            <div className={`${requiresDiamonds || 'hiddenButton'}`}>
              <Image
                alt="use diamonds"
                unoptimized
                src={imageUseDiamonds}
                height="64"
                width="64"
                style={{
                  display: 'block',
                  height: 'auto',
                  width: '100%',
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        div.table {
          display: table;
          width: 3em;
        }
        div.row {
          display: table-row;
        }
        div.diamondSelection {
          display: grid;
        }
        div.enabled:hover {
          filter: brightness(1.2);
        }
        div.diamondSelection > div {
          grid-row: 1;
          grid-column: 1;
        }
        div.disabled {
          filter: grayscale(0.7);
        }
        div.hiddenButton {
          opacity: 0%;
          transition: 0.3s;
        }
        input {
          width: 100%;
          box-sizing: border-box;
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
  <>
    <div className="row">
      {elements.map((element, index) => (
        <div className="ingredient" key={index}>
          <SinglePotionIngredient editable={editable} {...element} />
        </div>
      ))}
    </div>
    <style jsx>{`
      div.row {
        display: table-row;
      }
      div.ingredient {
        display: table-cell;
        padding-right: 20px;
        padding-bottom: 7px;
      }
      div.ingredient:last-child {
        padding-right: 0px;
      }
      input {
        width: 3em;
      }
    `}</style>
  </>
);

export type PotionType = {
  [x: number]: number;
};

export type DiamondIngredientConfigType = {
  [x: number]: boolean;
};

type PotionProps = {
  editable: boolean;
  potion: PotionType;
  setPotion: Dispatch<SetStateAction<PotionType>>;
  diamondIngredientConfig: DiamondIngredientConfigType;
  setDiamondIngredientConfig: Dispatch<
    SetStateAction<DiamondIngredientConfigType>
  >;
};

type RowType = {
  [x: number]: Array<SinglePotionIngredientType>;
};

const Potion = ({
  editable,
  potion,
  setPotion,
  diamondIngredientConfig,
  setDiamondIngredientConfig,
}: PotionProps) => {
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

  for (let ingredientID = 1; ingredientID <= 12; ingredientID++) {
    const amount = potion[ingredientID];
    const requiresDiamonds = diamondIngredientConfig[ingredientID];
    const row = Math.trunc((ingredientID - 1) / 4);
    const element = {
      ingredientID: ingredientID,
      amount,
      setAmount: setAmount(ingredientID),
      requiresDiamonds,
      setRequiresDiamonds: setRequiresDiamonds(ingredientID),
    };
    const currentRow = rows[row] || [];
    currentRow.push(element);
    rows[row] = currentRow;
  }

  const validPotionConfig =
    Object.values(potion).reduce((prev, curr) => prev + curr, 0) <= 25;

  const validDiamondConfig =
    Object.values(diamondIngredientConfig).reduce(
      (prev, curr) => prev + (curr ? 1 : 0),
      0
    ) === 4;

  return (
    <>
      <div>
        <h3>Potion</h3>
      </div>
      <div className="potion">
        {Object.keys(rows).map((rowNumber, index) => (
          <PotionIngredientRow
            key={index}
            editable={editable}
            elements={rows[parseInt(rowNumber)]}
          />
        ))}
      </div>
      {validDiamondConfig || (
        <div>
          <p className="error">
            Please select exactly 4 ingredients that need diamonds.
          </p>
        </div>
      )}
      {validPotionConfig || (
        <div>
          <p className="error">
            You cannot use more than 25 ingredients in one potion.
          </p>
        </div>
      )}
      <style jsx>{`
        div.potion {
          display: table;
        }
        p.error {
          color: red;
        }
      `}</style>
    </>
  );
};

export default Potion;
