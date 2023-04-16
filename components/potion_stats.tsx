import { useTranslations } from 'next-intl';
import { EffectText, EffectImage } from '@/components/effect';

type ChanceLineProps = {
  effect: number;
  probability: string;
};

const ChanceLine = ({ effect, probability }: ChanceLineProps) => {
  return (
    <>
      <div className={`row ${probability === '0.00%' ? 'zero' : ''}`}>
        <span className="chance">{probability}</span>
        <span className="effect">
          <span className="effectImage">
            <EffectImage effect={effect} />
          </span>{' '}
          <EffectText effect={effect} />
        </span>
      </div>
      <style jsx>{`
        div.row {
          display: table-row;
        }
        span.effect,
        span.chance {
          display: table-cell;
          padding: 2px;
          white-space: nowrap;
          vertical-align: middle;
        }
        span.chance {
          text-align: right;
        }
        div.zero span {
          color: gray;
        }
        div.zero .effectImage {
          filter: saturate(0.3);
          opacity: 0.7;
        }
      `}</style>
    </>
  );
};

export type PotionStatsType = {
  witchPoints: number;
  diamonds: number;
  effects: Array<ChanceLineProps>;
};

type PotionStatsProps = {
  potionStats: PotionStatsType;
  hasValidIngredients: boolean;
};

const PotionStats = ({
  potionStats,
  hasValidIngredients,
}: PotionStatsProps) => {
  const t = useTranslations('potionStats');
  if (potionStats.witchPoints === 0 && potionStats.diamonds === 0) {
    return null;
  }
  return (
    <div style={{ visibility: hasValidIngredients ? 'visible' : 'hidden' }}>
      <h3>{t('title')}</h3>
      <p>
        {t('witchPoints')}: {potionStats.witchPoints}
      </p>
      <p>
        {t('diamonds')}: {potionStats.diamonds}
      </p>
      <div>
        {potionStats.effects.map((effect, index) => (
          <ChanceLine
            key={index}
            effect={effect.effect}
            probability={effect.probability}
          />
        ))}
      </div>
    </div>
  );
};

export default PotionStats;
