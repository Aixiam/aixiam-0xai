import React from 'react';
import VyperEditor from '../components/VyperEditor';

const VyperCompilerPage: React.FC = () => {
  return (
    <div className="py-8">
      <h1 className="text-4xl font-extrabold text-white text-center mb-10">
        Interactive Vyper Smart Contract Compiler
      </h1>
      <div className="max-w-6xl mx-auto">
        <VyperEditor />
      </div>
    </div>
  );
};

export default VyperCompilerPage;
