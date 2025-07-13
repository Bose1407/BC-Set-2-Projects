import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers, BrowserProvider, Contract, Signer } from 'ethers';
import toast from 'react-hot-toast';

interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: Signer | null;
  account: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getContract: (address: string, abi: any[]) => Contract | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error('MetaMask is not installed. Please install MetaMask to continue.');
        return;
      }

      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        toast.error('No accounts found. Please check your MetaMask.');
        return;
      }

      const signerInstance = await browserProvider.getSigner();
      const address = await signerInstance.getAddress();

      setProvider(browserProvider);
      setSigner(signerInstance);
      setAccount(address);
      setIsConnected(true);
      
      toast.success(`Connected to ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setIsConnected(false);
    toast.success('Wallet disconnected');
  };

  const getContract = (address: string, abi: any[]): Contract | null => {
    if (!signer) {
      toast.error('Please connect your wallet first');
      return null;
    }
    return new Contract(address, abi, signer);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        isConnected,
        connectWallet,
        disconnectWallet,
        getContract,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}