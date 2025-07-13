import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';

export function WalletConnection() {
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();

  return (
    <div className="flex items-center space-x-4">
      {isConnected ? (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-medium">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </span>
          </div>
          <button
            onClick={disconnectWallet}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Disconnect</span>
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Wallet className="h-4 w-4" />
          <span>Connect Wallet</span>
        </button>
      )}
    </div>
  );
}