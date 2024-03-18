import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WalletInfo {
  signer: any; // Consider using a more specific type here if possible.
  username: string;
}

interface WalletContextType {
  walletInfo: WalletInfo;
  setWalletInfo: (walletInfo: WalletInfo) => void;
}

// Initialize the context with a default value of type WalletContextType or null
const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === null) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({ signer: null, username: '' });

  return (
    <WalletContext.Provider value={{ walletInfo, setWalletInfo }}>
      {children}
    </WalletContext.Provider>
  );
};
