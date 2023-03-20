import { saveDiplomas } from '../engine/cookie'

const Diplomas = ({editable, diplomas, setDiplomas}) => {


    const verifyAndSetDiplomas = (diplomas) => {
        if (!/^\d+$/.test(diplomas)) return;
        if (diplomas > 20) return;
        if (diplomas < 1) return;
        setDiplomas(diplomas);
        saveDiplomas(diplomas);
    }

    return (
        <div>
            <h3>Research Diplomas</h3>
            Number of Diplomas: <input id="diplomas" disabled={!editable} type="number" min="1" max="20" value={diplomas} onChange={(e) => verifyAndSetDiplomas(e.target.value)} />
        </div>
    )

}

export default Diplomas