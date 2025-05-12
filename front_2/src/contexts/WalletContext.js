import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import walletConnectFcn from '../components/hedera/walletConnectFcn';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing wallet connection on initial load
  useEffect(() => {
    const checkConnectedWallet = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_accounts", []);
          if (accounts.length > 0) {
            setWallet(accounts[0]);
          }
        } catch (err) {
          console.error("Error checking connected wallet:", err);
        }
      }
    };
    checkConnectedWallet();
  }, []);

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [selectedAccount] = await walletConnectFcn();
      setWallet(selectedAccount);
      localStorage.setItem('connectedWallet', selectedAccount);
      return selectedAccount;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    localStorage.removeItem('connectedWallet');
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        error,
        isLoading,
        connectWallet,
        disconnectWallet,
        isConnected: !!wallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};