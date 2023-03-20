import PropTypes from "prop-types";

const SinglePotionIngredient = ({editable, ingredientID, amount, setAmount}) => {

    return (
        <>
        <input id={"potionIngredient" + ingredientID.toString()} disabled={!editable} type="number" min="0" max="25" value={amount} onChange={(e) => {setAmount(e.target.value)}} />
        <style jsx>{`
            input {
                width: 3em;
            }
        `}</style>
        </>
    )
}

const SinglePotionIngredientProps = {
    ingredientID: PropTypes.number,
    amount: PropTypes.number,
    setAmount: PropTypes.func
}

SinglePotionIngredient.propTypes = {
    editable: PropTypes.bool,
    ...SinglePotionIngredientProps
}

const PotionIngredientRow = ({editable, elements}) => {

    return (
      <div>
        {elements.map((element, index) => (<SinglePotionIngredient key={index} editable={editable} {...element} />))}
      </div>
    )
}

PotionIngredientRow.propTypes = {
    editable: PropTypes.bool,
    elements: PropTypes.arrayOf(PropTypes.shape(
        SinglePotionIngredientProps
    ))
}

const Potion = ({editable, potion, setPotion}) => {
    let rows = {}

    const setAmount = (ingredientID) => {
        const setAmountForIngredient = (amount) => {
            if (!/^\d+$/.test(amount)) return;
            if (amount > 25) return;
            setPotion(config => {
                return {
                    ...config,
                    [ingredientID]: parseInt(amount)
                };
            })
        }
        return setAmountForIngredient
    }

    for (let [ingredientID, amount] of Object.entries(potion)) {
        const row = Math.trunc((ingredientID - 1) / 4);
        const element = {
            ingredientID: parseInt(ingredientID),
            amount: amount,
            setAmount: setAmount(ingredientID)
        }
        let currentRow = rows[row] || [];
        currentRow.push(element);
        rows[row] = currentRow;
    }

    const validConfig = (Object.values(potion).reduce((prev, curr) => prev + curr, 0) <= 25) ? true : false;

    return (
        <>
            <div>
                <h3>Potion</h3>
            </div>
            <div>
                {Object.keys(rows).map((rowNumber, index) => (
                    <PotionIngredientRow key={index} editable={editable} elements={rows[rowNumber]} />
                ))}
            </div>
            {validConfig ||
                <div>
                    <p className="error">
                        You cannot use more than 25 ingredients in one potion.
                    </p>
                </div>
            }
            <style jsx>{`
                p.error {
                    color: red;
                }
            `}</style>
        </>
    )

}

Potion.propTypes = {
    editable: PropTypes.bool,
    potion: PropTypes.object,
    setPotion: PropTypes.func
}

export default Potion
