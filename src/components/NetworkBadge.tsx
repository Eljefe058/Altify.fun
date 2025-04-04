import React from 'react';
import { AlertCircle } from 'lucide-react';

interface NetworkBadgeProps {
  network: 'devnet' | 'mainnet';
}

export default function NetworkBadge({ network }: NetworkBadgeProps) {
  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
      network === 'devnet' 
        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' 
        : 'bg-green-500/20 text-green-300 border border-green-500/50'
    }`}>
      <span className={`w-2 h-2 rounded-full ${
        network === 'devnet' ? 'bg-yellow-400' : 'bg-green-400'
      }`} />
      {network === 'devnet' ? 'Testnet' : 'Mainnet'}
    </div>
  );
}