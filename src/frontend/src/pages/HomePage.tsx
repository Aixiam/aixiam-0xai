import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../hooks/UseWeb3';

const HomePage: React.FC = () => {
  const { isConnected, address, versoriumxEnsAddress, isLoadingEns, ensError } = useWeb3();

  return (
    <div className="text-center py-16">
      <h1 className="text-5xl font-extrabold text-white mb-6">
        Welcome to <span className="text-versoriumx-blue">VersoriumX</span>
      </h1>
      <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
        Your gateway to AI-driven Web3 exploration, Vyper smart contract development, and decentralized data.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
        <Link to="/compiler" className="block p-8 bg-gray-800 rounded-lg shadow-xl hover:shadow-2xl hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:-translate-y-2 group">
          <h2 className="text-3xl font-bold text-versoriumx-light-blue mb-4 group-hover:text-white">Vyper Compiler</h2>
          <p className="text-gray-400 group-hover:text-gray-200">
            Develop, compile, and test your Vyper smart contracts directly in your browser.
          </p>
        </Link>
        <Link to="/search" className="block p-8 bg-gray-800 rounded-lg shadow-xl hover:shadow-2xl hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:-translate-y-2 group">
          <h2 className="text-3xl font-bold text-versoriumx-light-blue mb-4 group-hover:text-white">AI Search</h2>
          <p className="text-gray-400 group-hover:text-gray-200">
            Discover on-chain data and IPFS content with our intelligent AI-powered search engine.
          </p>
        </Link>
        <div className="p-8 bg-gray-800 rounded-lg shadow-xl hover:shadow-2xl hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:-translate-y-2 group">
          <h2 className="text-3xl font-bold text-versoriumx-light-blue mb-4 group-hover:text-white">IPFS Storage</h2>
          <p className="text-gray-400 group-hover:text-gray-200">
            Leverage Pinata for decentralized and permanent storage of your project's data and assets.
          </p>
        </div>
      </div>

      <div className="mt-12 p-8 bg-gray-800 rounded-lg shadow-lg max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-versoriumx-light-blue mb-6">Project Status</h2>
        <div className="text-left space-y-4">
          <p className="text-gray-300 text-lg">
            Wallet Connection: {isConnected ? <span className="text-green-500">Active</span> : <span className="text-red-500">Not Connected</span>}
          </p>
          {isConnected && (
            <p className="text-gray-300 text-lg">
              Your Address: <span className="font-mono text-versoriumx-light-blue">{address?.slice(0,6)}...{address?.slice(-4)}</span>
            </p>
          )}
          <p className="text-gray-300 text-lg">
            `versoriumx.eth` address:
            {isLoadingEns ? (
              <span className="ml-2 text-gray-500">Resolving...</span>
            ) : ensError ? (
              <span className="ml-2 text-red-500">Error resolving ENS</span>
            ) : versoriumxEnsAddress ? (
              <span className="ml-2 font-mono text-versoriumx-light-blue">{versoriumxEnsAddress}</span>
            ) : (
              <span className="ml-2 text-gray-500">Not resolved</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
