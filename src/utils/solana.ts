// import { Connection, PublicKey } from '@solana/web3.js';
// import { WalletAdapter } from "@solana/wallet-adapter-base";
// import { Wallet } from '@project-serum/anchor';
//
//
// // Define Phantom provider interface
// interface PhantomWindow extends Window {
//   phantom?: {
//     solana?: {
//       connect(): Promise<{ publicKey: PublicKey }>;
//       disconnect(): Promise<void>;
//       on(event: string, callback: () => void): void;
//       request(params: any): Promise<any>;
//       isPhantom?: boolean;
//     };
//   };
//   solana?: {
//     connect(): Promise<{ publicKey: PublicKey }>;
//     disconnect(): Promise<void>;
//     on(event: string, callback: () => void): void;
//     request(params: any): Promise<any>;
//     isPhantom?: boolean;
//   };
// }
//
// declare const window: PhantomWindow;
//
// const getProvider = () => {
//   if ('phantom' in window) {
//     const provider = window.phantom?.solana;
//
//     if (provider?.isPhantom) {
//       return provider;
//     }
//   }
//
//   // Fall back to window.solana if window.phantom.solana is not available
//   if ('solana' in window && window.solana?.isPhantom) {
//     return window.solana;
//   }
//
//   window.open('https://phantom.app/', '_blank');
//   throw new Error('Please install Phantom wallet from phantom.app');
// };
//
// export async function connectToPhantom() {
//   try {
//     const provider = getProvider();
//
//     // Ensure we're connected before proceeding
//     if (!provider.isConnected) {
//       const response = await provider.connect();
//       if (!response.publicKey) {
//         throw new Error('Failed to connect to wallet');
//       }
//     }
//
//     const publicKey = provider.publicKey;
//     if (!publicKey) {
//       throw new Error('No public key found');
//     }
//
//     // Get the current network from Phantom
//     let network;
//     try {
//       network = await provider.request({ method: 'getNetwork' });
//     } catch (err) {
//       console.warn('Failed to get network from wallet, defaulting to testnet', err);
//       network = 'testnet';
//     }
//
//     // Create connection based on network
//     const connection = new Connection(
//       network === 'mainnet-beta'
//         ? 'https://api.mainnet-beta.solana.com'
//         : 'https://api.devnet.solana.com',
//       'confirmed'
//     );
//
//     // Verify connection is working
//     try {
//       await connection.getVersion();
//     } catch (err) {
//       throw new Error('Failed to connect to Solana network. Please check your internet connection.');
//     }
//
//     return {
//       publicKey,
//       connection,
//       network: network === 'mainnet-beta' ? 'mainnet' : 'testnet'
//     };
//   } catch (err: any) {
//     if (err.code === 4001) {
//       throw new Error('Please accept the connection request in Phantom');
//     }
//
//     throw new Error(err.message || 'Failed to connect to Phantom wallet');
//   }
// }


import {Connection, clusterApiUrl, PublicKey, Transaction} from "@solana/web3.js";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Wallet } from '@project-serum/anchor';

interface PhantomProvider {
  connect(): Promise<{publicKey: PublicKey}>;
  disconnect(): Promise<void>;
  on(event: string, callback: () => void): void;
  request(params: any): Promise<any>;
  isPhantom?: boolean;
  publicKey?: PublicKey;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;

}


interface Wallet {
  publicKey: PublicKey,
  connect: () => Promise<{ publicKey: PublicKey}>;
  disconnect: () => Promise<void>
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  on: (event: string, handler: (args:any) => void ) => void;
  off: (event: string, handler: (args: any) => void ) => void;
}

interface PhantomWindow extends Window {
  phantom?: {
    solana?: PhantomProvider;
  };
}


declare const window: PhantomWindow;

export async function connectToPhantom() {
  if(!window.phantom?.solana?.isPhantom) {
    throw new Error('Phantom wallet not found');
  }

  await window.phantom.solana.connect()

  const publicKey = new PublicKey(window.phantom.solana.publicKey?.toString());
  const network = WalletAdapterNetwork.Devnet;
  const connection = new Connection(clusterApiUrl(network));

  const wallet: Wallet = {
    publicKey,
    connect: async () => ({publicKey}),
    disconnect: async () => await window.phantom.solana.disconnect(),
    signTransaction: async (transaction) => {
      return await window.phantom.solana.signTransaction(transaction);
    },
    signAllTransactions: async (transactions) => {
      return await window.phantom.solana.signAllTransaction(transactions);
    },
    on: (event: string, handler: (args: any) => void) => {
      window.phantom.solana.on(event, handler)
    },
    off: (event: string, handler: (args: any) => void) => {
    window.phantom.solana.off(event, handler);
  },

  };
  return{ publicKey, connection, network, wallet };
}