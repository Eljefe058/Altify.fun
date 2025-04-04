import React, { useState, useEffect } from 'react';
import { Wallet, ArrowRightLeft, Loader2, AlertTriangle, Settings } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { getTradeQuote, executeTrade, formatSlippage } from '../utils/trade';
import { formatUSD, formatSOL } from '../utils/price';
import {handleTheTransaction, sellToken} from '../services/HandleTrade.jsx';
interface TokenTradeProps {
  tokenSymbol: string;
  tokenAddress: string;
  currentPrice: number;
}

export default function TokenTrade({ tokenSymbol, tokenAddress, currentPrice }: TokenTradeProps) {
  const { isConnected, connect, balance, publicKey, connection } = useWallet();
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Get quote when amount changes
  useEffect(() => {
    const getQuote = async () => {
      if (!amount || !connection || !publicKey) return;

      try {
        const quote = await getTradeQuote(connection, {
          type: mode,
          amount: parseFloat(amount),
          slippage: parseFloat(slippage),
          tokenMint: tokenAddress,
          userPublicKey: publicKey
        });

        setQuote(quote);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setQuote(null);
      }
    };

    getQuote();
  }, [amount, mode, slippage, connection, publicKey, tokenAddress]);

  const handleTransaction = async () => {
    // if (!amount || !connection || !publicKey) return;

    setError(null);
    setIsProcessing(true);

    try {


      const result = await executeTrade(connection, {
        type: mode,
        amount: parseFloat(amount),
        slippage: parseFloat(slippage),
        tokenMint: tokenAddress,
        userPublicKey: publicKey
      });

      if(mode === 'buy') {
        await handleTheTransaction(amount, tokenAddress, publicKey, currentPrice);
      }

      if(mode === 'sell'){
        await sellToken(amount, currentPrice);
      }

      // Clear form after successful transaction
      setAmount('');
      setQuote(null);


      
      // Show success message
      alert(`Transaction successful! View on Solscan: https://solscan.io/tx/${result.txHash}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const maxAmount = mode === 'buy' ? balance || 0 : 1000000; // Replace with actual token balance

  if (!isConnected) {
    return (
      <div className="bg-[#2a2a2a] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Trade {tokenSymbol}</h2>
        <div className="bg-[#1e1e1e] rounded-lg p-4 mb-4">
          <p className="text-gray-300 text-sm">
            Connect your wallet to trade {tokenSymbol} tokens
          </p>
        </div>
        <button
          onClick={connect}
          className="w-full bg-[#7a5cff] hover:bg-[#6a4cef] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#2a2a2a] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Trade {tokenSymbol}</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="bg-[#1e1e1e] rounded-lg p-1 flex mb-6">
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'buy'
              ? 'bg-[#7a5cff] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Buy {tokenSymbol}
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'sell'
              ? 'bg-[#7a5cff] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Sell {tokenSymbol}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-[#1e1e1e] rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Slippage Tolerance</h3>
          <div className="flex gap-2 mb-2">
            {['0.5', '1', '2', '5'].map((value) => (
              <button
                key={value}
                onClick={() => setSlippage(value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  slippage === value
                    ? 'bg-[#7a5cff] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {value}%
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              min="0.1"
              max="50"
              step="0.1"
              className="w-24 px-3 py-1 bg-[#2a2a2a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white text-sm"
            />
            <span className="text-sm text-gray-400">Custom</span>
          </div>
        </div>
      )}

      {/* Amount Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {mode === 'buy' ? 'Amount in SOL' : `Amount in ${tokenSymbol}`}
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.000001"
              className="w-full px-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:border-[#7a5cff] text-white pr-20"
              placeholder="0.00"
            />
            <button
              onClick={() => setAmount(maxAmount.toString())}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-[#7a5cff] hover:text-[#6a4cef] transition-colors"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Trade Info */}
        <div className="bg-[#1e1e1e] rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price</span>
            <span className="text-white">${currentPrice.toFixed(8)}</span>
          </div>
          {quote && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Expected Output</span>
                <span className="text-white">
                  {formatSOL(quote.expectedAmount)} {mode === 'buy' ? tokenSymbol : 'SOL'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Minimum Received</span>
                <span className="text-white">
                  {formatSOL(quote.minAmount)} {mode === 'buy' ? tokenSymbol : 'SOL'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price Impact</span>
                <span className={`${
                  quote.priceImpact > 2 ? 'text-red-400' : 'text-white'
                }`}>
                  {quote.priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Network Fee</span>
                <span className="text-white">~0.000005 SOL</span>
              </div>
            </>
          )}
        </div>

        {/* Warning */}
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Please verify all transaction details. {mode === 'buy' ? 'Purchases' : 'Sales'} cannot be reversed once confirmed.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleTransaction}
          disabled={isProcessing || !amount || parseFloat(amount) <= 0}
          className="w-full bg-[#7a5cff] hover:bg-[#6a4cef] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-4 h-4" />
              {mode === 'buy' ? 'Buy' : 'Sell'} {tokenSymbol}
            </>
          )}
        </button>
      </div>
    </div>
  );
}