import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { PlusCircle, ExternalLink, BarChart3, Trash2, Shield, Zap, Skull } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useTokens } from '../contexts/TokenContext';
import type { Token } from '../types';

const modeIcons = {
  safe: Shield,
  advanced: Zap,
  degen: Skull,
};

const modeColors = {
  safe: 'text-green-400',
  advanced: 'text-blue-400',
  degen: 'text-red-400',
};

export default function MyTokens() {
  const navigate = useNavigate();
  const { isConnected, publicKey } = useWallet();
  const { tokens, removeToken } = useTokens();
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // Redirect if not connected
  if (!isConnected) {
    return <Navigate to="/create" replace />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Loading tokens...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-400 mb-4">{error}</div>
        <Link
          to="/create"
          className="bg-[#7a5cff] hover:bg-[#6a4cef] text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Token
        </Link>
      </div>
    );
  }

  // Filter tokens to only show those owned by the current user
  const userTokens = tokens.filter(token => token.owner.toString() === publicKey?.toString());

  if (userTokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 mb-6">No tokens found. Create your first token to get started!</div>
        <Link
          to="/create"
          className="bg-[#7a5cff] hover:bg-[#6a4cef] text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Token
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">My Tokens</h1>
        <Link
          to="/create"
          className="bg-[#7a5cff] hover:bg-[#6a4cef] text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Token
        </Link>
      </div>

      <div className="grid gap-4">
        {userTokens.map(token => {
          const Icon = modeIcons[token.mode];
          return (
            <div
              key={token.address}
              className="bg-[#2a2a2a] rounded-lg p-6 hover:bg-[#2f2f2f] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-white">{token.name}</h2>
                    <span className="text-gray-400">({token.symbol})</span>
                    <Icon className={`w-5 h-5 ${modeColors[token.mode]}`} />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Mode</div>
                      <div className="text-white capitalize">{token.mode}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Liquidity</div>
                      <div className="text-white">{token.liquidity} SOL</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Created</div>
                      <div className="text-white">{formatDate(token.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Address</div>
                      <div className="text-white font-mono text-sm">
                        {token.address.slice(0, 4)}...{token.address.slice(-4)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                      onClick={() => window.open(`https://solscan.io/token/${token.address}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Solscan
                    </button>
                    <button
                      className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                      onClick={() => navigate(`/dashboard/${token.address}`)}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Dashboard
                    </button>
                    <button
                      className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                      onClick={() => removeToken(token.address)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}