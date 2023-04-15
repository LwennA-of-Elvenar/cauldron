import { DiamondIngredientConfigType } from '@/components/potion';
import { PotionType } from '@/components/potion';
import { DesiredEffectsType } from '@/components/desired_effects';

type AllowedObjectValueTypes = string | number | boolean;

type ObjectType<T extends AllowedObjectValueTypes> = {
  [x: string]: T;
};

type LineFormatter<T extends AllowedObjectValueTypes> = (
  key: string,
  value: T
) => string;

const simpleLineFormatter = (key: string, value: string | number) => {
  return `(${key}, ${value})`;
};

const boolLineFormatter = (key: string, value: boolean) => {
  return `(${key}, ${value ? 1 : 0})`;
};

const objectToTupleString = <T extends AllowedObjectValueTypes>(
  obj: ObjectType<T>,
  lineFormatter: LineFormatter<T>
) => {
  const result = [];
  for (const [key, value] of Object.entries(obj)) {
    result.push(lineFormatter(key, value));
  }
  return result.join(',');
};

export const insertPotionIntoDB = (potion: PotionType) => {
  const dataTuples = objectToTupleString(potion, simpleLineFormatter);
  const statement = `
        DELETE FROM potion;
        INSERT INTO potion (ingredient, amount)
        VALUES
        ${dataTuples};
    `;
  return statement;
};

export const insertDiamondIngredientConfigIntoDB = (
  diamondIngredientConfig: DiamondIngredientConfigType
) => {
  const dataTuples = objectToTupleString(
    diamondIngredientConfig,
    boolLineFormatter
  );
  const statement = `
        DELETE FROM diamond_ingredients;
        INSERT INTO diamond_ingredients (ingredient, diamond)
        VALUES
        ${dataTuples};
    `;
  return statement;
};

export const insertDesiredEffectsIntoDB = (
  desiredEffects: DesiredEffectsType
) => {
  const dataTuples = objectToTupleString(desiredEffects, simpleLineFormatter);
  const statement = `
        DELETE FROM desired_effects;
        INSERT INTO desired_effects (effect, weight)
        VALUES
        ${dataTuples};
    `;
  return statement;
};

export const calculateChancesQuery = (diplomas: number) => {
  const statement = `
        WITH adjusted_experiment AS
        (
            SELECT
                sample,
                ingredient,
                amount,
                min_amount,
                sum_amount
            FROM 
            (
                SELECT
                sample,
                ingredient,
                SUM(amount) as amount,
                MIN(SUM(amount)) OVER (PARTITION BY sample) as min_amount,
                SUM(SUM(amount)) OVER (PARTITION BY sample) as sum_amount
                FROM (
                    SELECT DISTINCT
                        e.sample,
                        e.depth,
                        p.ingredient,
                        p.amount
                    FROM potion p, experiments e
                    UNION ALL
                    SELECT
                        e.sample,
                        e.depth,
                        e.ingredient,
                        e.amount
                    FROM experiments e
                ) t
                WHERE t.depth <= 0
                GROUP BY sample, ingredient
            ) t
            WHERE t.min_amount >= 0
            AND t.sum_amount <= 25
        ),
        ordered_ingredients AS
        (
            SELECT
                p.sample,
                p.ingredient,
                d.diamond,
                p.amount,
                p.sum_amount,
                row_number() OVER (PARTITION BY p.sample, d.diamond ORDER BY amount DESC) AS rownumber
            FROM adjusted_experiment p
            JOIN diamond_ingredients d
            ON p.ingredient = d.ingredient
        ),
        previous_amounts AS
        (
            SELECT
                sample,
                ingredient,
                diamond,
                amount,
                sum_amount,
                SUM(amount) OVER (PARTITION BY sample, diamond ORDER BY rownumber RANGE BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS previous_amount
            FROM ordered_ingredients
        ),
        costs AS 
            (
            SELECT
                sample,
                ingredient,
                a.amount,
                a.sum_amount,
                SUM(CASE WHEN diamond = 0 THEN
                    c.cost
                ELSE
                    0
                END) OVER (PARTITION BY sample) AS point_cost,
                SUM(CASE WHEN diamond = 1 THEN
                    a.amount * 25
                ELSE
                    0
                END) OVER (PARTITION BY sample) AS diamond_cost
            FROM previous_amounts a
            JOIN accumulated_cost c
            ON a.amount = c.amount
            AND COALESCE(a.previous_amount, 0) = c.previous_amount
        ),
        strength AS
        (
            SELECT
            sample,
            MAX(sum_amount) as sum_amount,
            MAX(point_cost) as point_cost,
            MAX(diamond_cost) as diamond_cost,
            effect,
            MAX(0, SUM(value*amount) * POWER(1.1, SUM(factor*amount))) AS relative_probability
            FROM costs p
            JOIN ingredient_config c
            ON p.ingredient = c.ingredient
            WHERE effect <= ${diplomas}
            GROUP BY sample, effect
        ),
        chances AS
            (
            SELECT 
                sample,
                effect,
                point_cost,
                diamond_cost,
                CASE WHEN relative_probability = 0 THEN
                0
                ELSE
                relative_probability / (SUM(relative_probability) OVER (PARTITION BY sample)) * 0.2 * SQRT(sum_amount)
                END AS single_probability,
                1 - POWER( 1 - CASE WHEN relative_probability = 0 THEN
                0
                ELSE
                relative_probability / (SUM(relative_probability) OVER (PARTITION BY sample)) * 0.2 * SQRT(sum_amount)
                END, 5) AS probability
            FROM strength
        )
        SELECT effect, point_cost, diamond_cost, single_probability FROM chances
        ORDER BY single_probability desc, effect;
    `;
  return statement;
};

export const optimizePotionQuery = (
  diplomas: number,
  witchPointLimit: number,
  diamondsLimit: number
) => {
  const statement = `
        WITH adjusted_experiment AS
        (
            SELECT
                sample,
                ingredient,
                amount,
                min_amount,
                sum_amount
            FROM 
            (
                SELECT
                sample,
                ingredient,
                SUM(amount) as amount,
                MIN(SUM(amount)) OVER (PARTITION BY sample) as min_amount,
                SUM(SUM(amount)) OVER (PARTITION BY sample) as sum_amount
                FROM (
                    SELECT DISTINCT
                        e.sample,
                        e.depth,
                        p.ingredient,
                        p.amount
                    FROM potion p, experiments e
                    UNION ALL
                    SELECT
                        e.sample,
                        e.depth,
                        e.ingredient,
                        e.amount
                    FROM experiments e
                ) t
                WHERE t.depth <= 4
                GROUP BY sample, ingredient
            ) t
            WHERE t.min_amount >= 0
            AND t.sum_amount <= 25
        ),
        ordered_ingredients AS
        (
            SELECT
                p.sample,
                p.ingredient,
                d.diamond,
                p.amount,
                p.sum_amount,
                row_number() OVER (PARTITION BY p.sample, d.diamond ORDER BY amount DESC) AS rownumber
            FROM adjusted_experiment p
            JOIN diamond_ingredients d
            ON p.ingredient = d.ingredient
        ),
        previous_amounts AS
        (
            SELECT
                sample,
                ingredient,
                diamond,
                amount,
                sum_amount,
                SUM(amount) OVER (PARTITION BY sample, diamond ORDER BY rownumber RANGE BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS previous_amount
            FROM ordered_ingredients
        ),
        costs AS 
            (
            SELECT
                sample,
                ingredient,
                a.amount,
                a.sum_amount,
                SUM(CASE WHEN diamond = 0 THEN
                    c.cost
                ELSE
                    0
                END) OVER (PARTITION BY sample) AS point_cost,
                SUM(CASE WHEN diamond = 1 THEN
                    a.amount * 25
                ELSE
                    0
                END) OVER (PARTITION BY sample) AS diamond_cost
            FROM previous_amounts a
            JOIN accumulated_cost c
            ON a.amount = c.amount
            AND COALESCE(a.previous_amount, 0) = c.previous_amount
        ),
        strength AS
        (
            SELECT
            sample,
            MAX(sum_amount) as sum_amount,
            MAX(point_cost) as point_cost,
            MAX(diamond_cost) as diamond_cost,
            effect,
            MAX(0, SUM(value*amount) * POWER(1.1, SUM(factor*amount))) AS relative_probability
            FROM costs p
            JOIN ingredient_config c
            ON p.ingredient = c.ingredient
            WHERE effect <= ${diplomas}
            AND p.point_cost <= ${witchPointLimit}
            AND p.diamond_cost <= ${diamondsLimit}
            GROUP BY sample, effect
        ),
        chances AS
            (
            SELECT 
                sample,
                effect,
                point_cost,
                diamond_cost,
                1 - POWER( 1 - CASE WHEN relative_probability = 0 THEN
                0
                ELSE
                relative_probability / (SUM(relative_probability) OVER (PARTITION BY sample)) * 0.2 * SQRT(sum_amount)
                END, 5) AS probability
            FROM strength
        ),
        score AS
            (
            SELECT 
            sample,
            point_cost,
            diamond_cost,
            CASE WHEN MIN(probability) = 0 THEN 
            0
            ELSE
                SUM(e.weight) / SUM( e.weight / probability)
            END as harmonic_mean
            FROM chances c
            JOIN desired_effects e
            ON c.effect = e.effect
            GROUP BY sample, point_cost, diamond_cost
        ),
        best_samples AS
        (
            SELECT 
                sample,
                point_cost,
                diamond_cost,
                harmonic_mean
            FROM
                (
                SELECT 
                    sample,
                    point_cost,
                    diamond_cost,
                    harmonic_mean,
                    MAX(harmonic_mean) OVER (PARTITION BY 1) AS max_harmonic_mean
                FROM score
            ) t
            WHERE t.harmonic_mean = t.max_harmonic_mean
        )
        SELECT 
            b.sample,
            b.point_cost,
            b.diamond_cost,
            b.harmonic_mean,
            e.ingredient,
            e.amount	
        FROM best_samples b
        JOIN adjusted_experiment e
        ON b.sample = e.sample
        ORDER BY b.diamond_cost, b.point_cost, b.sample, e.ingredient;
        
    `;
  return statement;
};
