import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { formatUSD, formatSOL } from '../utils/price';
import { deployLiquidity } from '../utils/raydium';
import { useWallet } from '../contexts/WalletContext';

interface AutomaticLiquidityDeploymentProps {
  tokenAddress: string;
  solAmount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function AutomaticLiquidityDeployment({
  tokenAddress,
  solAmount,
  onSuccess,
  onError
}: AutomaticLiquidityDeploymentProps) {
  const { connection } = useWallet();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentTxHash, setDeploymentTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const deployAutomatically = async () => {
      if (!connection) return;

      setIsDeploying(true);
      setError(null);

      try {
        // Deploy liquidity to Raydium
        const result = await deployLiquidity(
          connection,
          tokenAddress,
          solAmount,
          0.00123 // Initial token price in SOL
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        setDeploymentTxHash(result.txHash);
        onSuccess();
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to deploy liquidity';
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setIsDeploying(false);
      }
    };

    deployAutomatically();
  }, [connection, tokenAddress, solAmount]);

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-semibold mb-1">Deployment Failed</h3>
            <p className="text-sm text-gray-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (deploymentTxHash) {
    return (
      <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="font-medium">Liquidity Deployed Successfully</span>
          </div>
          <p className="text-sm text-gray-300">
            Your token is now available for trading on Raydium.
          </p>
          <a
            href={`https://solscan.io/tx/${deploymentTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#7a5cff] hover:text-[#6a4cef] flex items-center gap-1"
          >
            View Transaction
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2a2a2a] rounded-lg p-4">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-[#7a5cff] animate-spin" />
        <div>
          <h3 className="text-white font-medium">Deploying Liquidity</h3>
          <p className="text-sm text-gray-400">
            Automatically deploying {formatSOL(solAmount)} SOL to Raydium...
          </p>
        </div>
      </div>
    </div>
  );
}