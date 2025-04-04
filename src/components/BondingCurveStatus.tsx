import React from 'react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { formatUSD, formatSOL } from '../utils/price';

interface BondingCurveStatusProps {
  currentAmount: number;
  targetAmount: number;
  currentUSD: number;
  targetUSD: number;
  solPrice: number;
  contributors: number;
  onContribute: (amount: number) => Promise<void>;
  isContributing: boolean;
  contributionAmount: string;
  setContributionAmount: (amount: string) => void;
  balance: number | null;
}

export default function BondingCurveStatus({
  currentAmount,
  targetAmount,
  currentUSD,
  targetUSD,
  solPrice,
  contributors,
  onContribute,
  isContributing,
  contributionAmount,
  setContributionAmount,
  balance
}: BondingCurveStatusProps) {
  const progress = (currentUSD / targetUSD) * 100;
  const remainingUSD = targetUSD - currentUSD;
  const remainingSOL = targetAmount - currentAmount;

  const handleContribute = () => {
    const amount = parseFloat(contributionAmount);
    if (!isNaN(amount) && amount > 0) {
      onContribute(amount);
    }
  };

  return (
    <div className="bg-[#2a2a2a] rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        Contribute SOL
      </h2>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Launch Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="h-4 bg-[#1e1e1e] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#7a5cff] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-white">
            {formatUSD(currentUSD)} ({formatSOL(currentAmount)} SOL)
          </span>
          <span className="text-gray-400">
            {formatUSD(targetUSD)}
          </span>
        </div>
      </div>

      <div className="bg-[#1e1e1e] rounded-lg p-4 mb-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">SOL Price</span>
          <div className="flex items-center gap-2">
            <span className="text-white">{formatUSD(solPrice)}</span>
            <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Remaining</span>
          <span className="text-white">
            {formatUSD(remainingUSD)} ({formatSOL(remainingSOL)} SOL)
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Contributors</span>
          <span className="text-white">{contributors}</span>
        </div>
      </div>

      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-semibold mb-1">High-Risk Warning</h3>
            <p className="text-sm text-gray-300">
              Contributing SOL to this bonding curve is highly speculative. 
              Once the threshold of {formatUSD(targetUSD)} is met, the token will be listed on Raydium automatically.
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
              onChange={(e) => setContributionAmount(e.target.value)}
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
  );
}