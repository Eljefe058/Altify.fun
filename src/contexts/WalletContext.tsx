// import React, { createContext, useContext, useState, useEffect } from 'react';
// import type { Connection, PublicKey } from '@solana/web3.js';
// import { connectToPhantom } from '../utils/solana';
//
// interface WalletContextType {
//   isConnected: boolean;
//   publicKey: PublicKey | null;
//   connection: Connection | null;
//   network: string;
//   balance: number | null;
//   connect: () => Promise<void>;
//   disconnect: () => void;
//   error: string | null;
//   isLoading: boolean;
//   wallet: any,
// }
//
// const WalletContext = createContext<WalletContextType | undefined>(undefined);
//
// export function WalletProvider({ children }: { children: React.ReactNode }) {
//   const [isConnected, setIsConnected] = useState(false);
//   const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
//   const [connection, setConnection] = useState<Connection | null>(null);
//   const [network, setNetwork] = useState('');
//   const [balance, setBalance] = useState<number | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [wallet, setWallet] = useState<any>(null);
//
//   // Auto-connect if previously connected
//   useEffect(() => {
//     const wasConnected = localStorage.getItem('walletConnected') === 'true';
//     if (wasConnected) {
//       connect();
//     }
//   }, []);
//
//   // Update balance when connection or publicKey changes
//   useEffect(() => {
//     if (connection && publicKey) {
//       updateBalance();
//     }
//   }, [connection, publicKey]);
//
//   const updateBalance = async () => {
//     if (connection && publicKey) {
//       try {
//         const balance = await connection.getBalance(publicKey);
//         setBalance(balance / 1e9); // Convert lamports to SOL
//       } catch (err) {
//         console.error('Failed to fetch balance:', err);
//       }
//     }
//   };
//
//   const connect = async () => {
//     try {
//       setError(null);
//       setIsLoading(true);
//
//       const { publicKey: pk, connection: conn, network: currentNetwork, wallet: walletObject } = await connectToPhantom();
//
//       setConnection(conn);
//       setPublicKey(pk);
//       setNetwork(currentNetwork);
//       setIsConnected(true);
//
//       // Store connection state
//       localStorage.setItem('walletConnected', 'true');
//
//       // Get initial balance
//       const balance = await conn.getBalance(pk);
//       setBalance(balance / 1e9);
//
//     } catch (err: any) {
//       console.error('Wallet connection error:', err);
//       setError(err.message || 'Failed to connect wallet');
//       localStorage.removeItem('walletConnected');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const disconnect = () => {
//     try {
//       window.phantom?.solana?.disconnect();
//       setIsConnected(false);
//       setPublicKey(null);
//       setConnection(null);
//       setNetwork('');
//       setBalance(null);
//       setError(null);
//       localStorage.removeItem('walletConnected');
//     } catch (err: any) {
//       console.error('Disconnect error:', err);
//       setError(err.message || 'Failed to disconnect wallet');
//     }
//   };
//
//   // Listen for Phantom connection events
//   useEffect(() => {
//     const handleDisconnect = () => {
//       disconnect();
//     };
//
//     const handleAccountChange = () => {
//       // Reconnect with new account
//       connect();
//     };
//
//     window.phantom?.solana?.on('disconnect', handleDisconnect);
//     window.phantom?.solana?.on('accountChanged', handleAccountChange);
//
//     return () => {
//       window.phantom?.solana?.removeListener('disconnect', handleDisconnect);
//       window.phantom?.solana?.removeListener('accountChanged', handleAccountChange);
//     };
//   }, []);
//
//   return (
//     <WalletContext.Provider
//       value={{
//         isConnected,
//         publicKey,
//         connection,
//         network,
//         balance,
//         connect,
//         disconnect,
//         error,
//         isLoading
//       }}
//     >
//       {children}
//     </WalletContext.Provider>
//   );
// }
//
// export function useWallet() {
//   const context = useContext(WalletContext);
//   if (context === undefined) {
//     throw new Error('useWallet must be used within a WalletProvider');
//   }
//   return context;
// }




import React, { createContext, useContext, useState, useEffect } from 'react';
import type {Connection, PublicKey, Transaction} from '@solana/web3.js';
import { connectToPhantom } from "../utils/solana.ts";
import {Wallet} from "@project-serum/anchor";



interface WalletContextType {
  isConnected: boolean,
  publicKey: PublicKey | null,
  connection: Connection | null,
  network: string | null,
  balance: number | null,
  connect: () => Promise<void>,
  disconnect: () => void,
  error: string | null,
  isLoading: boolean,
  wallet: Wallet | null,
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({children}:{children: React.ReactNode}) {

  const [isConnected, setIsconnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [network, setNetwork] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);


  useEffect(()=> {
    const wasConnected = localStorage.getItem('walletConnected') === 'true';
    if (wasConnected) {
      connect();
    }
  }, [])

  useEffect(() => {
    if(connection && publicKey) {
      updateBalance();
    }
  }, [connection, publicKey]);

  const updateBalance = async () => {
    if (connection && publicKey) {
      try {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / 1e9);
      }catch(err){
        console.error('Failed to fetch balance: ', err);
      }
    }
  };

  const connect = async () => {
    try{
      setError(null);
      setIsLoading(true);

      const { publicKey: pk, connection: conn, network: currentNetwork, wallet: walletObject } = await connectToPhantom();

      setConnection(conn);
      setPublicKey(pk);
      setNetwork(currentNetwork);
      setWallet(walletObject);
      setIsconnected(true);

      localStorage.setItem('walletConnected', 'true');

      const balance = await conn.getBalance(pk);
      setBalance(balance / 1e9);
    }catch (err:any) {
      console.error('wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      localStorage.removeItem('walletConnected');
    }finally{
      setIsLoading(false);
    }
  };


  const disconnect = () => {
    try {
      window.phantom?.solana?.disconnect;
      setIsconnected(false);
      setPublicKey(null);
      setConnection(null);
      setNetwork('');
      setBalance(null);
      setError(null);
      setWallet(null);
      localStorage.removeItem('walletConnected');
    }catch (err:any){
      console.error('Disconnect error:', err);
      setError(err.message || 'Failed to disconnect wallet');
    }
  };


  useEffect(() => {
    const handleDisconnect = () => {
      disconnect();
    };

    const handleAccountChange = () => {
      connect();
    };

    window.phantom?.solana?.on('disconnect', handleDisconnect);
    window.phantom?.solana?.on('accountChanged', handleAccountChange);

    return () => {
      window.phantom?.solana?.removeListener('disconnect', handleDisconnect);
      window.phantom?.solana?.removeListener('accountChanged', handleAccountChange);
    };
  }, []);

  return (
      <WalletContext.Provider
        value={{
          isConnected,
          publicKey,
          connection,
          network,
          balance,
          connect,
          disconnect,
          error,
          isLoading,
          wallet,
        }}
      >
        {children}
      </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if(context === undefined) {
    throw new Error('useWallet must be used withing a WalletProvider')
  }
  return context;
}