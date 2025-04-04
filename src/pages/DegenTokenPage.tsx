import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Shield, Zap, Skull, AlertTriangle, Loader2, ChevronRight, Info } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useTokens } from '../contexts/TokenContext';
import NetworkBadge from '../components/NetworkBadge';
import ChartContainer from '../components/charts/ChartContainer';
import TokenTrade from '../components/TokenTrade';
import { formatUSD, formatSOL } from '../utils/price';
import type { Token } from '../types';

interface BondingCurveProgress {
  currentAmount: number;
  targetAmount: number;
  currentUSD: number;
  targetUSD: number;
  contributors: number;
  isLaunched: boolean;
}

interface TradeStats {
  price: number;
  priceChange: number;
  volume24h: number;
  marketCap: number;
  holders: number;
}

interface Transaction {
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: string;
  address: string;
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
    contributors: Math.floor(Math.random() * 200) + 50,
    isLaunched: (currentAmount * solPrice) >= targetUSD
  };
};

// Generate mock transactions
const generateMockTransactions = (count: number): Transaction[] => {
  return Array.from({ length: count }, (_, i) => ({
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
};

export default function DegenTokenPage() {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const { isConnected, connect, network, balance } = useWallet();
  const { tokens } = useTokens();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bondingCurve, setBondingCurve] = useState<BondingCurveProgress | null>(null);
  const [tradeStats, setTradeStats] = useState<TradeStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isContributing, setIsContributing] = useState(false);
  const [contributionAmount, setContributionAmount] = useState<string>('0.1');
  const [showLaunchNotification, setShowLaunchNotification] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleContributionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string for better UX
    if (value === '') {
      setContributionAmount('');
      return;
    }
    // Validate number
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setContributionAmount(num.toString());
    }
  };

  // Find the token from our global state
  const token = tokens.find(t => t.address === tokenAddress);

  // Load token data once
  useEffect(() => {
    const loadTokenData = async () => {
      try {
        if (!token) {
          throw new Error('Token not found');
        }

        // Get bonding curve data
        const bondingData = getBondingCurveData(token);
        setBondingCurve(bondingData);

        // If token is launched, get trading stats and transactions
        if (bondingData.isLaunched) {
          setTradeStats({
            price: 0.00123,
            priceChange: 15.5,
            volume24h: bondingData.currentAmount * 0.1,
            marketCap: bondingData.currentAmount * 1000,
            holders: 156
          });

          // Generate mock transactions
          setTransactions(generateMockTransactions(10));
        }

        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load token data');
        setIsLoading(false);
      }
    };

    loadTokenData();
  }, [token]);

  const handleContribute = async () => {
    if (!bondingCurve || parseFloat(contributionAmount) <= 0) return;

    setIsContributing(true);
    try {
      // Simulate contribution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update bonding curve state
      setBondingCurve(prev => {
        if (!prev) return prev;
        const newAmount = prev.currentAmount + (parseFloat(contributionAmount) * 1000);
        const isLaunched = newAmount >= prev.targetAmount;
        
        // Show launch notification if threshold is reached
        if (isLaunched && !prev.isLaunched) {
          setShowLaunchNotification(true);
          setIsTransitioning(true);
          
          // Set initial trading stats and transactions
          setTradeStats({
            price: 0.00123,
            priceChange: 15.5,
            volume24h: newAmount * 0.1,
            marketCap: newAmount * 1000,
            holders: 156
          });
          setTransactions(generateMockTransactions(10));

          setTimeout(() => {
            setShowLaunchNotification(false);
            setIsTransitioning(false);
          }, 1000);
        }

        return {
          ...prev,
          currentAmount: newAmount,
          contributors: prev.contributors + 1,
          isLaunched
        };
      });
    } catch (err: any) {
      setError(err.message || 'Failed to contribute');
    } finally {
      setIsContributing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isConnected) {
    return <Navigate to="/degen-coins" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#7a5cff] animate-spin" />
      </div>
    );
  }

  if (error || !token || !bondingCurve) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-400 mb-4">{error || 'Token not found'}</div>
        <Link
          to="/degen-coins"
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Degen Coins
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Launch Notification */}
      {showLaunchNotification && (
        <div className="fixed top-4 right-4 bg-green-500/90 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="font-medium">Token has launched! Trading is now live.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/degen-coins"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{token.name}</h1>
              <span className="text-gray-400">({token.symbol})</span>
              <Skull className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-sm text-gray-400 mt-1 font-mono">
              {token.address}
            </div>
          </div>
        </div>
        <NetworkBadge network={network === 'testnet' ? 'devnet' : 'mainnet'} />
      </div>

      {/* Quick Stats */}
      {bondingCurve.isLaunched && tradeStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in">
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Price</div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-semibold text-white">
                ${tradeStats.price.toFixed(8)}
              </div>
              <div className={`text-sm ${tradeStats.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {tradeStats.priceChange >= 0 ? '+' : ''}{tradeStats.priceChange}%
              </div>
            </div>
          </div>

          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">24h Volume</div>
            <div className="text-xl font-semibold text-white">
              {tradeStats.volume24h.toFixed(2)} SOL
            </div>
          </div>

          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Market Cap</div>
            <div className="text-xl font-semibold text-white">
              ${tradeStats.marketCap.toFixed(2)}
            </div>
          </div>

          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Holders</div>
            <div className="text-xl font-semibold text-white">
              {tradeStats.holders}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <div key={bondingCurve?.isLaunched ? 'trading' : 'bonding'}>
            {bondingCurve.isLaunched ? (
              <ChartContainer type="trading" symbol={token.symbol} />
            ) : (
              <ChartContainer 
                type="bonding"
                currentAmount={bondingCurve.currentAmount}
                targetAmount={bondingCurve.targetAmount}
                symbol={token.symbol}
              />
            )}
          </div>

          {/* Token Info */}
          <div className="bg-[#2a2a2a] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Token Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-red-400">
                <Skull className="w-5 h-5" />
                <span>Dynamic bonding curve with automatic liquidity generation</span>
              </div>
              <div className="flex items-start gap-3 text-red-400">
                <Skull className="w-5 h-5" />
                <span>No transfer limits or trading restrictions</span>
              </div>
              <div className="flex items-start gap-3 text-red-400">
                <Skull className="w-5 h-5" />
                <span>Community-driven launch through bonding curve</span>
              </div>
              <div className="flex items-start gap-3 text-red-400">
                <Skull className="w-5 h-5" />
                <span>Experimental features and high-risk mechanics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {bondingCurve.isLaunched && tradeStats ? (
              // Trading Interface for Launched Tokens
              <TokenTrade
                tokenSymbol={token.symbol}
                tokenAddress={token.address}
                currentPrice={tradeStats.price}
              />
            ) : (
              // Contribution Interface for Pre-Launch Tokens
              <div className="bg-[#2a2a2a] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Contribute SOL
                </h2>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Launch Progress</span>
                    <span>{((bondingCurve.currentUSD / bondingCurve.targetUSD) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-4 bg-[#1e1e1e] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7a5cff] transition-all duration-500"
                      style={{ width: `${(bondingCurve.currentUSD / bondingCurve.targetUSD) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-white">{formatSOL(bondingCurve.currentAmount)} SOL (${formatUSD(bondingCurve.currentUSD)})</span>
                    <span className="text-gray-400">{formatSOL(bondingCurve.targetAmount)} SOL (${formatUSD(bondingCurve.targetUSD)})</span>
                  </div>
                </div>

                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-red-400 font-semibold mb-1">High-Risk Warning</h3>
                      <p className="text-sm text-gray-300">
                        Contributing to this bonding curve is highly speculative. 
                        Once the threshold is met, the token will be listed for trading.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label htmlFor="amount" className="block text-sm text-gray-400 mb-2">
                        Contribution Amount (SOL)
                      </label>
                      <input
                        type="number"
                        id="amount"
                        min="0.1"
                        step="0.1"
                        value={contributionAmount}
                        onChange={handleContributionChange}
                        className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white"
                      />
                    </div>
                    <button
                      onClick={handleContribute}
                      disabled={isContributing || parseFloat(contributionAmount) <= 0}
                      className="px-6 bg-[#7a5cff] hover:bg-[#6a4cef] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isContributing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Contributing...
                        </>
                      ) : (
                        'Contribute'
                      )}
                    </button>
                  </div>

                  {balance !== null && (
                    <div className="mt-4 text-sm text-gray-400">
                      Your Balance: {balance.toFixed(2)} SOL
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          {bondingCurve.isLaunched && transactions.length > 0 && (
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
          )}

          {/* Contributors */}
          <div className="bg-[#2a2a2a] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {bondingCurve.isLaunched ? 'Token Stats' : 'Contributors'}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Contributors</span>
                <span className="text-white">{bondingCurve.contributors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status</span>
                <span className="text-white">{bondingCurve.isLaunched ? 'Trading Live' : 'Pre-Launch'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Created</span>
                <span className="text-white">
                  {new Date(token.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}