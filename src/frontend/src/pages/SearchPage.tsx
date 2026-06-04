import React from 'react';
import AISearchBar from '../components/AISearchBar';

const SearchPage: React.FC = () => {
  return (
    <div className="py-8">
      <h1 className="text-4xl font-extrabold text-white text-center mb-10">
        AI-Powered Decentralized Search Engine
      </h1>
      <div className="max-w-4xl mx-auto">
        <AISearchBar />
      </div>
    </div>
  );
};

export default SearchPage;
