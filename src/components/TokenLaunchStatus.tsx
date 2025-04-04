import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { formatUSD, formatSOL } from '../utils/price';
import AutomaticLiquidityDeployment from './AutomaticLiquidityDeployment';
import { useTokenLaunch } from '../hooks/useTokenLaunch';

interface TokenLaunchStatusProps {
  tokenAddress: string;
  currentSOL: number;
  onLaunchSuccess: () => void;
  onLaunchError: (error: string) => void;
}

export default function TokenLaunchStatus({
  tokenAddress,
  currentSOL,
  onLaunchSuccess,
  onLaunchError
}: TokenLaunchStatusProps) {
  const { currentUSD, targetUSD, isReady, solAmount } = useTokenLaunch(currentSOL);
  const progress = (currentUSD / targetUSD) * 100;

  return (
    <div className="space-y-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Launch Status</h2>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress to Launch</span>
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
              {formatUSD(currentUSD)} ({formatSOL(solAmount)} SOL)
            </span>
            <span className="text-gray-400">{formatUSD(targetUSD)}</span>
          </div>
        </div>

        {isReady ? (
          <AutomaticLiquidityDeployment
            tokenAddress={tokenAddress}
            solAmount={solAmount}
            onSuccess={onLaunchSuccess}
            onError={onLaunchError}
          />
        ) : (
          <div className="bg-[#1e1e1e] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-yellow-400 font-semibold mb-1">
                  Waiting for Launch Threshold
                </h3>
                <p className="text-sm text-gray-300">
                  The token will automatically launch and deploy liquidity once {formatUSD(targetUSD)} is reached.
                  Currently at {formatUSD(currentUSD)}.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}