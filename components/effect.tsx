import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { imagesEffects } from '@/assets/assets';

type EffectProps = {
  effect: number;
};

const EffectText = ({ effect }: EffectProps) => {
  const effectNames = useTranslations('effects');
  return <>{effectNames(effect.toString())}</>;
};

const EffectImage = ({ effect }: EffectProps) => {
  const effectNames = useTranslations('effects');
  return (
    <>
      <Image
        alt={effectNames(effect.toString())}
        unoptimized
        src={imagesEffects[effect]}
        height="16"
        width="16"
        style={{
          display: 'inline',
          height: '1.2em',
          width: 'auto',
          verticalAlign: 'middle',
        }}
      />
    </>
  );
};

export { EffectText, EffectImage };
