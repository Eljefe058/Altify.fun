import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Clock, Droplets, ArrowUpDown, Shield, ExternalLink, Wallet } from 'lucide-react';
import { useTokens } from '../contexts/TokenContext';
import { useWallet } from '../contexts/WalletContext';
import type { Token } from '../types';

type SortOption = 'liquidity' | 'newest' | 'trending' | 'volume';

export default function SafeCoins() {
  const navigate = useNavigate();
  const { tokens } = useTokens();
  const { isConnected, connect } = useWallet();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('liquidity');

  // Filter only safe tokens
  const safeTokens = tokens.filter(token => token.mode === 'safe');

  // Apply search filter
  const filteredTokens = safeTokens.filter(token => 
    token.name.toLowerCase().includes(search.toLowerCase()) ||
    token.symbol.toLowerCase().includes(search.toLowerCase()) ||
    token.address.toLowerCase().includes(search.toLowerCase())
  );

  // Sort tokens based on selected option
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    switch (sortBy) {
      case 'liquidity':
        return Number(b.liquidity) - Number(a.liquidity);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'trending':
        // Simulated trending score based on liquidity and time
        const getScore = (token: Token) => {
          const age = new Date().getTime() - new Date(token.createdAt).getTime();
          return (Number(token.liquidity) * 1000) / age;
        };
        return getScore(b) - getScore(a);
      case 'volume':
        // Simulated 24h volume (in production, this would come from actual trading data)
        const getVolume = (token: Token) => Number(token.liquidity) * (Math.random() * 5 + 1);
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  };

  const getMarketStatus = (token: Token) => {
    const age = new Date().getTime() - new Date(token.createdAt).getTime();
    const hoursSinceLaunch = age / (1000 * 60 * 60);

    if (hoursSinceLaunch < 24) {
      return {
        label: 'Newly Launched',
        className: 'bg-blue-500/20 text-blue-300 border-blue-500/50'
      };
    } else if (Number(token.liquidity) > 2) {
      return {
        label: 'High Liquidity',
        className: 'bg-green-500/20 text-green-300 border-green-500/50'
      };
    } else {
      return {
        label: 'Live',
        className: 'bg-purple-500/20 text-purple-300 border-purple-500/50'
      };
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Safe Coins</h1>
          <p className="text-gray-400">
            Discover rugpull-proof tokens with verified security features
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-green-400" />
          <span className="text-green-400 font-medium">Verified Safe</span>
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
              onClick={() => setSortBy('liquidity')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                sortBy === 'liquidity'
                  ? 'bg-[#7a5cff] text-white'
                  : 'bg-[#1e1e1e] text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Droplets className="w-4 h-4" />
              Most Liquid
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                sortBy === 'newest'
                  ? 'bg-[#7a5cff] text-white'
                  : 'bg-[#1e1e1e] text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              Newest
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
          <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Safe Tokens Found</h3>
          <p className="text-gray-400">
            {search
              ? 'No tokens match your search criteria'
              : 'There are no safe tokens available yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedTokens.map(token => {
            const status = getMarketStatus(token);
            const volume = Number(token.liquidity) * (Math.random() * 5 + 1); // Simulated 24h volume
            const marketCap = volume * 100; // Simulated market cap

            return (
              <div
                key={token.address}
                onClick={() => navigate(`/token/${token.address}`)}
                className="bg-[#2a2a2a] rounded-lg p-4 hover:bg-[#2f2f2f] transition-all duration-200 cursor-pointer hover:scale-[1.02] group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white group-hover:text-[#7a5cff] transition-colors">
                      {token.name}
                    </h2>
                    <div className="text-sm text-gray-400">{token.symbol}</div>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium border rounded-full ${status.className}`}>
                    {status.label}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">Liquidity</div>
                    <div className="text-white font-medium">
                      {Number(token.liquidity).toFixed(2)} SOL
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">Market Cap</div>
                    <div className="text-white font-medium">
                      ${formatNumber(marketCap)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">24h Volume</div>
                    <div className="text-white font-medium">
                      {formatNumber(volume)} SOL
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">Created</div>
                    <div className="text-white font-medium">
                      {formatDate(token.createdAt)}
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
                      Connect to Buy
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/token/${token.address}`);
                      }}
                      className="flex-1 bg-[#7a5cff] hover:bg-[#6a4cef] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Buy {token.symbol}
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