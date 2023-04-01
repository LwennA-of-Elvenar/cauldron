import { saveDiplomas } from '@/engine/cookie';

type DiplomasProps = {
  editable: boolean;
  diplomas: number;
  setDiplomas: (diplomas: number) => void;
};

const Diplomas = ({ editable, diplomas, setDiplomas }: DiplomasProps) => {
  const verifyAndSetDiplomas = (dipl_str: string) => {
    if (!/^\d+$/.test(dipl_str)) return;
    const dipl = parseInt(dipl_str);
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
