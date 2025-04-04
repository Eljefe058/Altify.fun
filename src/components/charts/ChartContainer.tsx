import React, { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import TradingViewChart from './TradingViewChart';
import BondingCurveChart from './BondingCurveChart';
import { useChartData } from '../../hooks/useChartData';

interface ChartContainerProps {
  type: 'trading' | 'bonding';
  currentAmount?: number;
  targetAmount?: number;
  symbol: string;
}

export default function ChartContainer({ 
  type, 
  currentAmount, 
  targetAmount, 
  symbol 
}: ChartContainerProps) {
  const [timeframe, setTimeframe] = useState('1D');
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Memoize chart data parameters
  const chartParams = useCallback(() => ({
    symbol,
    type,
    bondingParams: type === 'bonding' ? { 
      currentAmount: currentAmount || 0, 
      targetAmount: targetAmount || 0 
    } : undefined
  }), [type, currentAmount, targetAmount, symbol]);

  const { data, isLoading, error } = useChartData(
    symbol,
    type,
    chartParams().bondingParams
  );

  // Handle chart visibility with animation
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [type]);

  return (
    <div className="bg-[#2a2a2a] rounded-lg p-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {type === 'trading' ? 'Price Chart' : 'Bonding Curve'}
          </h2>
          {hoverPrice && (
            <div className="text-sm text-gray-400">
              Price: ${hoverPrice.toFixed(8)}
            </div>
          )}
        </div>

        {type === 'trading' && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            {['1H', '1D', '1W', '1M'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-[#7a5cff] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {type === 'trading' ? (
          <TradingViewChart
            data={data}
            onHover={setHoverPrice}
            isLoading={isLoading}
            error={error}
            symbol={`${symbol}/SOL`}
          />
        ) : (
          <BondingCurveChart
            data={data}
            currentAmount={currentAmount || 0}
            targetAmount={targetAmount || 0}
            onHover={setHoverPrice}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}