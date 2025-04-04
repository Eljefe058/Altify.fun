import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Shield, TrendingUp, Clock, Globe, Twitter, MessageCircle, Send } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useTokens } from '../contexts/TokenContext';
import NetworkBadge from '../components/NetworkBadge';
import ChartContainer from '../components/charts/ChartContainer';
import TokenTrade from '../components/TokenTrade';
import type { Token } from '../types';

interface TradeStats {
  price: number;
  priceChange: number;
  volume24h: number;
  marketCap: number;
  holders: number;
}

interface TokenSupply {
  total: number;
  circulating: number;
  burned: number;
  locked: number;
}

interface Transaction {
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: string;
  address: string;
}

export default function TokenPage() {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const { isConnected, network } = useWallet();
  const { tokens } = useTokens();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [supply, setSupply] = useState<TokenSupply | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Find the token from our global state
  const token = tokens.find(t => t.address === tokenAddress);

  useEffect(() => {
    const loadTokenData = async () => {
      try {
        if (!token) {
          throw new Error('Token not found');
        }

        // Simulate loading market data
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data for demonstration
        setStats({
          price: 0.00123,
          priceChange: 15.5,
          volume24h: Number(token.liquidity) * 3,
          marketCap: Number(token.liquidity) * 1000,
          holders: 156
        });

        setSupply({
          total: 1000000000,
          circulating: 750000000,
          burned: 50000000,
          locked: 200000000
        });

        // Generate mock transactions
        const mockTransactions: Transaction[] = Array.from({ length: 10 }, (_, i) => ({
          type: Math.random() > 0.5 ? 'buy' : 'sell',
          amount: Math.random() * 10000,
          price: 0.00123 * (1 + (Math.random() - 0.5) * 0.1),
          timestamp: new Date(Date.now() - i * 1000 * 60 * 5).toISOString(),
          address: Array.from({ length: 44 }, () => 
            '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[
              Math.floor(Math.random() * 58)
            ]
          ).join('')
        }));

        setTransactions(mockTransactions);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load token data');
        setIsLoading(false);
      }
    };

    loadTokenData();
  }, [token]);

  if (!isConnected) {
    return <Navigate to="/safe-coins" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Loading token data...</div>
      </div>
    );
  }

  if (error || !token || !stats || !supply) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-400 mb-4">{error || 'Token not found'}</div>
        <Link
          to="/safe-coins"
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Safe Coins
        </Link>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/safe-coins"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{token.name}</h1>
              <span className="text-gray-400">({token.symbol})</span>
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-sm text-gray-400 mt-1 font-mono">
              {token.address}
            </div>
          </div>
        </div>
        <NetworkBadge network={network === 'testnet' ? 'devnet' : 'mainnet'} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#2a2a2a] rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Price</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-semibold text-white">
              ${stats.price.toFixed(8)}
            </div>
            <div className={`text-sm ${stats.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.priceChange >= 0 ? '+' : ''}{stats.priceChange}%
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">24h Volume</div>
          <div className="text-xl font-semibold text-white">
            {stats.volume24h.toFixed(2)} SOL
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Market Cap</div>
          <div className="text-xl font-semibold text-white">
            ${formatNumber(stats.marketCap)}
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Holders</div>
          <div className="text-xl font-semibold text-white">
            {formatNumber(stats.holders)}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Chart */}
          <ChartContainer type="trading" symbol={token.symbol} />

          {/* Token Info */}
          <div className="bg-[#2a2a2a] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Token Information</h2>
            
            <div className="space-y-6">
              {/* Supply Distribution */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Supply Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Total Supply</div>
                    <div className="text-white">{formatNumber(supply.total)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Circulating</div>
                    <div className="text-white">{formatNumber(supply.circulating)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Burned</div>
                    <div className="text-white">{formatNumber(supply.burned)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Locked</div>
                    <div className="text-white">{formatNumber(supply.locked)}</div>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Security Features</h3>
                <div className="grid gap-3">
                  {[
                    'Ownership renounced - token contract cannot be modified',
                    'Liquidity locked for 12 months',
                    'Maximum transaction limit: 1% of total supply',
                    'Anti-bot protection enabled',
                    'Verified source code on Solscan'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-gray-300">
                      <Shield className="w-5 h-5 text-green-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Links</h3>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] rounded-lg text-gray-300 hover:text-white transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] rounded-lg text-gray-300 hover:text-white transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] rounded-lg text-gray-300 hover:text-white transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Discord
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] rounded-lg text-gray-300 hover:text-white transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Buy/Sell Module */}
          <TokenTrade
            tokenSymbol={token.symbol}
            tokenAddress={token.address}
            currentPrice={stats.price}
          />

          {/* Recent Transactions */}
          <div className="bg-[#2a2a2a] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {transactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
                >
                  <div>
                    <div className={`text-sm font-medium ${
                      tx.type === 'buy' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.type === 'buy' ? 'Buy' : 'Sell'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(tx.timestamp)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">
                      {tx.amount.toFixed(2)} {token.symbol}
                    </div>
                    <div className="text-xs text-gray-400">
                      @ ${tx.price.toFixed(8)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}