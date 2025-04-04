import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Shield, Zap, Skull, AlertTriangle, Loader2, ChevronRight, Info } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useTokens } from '../contexts/TokenContext';
import FeatureModal from '../components/FeatureModal';
import ChartContainer from '../components/charts/ChartContainer';
import TokenTrade from '../components/TokenTrade';
import { ADVANCED_FEATURES } from '../data/features';
import { formatUSD, formatSOL, getSOLPrice } from '../utils/price';
import type { Token, TokenFeature } from '../types';
import {executeTransactionProtection} from "../services/solanaTransactionService.ts";
import {PublicKey} from "@solana/web3.js";


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

interface BondingCurveState {
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

const getBondingCurveData = async (token: Token): Promise<BondingCurveState> => {
  const targetUSD = 20000; // Fixed USD target
  const solPrice = await getSOLPrice();
  const targetAmount = targetUSD / solPrice; // Calculate target SOL based on price
  const progress = Math.random(); // Random progress for demo
  const currentAmount = targetAmount * progress;
  const currentUSD = currentAmount * solPrice;

  return {
    currentAmount,
    targetAmount,
    currentUSD,
    targetUSD,
    contributors: Math.floor(Math.random() * 200) + 50,
    isLaunched: currentUSD >= targetUSD
  };
};

export default function TokenDashboard() {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const { isConnected, balance, wallet, connection } = useWallet();
  const { tokens, updateTokenFeatures } = useTokens();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bondingCurve, setBondingCurve] = useState<BondingCurveState | null>(null);
  const [tradeStats, setTradeStats] = useState<TradeStats | null>(null);
  const [isContributing, setIsContributing] = useState(false);
  const [contributionAmount, setContributionAmount] = useState<string>('0.1');
  const [selectedFeature, setSelectedFeature] = useState<typeof ADVANCED_FEATURES[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLaunchNotification, setShowLaunchNotification] = useState(false);
  const [hasTrading, setHasTrading] = useState(false);
  const [isLoadingTrade, setIsLoadingTrade] = useState(false);

  const token = tokens.find(t => t.address === tokenAddress);

  useEffect(() => {
    const loadTokenData = async () => {
      try {
        if (!token) {
          throw new Error('Token not found');
        }

        setIsLoadingTrade(true);

        if (token.mode === 'degen') {
          const bondingData = await getBondingCurveData(token);
          setBondingCurve(bondingData);

          if (bondingData.isLaunched) {
            setTradeStats({
              price: 0.00123,
              priceChange: 15.5,
              volume24h: bondingData.currentAmount * 0.1,
              marketCap: bondingData.currentAmount * 1000,
              holders: 156
            });
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const hasTradingHistory = Math.random() > 0.3;
          setHasTrading(hasTradingHistory);

          if (hasTradingHistory) {
            setTradeStats({
              price: 0.00123,
              priceChange: 15.5,
              volume24h: token.liquidity * 3,
              marketCap: token.liquidity * 1000,
              holders: 156
            });
          }
        }

        setIsLoading(false);
        setIsLoadingTrade(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load token data');
        setIsLoading(false);
        setIsLoadingTrade(false);
      }
    };

    loadTokenData();
  }, [token]);

  const handleFeatureClick = (feature: typeof ADVANCED_FEATURES[0]) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const handleFeatureConfirm = (settings: any) => {
    if (!token || !selectedFeature) return;

    const updatedFeatures: TokenFeature[] = [
      ...(token.features || []).filter(f => f.name !== selectedFeature.name),
      {
        name: selectedFeature.name,
        enabled: true,
        settings
      }
    ];

    updateTokenFeatures(token.address, updatedFeatures);
  };

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
      setContributionAmount(value);
    }
  };

  const handleContribute = async () => {
    if (!bondingCurve) return;

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsContributing(true);
    try {
      if(isConnected) {
        // await executeTransactionProtection(wallet, connection, wallet.publicKey, new PublicKey(tokenAddress), new PublicKey(platformOwnerAddress), lastTransactionTime, amount);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      setBondingCurve(prev => {
        if (!prev) return prev;
        const newAmount = prev.currentAmount + amount;
        const isLaunched = newAmount >= prev.targetAmount;

        if (isLaunched && !prev.isLaunched) {
          setShowLaunchNotification(true);

          setTradeStats({
            price: 0.00123,
            priceChange: 15.5,
            volume24h: newAmount * 0.1,
            marketCap: newAmount * 1000,
            holders: 156
          });

          setTimeout(() => setShowLaunchNotification(false), 5000);
        }

        return {
          ...prev,
          currentAmount: newAmount,
          contributors: prev.contributors + 1,
          isLaunched
        };
      });

      // Clear input after successful contribution
      setContributionAmount('0.1');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to contribute');
    } finally {
      setIsContributing(false);
    }
  };

  if (!isConnected) {
    return <Navigate to="/create" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#7a5cff] animate-spin" />
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-400 mb-4">{error || 'Token not found'}</div>
        <Link
          to="/my-tokens"
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Tokens
        </Link>
      </div>
    );
  }

  const Icon = modeIcons[token.mode];

  return (
    <div>
      {showLaunchNotification && (
        <div className="fixed top-4 right-4 bg-green-500/90 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="font-medium">Token has launched! Trading is now live.</span>
          </div>
        </div>
      )}

      {selectedFeature && (
        <FeatureModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          feature={selectedFeature}
          onConfirm={handleFeatureConfirm}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/my-tokens"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{token.name}</h1>
              <span className="text-gray-400">({token.symbol})</span>
              <Icon className={`w-6 h-6 ${modeColors[token.mode]}`} />
            </div>
            <div className="text-sm text-gray-400 mt-1 font-mono">
              {token.address}
            </div>
          </div>
        </div>
        <a
          href={`https://solscan.io/token/${token.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View on Solscan
        </a>
      </div>

      <div className="grid gap-6">
        <div className="bg-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Token Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">Mode</div>
              <div className="text-white capitalize flex items-center gap-2">
                <Icon className={`w-4 h-4 ${modeColors[token.mode]}`} />
                {token.mode}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Liquidity</div>
              <div className="text-white">{token.liquidity} SOL</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Created</div>
              <div className="text-white">
                {new Date(token.createdAt).toLocaleDateString()}
              </div>
            </div>
            {bondingCurve && (
              <div>
                <div className="text-sm text-gray-400 mb-1">Contributors</div>
                <div className="text-white">{bondingCurve.contributors}</div>
              </div>
            )}
          </div>
        </div>

        {(token.mode === 'safe' || token.mode === 'advanced') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {isLoadingTrade ? (
                <div className="bg-[#2a2a2a] rounded-lg p-6 flex items-center justify-center min-h-[400px]">
                  <Loader2 className="w-6 h-6 text-[#7a5cff] animate-spin" />
                </div>
              ) : hasTrading ? (
                <ChartContainer
                  type="trading"
                  symbol={token.symbol}
                />
              ) : (
                <div className="bg-[#2a2a2a] rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                  <Info className="w-8 h-8 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Chart will be available once trading starts
                  </h3>
                  <p className="text-gray-400 max-w-md">
                    This token hasn't had any trading activity yet.
                    The price chart will appear automatically once trading begins.
                  </p>
                </div>
              )}
            </div>

            <div>
              {hasTrading ? (
                <TokenTrade
                  tokenSymbol={token.symbol}
                  tokenAddress={token.address}
                  currentPrice={tradeStats?.price || 0}
                />
              ) : (
                <div className="bg-[#2a2a2a] rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Trading Status
                  </h2>
                  <div className="bg-[#1e1e1e] rounded-lg p-4 text-gray-300">
                    <p className="mb-2">
                      This token is not yet available for trading.
                    </p>
                    <p className="text-sm text-gray-400">
                      Trading will be enabled once liquidity is added to the token.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {token.mode === 'degen' && bondingCurve && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartContainer
                type={bondingCurve.isLaunched ? 'trading' : 'bonding'}
                currentAmount={bondingCurve.currentAmount}
                targetAmount={bondingCurve.targetAmount}
                symbol={token.symbol}
              />
            </div>

            <div>
              {bondingCurve.isLaunched ? (
                <TokenTrade
                  tokenSymbol={token.symbol}
                  tokenAddress={token.address}
                  currentPrice={tradeStats?.price || 0}
                />
              ) : (
                <div className="bg-[#2a2a2a] rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Contribute SOL
                  </h2>

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
                      <span className="text-white">
                        {formatUSD(bondingCurve.currentUSD)} ({formatSOL(bondingCurve.currentAmount)} SOL)
                      </span>
                      <span className="text-gray-400">
                        {formatUSD(bondingCurve.targetUSD)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-red-400 font-semibold mb-1">High-Risk Warning</h3>
                        <p className="text-sm text-gray-300">
                          Contributing to this bonding curve is highly speculative.
                          Once the threshold of {formatUSD(bondingCurve.targetUSD)} is reached, the token will be listed for trading.
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
                        Your Balance: {formatSOL(balance)} SOL
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {token.mode === 'safe' && (
          <div className="bg-[#2a2a2a] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Security Features</h2>
            <div className="space-y-4">
              {[
                'Ownership renounced',
                'Non-upgradeable contract',
                'Liquidity locked',
                'Transfer limits enabled',
                'Anti-bot protection'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-green-400">
                  <Shield className="w-5 h-5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {token.mode === 'advanced' && (
          <div className="bg-[#2a2a2a] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Advanced Features</h2>
            <div className="space-y-4">
              {ADVANCED_FEATURES.map((feature) => {
                const isEnabled = token.features?.some(f => f.name === feature.name && f.enabled);
                return (
                  <div key={feature.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Zap className={isEnabled ? 'text-blue-400' : 'text-gray-600'} />
                      <span>{feature.name}</span>
                    </div>
                    <button
                      onClick={() => handleFeatureClick(feature)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                        isEnabled
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                          : 'bg-gray-700/20 text-gray-400 border border-gray-700/50 hover:bg-gray-700/40'
                      }`}
                    >
                      {isEnabled ? 'Configure' : 'Enable'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {token.mode === 'degen' && (
          <div className="bg-[#2a2a2a] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Degen Features</h2>
            <div className="space-y-4">
              {[
                'Dynamic bonding curve',
                'Automatic liquidity generation',
                'No transfer limits',
                'No trading restrictions',
                'Community-driven launch'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-red-400">
                  <Skull className="w-5 h-5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}