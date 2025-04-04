import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { 
  getSOLPrice, 
  subscribeToSOLPrice, 
  updatePoolPrice,
  calculateBondingCurvePrice 
} from '../utils/price';

interface TokenPriceState {
  priceUSD: number;
  priceSOL: number;
  solPrice: number;
  isLoading: boolean;
  error: string | null;
}

export function useTokenPrice(
  tokenAddress: string,
  poolAddress?: string,
  bondingCurve?: { currentAmount: number; targetAmount: number }
) {
  const { connection } = useWallet();
  const [state, setState] = useState<TokenPriceState>({
    priceUSD: 0,
    priceSOL: 0,
    solPrice: 0,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;
    let priceUpdateInterval: NodeJS.Timeout;

    const updatePrice = async () => {
      try {
        const solPrice = await getSOLPrice();
        
        let tokenPriceSOL: number;
        
        if (poolAddress && connection) {
          // Get price from liquidity pool
          tokenPriceSOL = await updatePoolPrice(connection, poolAddress);
        } else if (bondingCurve) {
          // Calculate price from bonding curve
          tokenPriceSOL = calculateBondingCurvePrice(
            bondingCurve.currentAmount,
            bondingCurve.targetAmount,
            solPrice
          );
        } else {
          throw new Error('No price source available');
        }

        if (isMounted) {
          setState({
            priceUSD: tokenPriceSOL * solPrice,
            priceSOL: tokenPriceSOL,
            solPrice,
            isLoading: false,
            error: null
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: err.message
          }));
        }
      }
    };

    // Subscribe to SOL price updates
    const unsubscribe = subscribeToSOLPrice(solPrice => {
      if (isMounted) {
        setState(prev => ({
          ...prev,
          solPrice,
          priceUSD: prev.priceSOL * solPrice
        }));
      }
    });

    // Initial update
    updatePrice();

    // Update every 10 seconds
    priceUpdateInterval = setInterval(updatePrice, 10000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(priceUpdateInterval);
    };
  }, [connection, tokenAddress, poolAddress, bondingCurve]);

  return state;
}