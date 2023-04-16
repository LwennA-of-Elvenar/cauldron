import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
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
  imageJar,
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
  const ingredientNames = useTranslations('ingredients');
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
      <div className="grid">
        <div className="jarbox">
          <Image
            alt="jar"
            unoptimized
            src={imageJar}
            height="64"
            width="64"
            style={{
              display: 'block',
              height: 'auto',
              width: '100%',
              zIndex: '1',
            }}
          />
          <Image
            alt={ingredientNames(ingredientID.toString())}
            title={ingredientNames(ingredientID.toString())}
            unoptimized
            src={imagesIngredients[ingredientID]}
            height="64"
            width="64"
            style={{
              display: 'block',
              height: 'auto',
              width: '60%',
              position: 'absolute',
              top: '20%',
              left: '20%',
              zIndex: '2',
            }}
          />
        </div>
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
                marginTop: '0.15em',
              }}
            />
          </div>
        </div>
      </div>
      <style jsx>{`
        div.grid {
          display: grid;
          width: 4em;
          position: relative;
        }
        div.jarbox {
          grid-column: 1;
          grid-row: 1;
          position: relative;
        }
        div.enabled:hover {
          filter: brightness(1.2);
        }
        div.diamondSelection {
          position: absolute;
          z-index: 3;
          display: grid;
          top: 0px;
          right: 0px;
          width: 1.5em;
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
          grid-row: 2;
          grid-column: 1;
          width: 75%;
          margin-left: auto;
          margin-right: auto;
          margin-top: -20%;
          z-index: 3;
          box-sizing: border-box;
          border: 1px solid black;
          border-radius: 3px;
          background-color: beige;
        }
        input:disabled {
          opacity: 100%;
          background-color: rgb(239, 239, 239);
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

export const getTotalIngredients = (potion: PotionType) => {
  return Object.values(potion).reduce((prev, curr) => prev + curr, 0);
};

const Potion = ({
  editable,
  potion,
  setPotion,
  diamondIngredientConfig,
  setDiamondIngredientConfig,
}: PotionProps) => {
  const t = useTranslations('potion');
  const ingredientNames = useTranslations('ingredients');

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

  const validPotionConfig = getTotalIngredients(potion) <= 25;

  const validDiamondConfig =
    Object.values(diamondIngredientConfig).reduce(
      (prev, curr) => prev + (curr ? 1 : 0),
      0
    ) === 4;

  const orderedIngredientsText = Object.entries(potion)
    .filter(([, a]) => a > 0)
    .sort(([, a], [, b]) => b - a)
    .map(
      ([ingredientID, amount]) =>
        `${amount}x ${ingredientNames(ingredientID.toString())}`
    )
    .join('\n');

  return (
    <>
      <div>
        <h3>{t('title')}</h3>
      </div>
      <p>
        {t('infoOrder')}{' '}
        <span
          className="orderInfo"
          title={`${t('detailsOrder')}\n\n${orderedIngredientsText}`}
        >
          {'\u{1F6C8}'}
        </span>
      </p>
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
          <p className="error">{t('errorFourDiamondIngredients')}</p>
        </div>
      )}
      {validPotionConfig || (
        <div>
          <p className="error">{t('errorMaxIngredients')}</p>
        </div>
      )}
      <style jsx>{`
        div.potion {
          display: table;
        }
        p.error {
          color: red;
        }
        .orderInfo {
          font-size: 1.2em;
          color: darkgreen;
          cursor: help;
        }
        .orderInfo:hover {
          color: green;
          text-shadow: 1px 1px 4px lightgreen;
        }
      `}</style>
    </>
  );
};

export default Potion;
