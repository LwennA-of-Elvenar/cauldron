import { saveDiplomas } from '../engine/cookie';

const Diplomas = ({ editable, diplomas, setDiplomas }) => {
  const verifyAndSetDiplomas = dipl => {
    if (!/^\d+$/.test(dipl)) return;
    if (dipl > 20) return;
    if (dipl < 1) return;
    setDiplomas(dipl);
    saveDiplomas(dipl);
  };

  return (
    <div>
      <h3>Research Diplomas</h3>
      Number of Diplomas:{' '}
      <input
        id="diplomas"
        disabled={!editable}
        type="number"
        min="1"
        max="20"
        value={diplomas}
        onChange={e => verifyAndSetDiplomas(e.target.value)}
      />
    </div>
  );
};

export default Diplomas;
