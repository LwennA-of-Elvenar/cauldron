import { Dispatch, SetStateAction, CompositionEvent } from 'react';

type ParseResult = {
  valid: boolean;
  asString: string;
  asNumber: number;
};

const parseIntegerWithDefault = (
  inputString: string,
  defaultInterpretation: number
): ParseResult => {
  if (inputString == '') {
    return {
      valid: true,
      asString: inputString,
      asNumber: defaultInterpretation,
    };
  }
  if (!/^\d+$/.test(inputString)) {
    return {
      valid: false,
      asString: '',
      asNumber: defaultInterpretation,
    };
  }
  return {
    valid: true,
    asString: inputString,
    asNumber: parseInt(inputString),
  };
};

export const parseInteger = (inputString: string): ParseResult => {
  return parseIntegerWithDefault(inputString, 0);
};

export const getParseIntegerWithDefault = (defaultInterpretation: number) => {
  const parseIntegerWithGivenDefault = (inputString: string): ParseResult => {
    return parseIntegerWithDefault(inputString, defaultInterpretation);
  };
  return parseIntegerWithGivenDefault;
};

export const parseAndSetValues = (
  newValue: string,
  parseFunc: (input: string) => ParseResult,
  validationFunc: (newValue: number) => boolean,
  setInternalValueFunc: Dispatch<SetStateAction<string>>,
  setExternalValueFunc: (newValue: number) => void
) => {
  const { valid, asString, asNumber } = parseFunc(newValue);
  if (!valid) return;
  if (!validationFunc(asNumber)) return;
  setInternalValueFunc(asString);
  setExternalValueFunc(asNumber);
};

export const isEquivalentWithDefault = (
  asNumber: number,
  asString: string,
  defaultInterpretation: number
) => {
  if (asNumber.toString() == asString) return true;
  if (asNumber == defaultInterpretation && asString == '') return true;
  return false;
};

export const isEquivalent = (asNumber: number, asString: string) => {
  return isEquivalentWithDefault(asNumber, asString, 0);
};

export const disallowNonDigits = (e: CompositionEvent<HTMLInputElement>) => {
  if (!/^\d+$/.test(e.data)) {
    e.preventDefault();
  }
};
