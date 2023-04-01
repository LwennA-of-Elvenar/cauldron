import { effects } from '@/engine/mappings';

type ChanceLineProps = {
  effect: number;
  probability: string;
};

const ChanceLine = ({ effect, probability }: ChanceLineProps) => (
  <>
    <div className={`row ${probability === '0.00%' ? 'zero' : ''}`}>
      <span className="chance">{probability}</span>
      <span className="effect">{effects[effect]}</span>
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
      }
      span.chance {
        text-align: right;
      }
      div.zero span {
        color: gray;
      }
    `}</style>
  </>
);

export type PotionStatsType = {
  witchPoints: number;
  diamonds: number;
  effects: Array<ChanceLineProps>;
};

type PotionStatsProps = {
  potionStats: PotionStatsType;
  recalculationRequired: boolean;
};

const PotionStats = ({
  potionStats,
  recalculationRequired,
}: PotionStatsProps) => {
  if (potionStats.witchPoints === 0 && potionStats.diamonds === 0) {
    return null;
  }
  return (
    <div style={{ visibility: recalculationRequired ? 'hidden' : 'visible' }}>
      <h3>Potion Cost and Effect Chances</h3>
      <p>Witch Points: {potionStats.witchPoints}</p>
      <p>Diamonds: {potionStats.diamonds}</p>
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
