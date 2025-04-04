import React, { useState } from 'react';
import { Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { formatUSD } from '../utils/bondingCurve';

interface LiquidityDeploymentProps {
  solAmount: number;
  onDeploy: () => Promise<void>;
  isDeploying: boolean;
  error: string | null;
  deploymentTxHash?: string;
}

export default function LiquidityDeployment({
  solAmount,
  onDeploy,
  isDeploying,
  error,
  deploymentTxHash
}: LiquidityDeploymentProps) {
  const [hasConfirmed, setHasConfirmed] = useState(false);

  return (
    <div className="bg-[#2a2a2a] rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        Deploy Liquidity to Raydium
      </h2>

      <div className="bg-[#1e1e1e] rounded-lg p-4 mb-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">SOL to Deploy</span>
          <span className="text-white">{solAmount.toFixed(2)} SOL</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Initial Price</span>
          <span className="text-white">{formatUSD(0.00123)}</span>
        </div>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-yellow-400 font-semibold mb-1">Important Notice</h3>
            <p className="text-sm text-gray-300">
              Once liquidity is deployed:
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Trading will be enabled immediately</li>
                <li>The bonding curve will be disabled</li>
                <li>This action cannot be undone</li>
              </ul>
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {deploymentTxHash ? (
        <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="font-medium">Liquidity Deployed Successfully</span>
            </div>
            <a
              href={`https://solscan.io/tx/${deploymentTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              View Transaction
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-[#1e1e1e] rounded-lg p-4 mb-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 rounded border-gray-700 text-[#7a5cff] focus:ring-[#7a5cff] focus:ring-offset-gray-900"
                checked={hasConfirmed}
                onChange={(e) => setHasConfirmed(e.target.checked)}
              />
              <span className="text-sm text-gray-300">
                I understand that this action will deploy liquidity to Raydium and enable trading immediately.
              </span>
            </label>
          </div>

          <button
            onClick={onDeploy}
            disabled={isDeploying || !hasConfirmed}
            className="w-full bg-[#7a5cff] hover:bg-[#6a4cef] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deploying Liquidity...
              </>
            ) : (
              'Deploy Liquidity'
            )}
          </button>
        </>
      )}
    </div>
  );
}