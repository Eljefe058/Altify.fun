import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { getSOLPrice } from '../utils/price';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface BondingPoint {
  time: number;
  value: number;
}

interface ChartState {
  data: CandleData[] | BondingPoint[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
}

export function useChartData(
  tokenAddress: string,
  type: 'trading' | 'bonding',
  bondingCurve?: {
    currentAmount: number;
    targetAmount: number;
  }
) {
  const { connection } = useWallet();
  const [state, setState] = useState<ChartState>({
    data: [],
    isLoading: true,
    error: null,
    lastUpdate: Date.now()
  });

  useEffect(() => {
    let isSubscribed = true;
    let updateInterval: NodeJS.Timeout;

    const generateBondingCurveData = async () => {
      if (!bondingCurve) return [];

      try {
        const solPrice = await getSOLPrice();
        const points: BondingPoint[] = [];
        const maxX = bondingCurve.targetAmount * 1.2;
        const steps = 50; // Reduced from 100 for better performance

        for (let i = 0; i <= steps; i++) {
          const x = (maxX * i) / steps;
          const y = (x * x) / (2 * bondingCurve.targetAmount);
          points.push({ time: x, value: y * solPrice });
        }

        return points;
      } catch (err) {
        console.error('Error generating bonding curve data:', err);
        return [];
      }
    };

    const generateTradingData = async () => {
      try {
        const solPrice = await getSOLPrice();
        const now = new Date();
        const data: CandleData[] = [];
        let lastClose = 0.00123 * solPrice;

        // Generate 12 hours of candles instead of 24 for better performance
        for (let i = 12; i >= 0; i--) {
          const date = new Date(now);
          date.setHours(date.getHours() - i);
          
          const open = lastClose * (1 + (Math.random() - 0.5) * 0.1);
          const high = open * (1 + Math.random() * 0.05);
          const low = open * (1 - Math.random() * 0.05);
          const close = low + Math.random() * (high - low);
          const volume = Math.random() * 100000;

          data.push({
            time: Math.floor(date.getTime() / 1000).toString(),
            open,
            high,
            low,
            close,
            volume
          });

          lastClose = close;
        }

        return data.sort((a, b) => parseInt(a.time) - parseInt(b.time));
      } catch (err) {
        console.error('Error generating trading data:', err);
        return [];
      }
    };

    const updateData = async () => {
      try {
        if (!isSubscribed) return;

        const newData = type === 'bonding'
          ? await generateBondingCurveData()
          : await generateTradingData();

        if (isSubscribed && newData.length > 0) {
          setState({
            data: newData,
            isLoading: false,
            error: null,
            lastUpdate: Date.now()
          });
        }
      } catch (err: any) {
        if (isSubscribed) {
          setState(prev => ({
            ...prev,
            error: err.message,
            isLoading: false
          }));
        }
      }
    };

    // Initial update with debounce
    const timeoutId = setTimeout(updateData, 100);

    // Update less frequently
    const interval = type === 'trading' ? 15000 : 10000; // Increased intervals
    updateInterval = setInterval(updateData, interval);

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
      clearInterval(updateInterval);
    };
  }, [type, tokenAddress, connection, bondingCurve]);

  return state;
}