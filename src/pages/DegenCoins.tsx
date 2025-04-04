import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Clock, Droplets, ArrowUpDown, Skull, ExternalLink, AlertTriangle, Wallet } from 'lucide-react';
import { useTokens } from '../contexts/TokenContext';
import { useWallet } from '../contexts/WalletContext';
import { formatUSD, formatSOL } from '../utils/price';
import type { Token } from '../types';

type SortOption = 'progress' | 'contributors' | 'trending' | 'volume';

interface BondingCurveProgress {
  currentAmount: number;
  targetAmount: number;
  currentUSD: number;
  targetUSD: number;
  contributors: number;
}

// Mock bonding curve data - in production this would come from blockchain
const getBondingCurveData = (token: Token): BondingCurveProgress => {
  const targetUSD = 20000; // Fixed USD target
  const solPrice = 100; // Mock SOL price for demo
  const targetAmount = targetUSD / solPrice; // Calculate target SOL based on price
  const progress = Math.random(); // Random progress for demo
  const currentAmount = targetAmount * progress;
  return {
    currentAmount,
    targetAmount,
    currentUSD: currentAmount * solPrice,
    targetUSD,
    contributors: Math.floor(Math.random() * 200) + 50
  };
};

export default function DegenCoins() {
  const navigate = useNavigate();
  const { tokens } = useTokens();
  const { isConnected, connect } = useWallet();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('progress');

  // Filter only degen tokens
  const degenTokens = tokens.filter(token => token.mode === 'degen');

  // Apply search filter
  const filteredTokens = degenTokens.filter(token => 
    token.name.toLowerCase().includes(search.toLowerCase()) ||
    token.symbol.toLowerCase().includes(search.toLowerCase()) ||
    token.address.toLowerCase().includes(search.toLowerCase())
  );

  // Sort tokens based on selected option
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    const bondingA = getBondingCurveData(a);
    const bondingB = getBondingCurveData(b);

    switch (sortBy) {
      case 'progress':
        return (bondingB.currentAmount / bondingB.targetAmount) - 
               (bondingA.currentAmount / bondingA.targetAmount);
      case 'contributors':
        return bondingB.contributors - bondingA.contributors;
      case 'trending':
        // Simulated trending score based on recent contribution velocity
        const getScore = (token: Token) => {
          const age = new Date().getTime() - new Date(token.createdAt).getTime();
          const bonding = getBondingCurveData(token);
          return (bonding.currentAmount * 1000) / age;
        };
        return getScore(b) - getScore(a);
      case 'volume':
        // For launched tokens, use trading volume. For pre-launch, use contribution volume
        const getVolume = (token: Token) => {
          const bonding = getBondingCurveData(token);
          return bonding.currentAmount * (Math.random() * 5 + 1);
        };
        return getVolume(b) - getVolume(a);
      default:
        return 0;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 0.9) return 'bg-green-500/20 text-green-300 border-green-500/50';
    if (progress >= 0.5) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Degen Coins</h1>
          <p className="text-gray-400">
            High-risk, high-reward tokens with experimental features
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Skull className="w-6 h-6 text-red-400" />
          <span className="text-red-400 font-medium">High Risk</span>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-semibold mb-1">High-Risk Investment Warning</h3>
            <p className="text-gray-300">
              Degen tokens are extremely high-risk investments. You could lose all of your invested capital. 
              Always conduct thorough research before contributing to bonding curves or trading tokens.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#2a2a2a] rounded-lg p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, symbol, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSortBy('progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                sortBy === 'progress'
                  ? 'bg-[#7a5cff] text-white'
                  : 'bg-[#1e1e1e] text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Droplets className="w-4 h-4" />
              Near Launch
            </button>
            <button
              onClick={() => setSortBy('contributors')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                sortBy === 'contributors'
                  ? 'bg-[#7a5cff] text-white'
                  : 'bg-[#1e1e1e] text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              Most Contributors
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                sortBy === 'trending'
                  ? 'bg-[#7a5cff] text-white'
                  : 'bg-[#1e1e1e] text-gray-400 hover:bg-gray-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
            <button
              onClick={() => setSortBy('volume')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                sortBy === 'volume'
                  ? 'bg-[#7a5cff] text-white'
                  : 'bg-[#1e1e1e] text-gray-400 hover:bg-gray-700'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              Volume
            </button>
          </div>
        </div>
      </div>

      {/* Token Grid */}
      {sortedTokens.length === 0 ? (
        <div className="bg-[#2a2a2a] rounded-lg p-8 text-center">
          <Skull className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Degen Tokens Found</h3>
          <p className="text-gray-400">
            {search
              ? 'No tokens match your search criteria'
              : 'There are no degen tokens available yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedTokens.map(token => {
            const bonding = getBondingCurveData(token);
            const progress = (bonding.currentUSD / bonding.targetUSD) * 100;
            const progressColor = getProgressColor(progress / 100);

            return (
              <div
                key={token.address}
                onClick={() => navigate(`/degen-token/${token.address}`)}
                className="bg-[#2a2a2a] rounded-lg p-4 hover:bg-[#2f2f2f] transition-all duration-200 cursor-pointer hover:scale-[1.02] group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white group-hover:text-[#7a5cff] transition-colors">
                      {token.name}
                    </h2>
                    <div className="text-sm text-gray-400">{token.symbol}</div>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium border rounded-full ${progressColor}`}>
                    {progress.toFixed(1)}% Funded
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-2 bg-[#1e1e1e] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7a5cff] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-white">
                      {formatUSD(bonding.currentUSD)} ({formatSOL(bonding.currentAmount)} SOL)
                    </span>
                    <span className="text-gray-400">
                      {formatUSD(bonding.targetUSD)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">Contributors</div>
                    <div className="text-white font-medium">{bonding.contributors}</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">Created</div>
                    <div className="text-white font-medium">{formatDate(token.createdAt)}</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">Status</div>
                    <div className="text-white font-medium">
                      {progress >= 100 ? 'Trading Live' : 'Pre-Launch'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {!isConnected ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        connect();
                      }}
                      className="flex-1 bg-[#7a5cff] hover:bg-[#6a4cef] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      Connect to Contribute
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/degen-token/${token.address}`);
                      }}
                      className="flex-1 bg-[#7a5cff] hover:bg-[#6a4cef] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {progress >= 100 ? `Buy ${token.symbol}` : 'Contribute'}
                    </button>
                  )}
                  <a
                    href={`https://solscan.io/token/${token.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-[#1e1e1e] hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}