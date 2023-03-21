import { effects } from '../engine/mappings';

const ChanceLine = ({ effect, chance }) => (
  <>
    <div className={`row ${chance === '0.00%' ? 'zero' : ''}`}>
      <span className="chance">{chance}</span>
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

const PotionStats = ({ potionStats, recalculationRequired }) => {
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
            chance={effect.probability}
          />
        ))}
      </div>
    </div>
  );
};

export default PotionStats;
