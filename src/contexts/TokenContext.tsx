import React, { createContext, useContext, useState } from 'react';
import type { Token, TokenFeature } from '../types';
import { getSOLPrice } from '../utils/price';
import { monitorBondingCurve } from '../utils/liquidity';

interface TokenContextType {
  tokens: Token[];
  addToken: (token: Token) => void;
  removeToken: (address: string) => void;
  updateTokenFeatures: (address: string, features: TokenFeature[]) => void;
  updateTokenLiquidity: (address: string, liquidity: number) => void;
  startMonitoring: (address: string) => void;
  stopMonitoring: (address: string) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [monitors] = useState<Map<string, () => void>>(new Map());

  const addToken = (token: Token) => {
    setTokens(current => [...current, token]);
  };

  const removeToken = (address: string) => {
    // Stop monitoring if active
    stopMonitoring(address);
    setTokens(current => current.filter(token => token.address !== address));
  };

  const updateTokenFeatures = (address: string, features: TokenFeature[]) => {
    setTokens(current =>
      current.map(token =>
        token.address === address
          ? { ...token, features }
          : token
      )
    );
  };

  const updateTokenLiquidity = (address: string, liquidity: number) => {
    setTokens(current =>
      current.map(token =>
        token.address === address
          ? { ...token, liquidity }
          : token
      )
    );
  };

  const startMonitoring = (address: string) => {
    if (monitors.has(address)) return;

    const token = tokens.find(t => t.address === address);
    if (!token) return;

    const stopMonitor = monitorBondingCurve(
      window.connection,
      address,
      ({ currentAmount, currentUSD }) => {
        updateTokenLiquidity(address, currentAmount);
      }
    );

    monitors.set(address, stopMonitor);
  };

  const stopMonitoring = (address: string) => {
    const stopMonitor = monitors.get(address);
    if (stopMonitor) {
      stopMonitor();
      monitors.delete(address);
    }
  };

  return (
    <TokenContext.Provider
      value={{
        tokens,
        addToken,
        removeToken,
        updateTokenFeatures,
        updateTokenLiquidity,
        startMonitoring,
        stopMonitoring
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokens must be used within a TokenProvider');
  }
  return context;
}