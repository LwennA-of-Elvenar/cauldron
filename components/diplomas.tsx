import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { saveDiplomas } from '@/engine/cookie';
import {
  getParseIntegerWithDefault,
  parseAndSetValues,
  isEquivalentWithDefault,
  disallowNonDigits,
} from '@/engine/input_validation';

type DiplomasProps = {
  editable: boolean;
  diplomas: number;
  setDiplomas: (diplomas: number) => void;
};

const Diplomas = ({ editable, diplomas, setDiplomas }: DiplomasProps) => {
  const t = useTranslations('diplomas');
  const [internalDiplomas, setInternalDiplomas] = useState<string>(
    diplomas.toString()
  );
  const setAndSaveDiplomas = (dipl: number) => {
    setDiplomas(dipl);
    saveDiplomas(dipl);
  };

  const isValidNumberOfDiplomas = (dipl: number) => {
    if (dipl > 20) return false;
    if (dipl < 1) return false;
    return true;
  };

  useEffect(() => {
    if (!isEquivalentWithDefault(diplomas, internalDiplomas, 1)) {
      setInternalDiplomas(diplomas.toString());
    }
  }, [diplomas]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h3>{t('title')}</h3>
      {t('diplomas')}:{' '}
      <input
        id="diplomas"
        disabled={!editable}
        type="number"
        min="1"
        max="20"
        value={internalDiplomas}
        onBeforeInput={disallowNonDigits}
        onChange={e =>
          parseAndSetValues(
            e.target.value,
            getParseIntegerWithDefault(1),
            isValidNumberOfDiplomas,
            setInternalDiplomas,
            setAndSaveDiplomas
          )
        }
        onBlur={e => {
          if (e.target.value == '') {
            setInternalDiplomas('1');
          }
        }}
      />
    </div>
  );
};

export default Diplomas;
