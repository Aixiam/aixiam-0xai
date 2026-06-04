import React from 'react';
import { useConnect, useDisconnect, useAccount } from 'wagmi';

const WalletConnectButton: React.FC = () => {
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm font-mono text-versoriumx-light-blue">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={!connector.ready || isLoading}
          className="bg-versoriumx-blue hover:bg-versoriumx-light-blue text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {connector.name}
          {isLoading && connector.id === pendingConnector?.id && ' (connecting...)'}
        </button>
      ))}
    </div>
  );
};

export default WalletConnectButton;
