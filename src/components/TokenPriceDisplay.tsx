import React from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { useTokenPrice } from '../hooks/useTokenPrice';
import { formatUSD, formatSOL } from '../utils/price';

interface TokenPriceDisplayProps {
  tokenAddress: string;
  poolAddress?: string;
  bondingCurve?: {
    currentAmount: number;
    targetAmount: number;
  };
  showChange?: boolean;
  className?: string;
}

export default function TokenPriceDisplay({
  tokenAddress,
  poolAddress,
  bondingCurve,
  showChange = true,
  className = ''
}: TokenPriceDisplayProps) {
  const { priceUSD, priceSOL, isLoading, error } = useTokenPrice(
    tokenAddress,
    poolAddress,
    bondingCurve
  );

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        <span className="text-gray-400">Loading price...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm">
        Failed to load price
      </div>
    );
  }

  // Mock 24h change for demo
  const priceChange = 2.5;
  const changeColor = priceChange > 0 ? 'text-green-400' : 
                     priceChange < 0 ? 'text-red-400' : 
                     'text-gray-400';
  const ChangeIcon = priceChange > 0 ? TrendingUp :
                    priceChange < 0 ? TrendingDown :
                    Minus;

  return (
    <div className={`flex items-baseline gap-3 ${className}`}>
      <div className="space-y-1">
        <div className="text-xl font-semibold text-white">
          {formatUSD(priceUSD)}
        </div>
        <div className="text-sm text-gray-400">
          {formatSOL(priceSOL)} SOL
        </div>
      </div>
      
      {showChange && (
        <div className={`flex items-center gap-1 ${changeColor}`}>
          <ChangeIcon className="w-4 h-4" />
          <span>{Math.abs(priceChange)}%</span>
        </div>
      )}
    </div>
  );
}