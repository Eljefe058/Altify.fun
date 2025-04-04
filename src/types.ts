import type { PublicKey } from '@solana/web3.js';

export type CreationMode = 'safe' | 'advanced' | 'degen';

export interface TokenFeature {
  name: string;
  enabled: boolean;
  settings?: Record<string, any>;
}

export interface Token {
  name: string;
  symbol: string;
  mode: CreationMode;
  liquidity: number;
  createdAt: string;
  address: string;
  owner: PublicKey;
  features?: TokenFeature[];
}