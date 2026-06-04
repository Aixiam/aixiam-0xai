import React, { useState } from 'react';
import { compileVyperCode } from '../utils/web3';

const VyperEditor: React.FC = () => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const handleCompile = async () => {
    const res = await compileVyperCode(code);
    setOutput(JSON.stringify(res));
  };
  return (
    <div>
      <textarea value={code} onChange={e => setCode(e.target.value)} />
      <button onClick={handleCompile}>Compile</button>
      <pre>{output}</pre>
    </div>
  );
};
export default VyperEditor;
