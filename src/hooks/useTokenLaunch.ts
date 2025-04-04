import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { getSOLPrice } from '../utils/price';

const TARGET_USD = 20000; // $20,000 USD threshold

interface LaunchState {
  currentUSD: number;
  targetUSD: number;
  isReady: boolean;
  solAmount: number;
}

export function useTokenLaunch(currentSOL: number) {
  const { connection } = useWallet();
  const [state, setState] = useState<LaunchState>({
    currentUSD: 0,
    targetUSD: TARGET_USD,
    isReady: false,
    solAmount: currentSOL
  });

  useEffect(() => {
    let isSubscribed = true;
    let interval: NodeJS.Timeout;

    const updateState = async () => {
      try {
        const solPrice = await getSOLPrice();
        const currentUSD = currentSOL * solPrice;
        
        if (isSubscribed) {
          setState({
            currentUSD,
            targetUSD: TARGET_USD,
            isReady: currentUSD >= TARGET_USD,
            solAmount: currentSOL
          });
        }
      } catch (err) {
        console.error('Failed to update launch state:', err);
      }
    };

    // Initial update
    updateState();

    // Update every 5 seconds
    interval = setInterval(updateState, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [currentSOL, connection]);

  return state;
}