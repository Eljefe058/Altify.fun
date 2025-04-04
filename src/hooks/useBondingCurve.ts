import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { getSOLPrice, calculateSOLAmount } from '../utils/price';
import { contribute, checkThreshold, deployLiquidity } from '../program/bondingCurve';

const TARGET_USD = 20000; // $20,000 USD threshold

interface BondingCurveState {
  currentAmount: number;
  targetAmount: number;
  currentUSD: number;
  targetUSD: number;
  solPrice: number;
  contributors: number;
  isLaunched: boolean;
}

export function useBondingCurve(tokenAddress: string) {
  const { connection, publicKey } = useWallet();
  const [state, setState] = useState<BondingCurveState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContributing, setIsContributing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentTxHash, setDeploymentTxHash] = useState<string | null>(null);

  // Memoize update function to prevent unnecessary re-renders
  const updateState = useCallback(async () => {
    try {
      const solPrice = await getSOLPrice();
      // Calculate target SOL amount based on USD target and current SOL price
      const targetSOL = TARGET_USD / solPrice;

      setState(prev => {
        if (!prev) return prev;
        const currentUSD = prev.currentAmount * solPrice;
        return {
          ...prev,
          targetAmount: targetSOL,
          currentUSD,
          solPrice,
          isLaunched: currentUSD >= TARGET_USD
        };
      });
    } catch (err) {
      console.error('Failed to update SOL price:', err);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    let interval: NodeJS.Timeout;

    const loadInitialState = async () => {
      try {
        const solPrice = await getSOLPrice();
        // Calculate initial target SOL amount based on USD target
        const targetSOL = TARGET_USD / solPrice;

        if (isSubscribed) {
          setState({
            currentAmount: 0,
            targetAmount: targetSOL,
            currentUSD: 0,
            targetUSD: TARGET_USD,
            solPrice,
            contributors: 0,
            isLaunched: false
          });
          setIsLoading(false);

          // Update price less frequently
          interval = setInterval(updateState, 15000); // Increased from 5000ms
        }
      } catch (err: any) {
        if (isSubscribed) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    loadInitialState();

    return () => {
      isSubscribed = false;
      if (interval) clearInterval(interval);
    };
  }, [tokenAddress, updateState]);

  const handleContribute = async (amount: number) => {
    if (!connection || !publicKey || !state) return;

    setIsContributing(true);
    setError(null);

    try {
      // Execute contribution
      const result = await contribute(
        connection,
        publicKey,
        tokenAddress,
        amount
      );

      // Update state with fresh SOL price
      const solPrice = await getSOLPrice();
      setState(prev => {
        if (!prev) return prev;
        const newAmount = prev.currentAmount + amount;
        const currentUSD = newAmount * solPrice;
        const targetAmount = TARGET_USD / solPrice; // Recalculate target SOL based on current price
        const isLaunched = currentUSD >= TARGET_USD;

        return {
          ...prev,
          currentAmount: newAmount,
          targetAmount,
          currentUSD,
          solPrice,
          contributors: prev.contributors + 1,
          isLaunched
        };
      });

      // Check if threshold is reached
      const isThresholdReached = await checkThreshold(connection, tokenAddress);
      if (isThresholdReached) {
        await handleDeployLiquidity();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsContributing(false);
    }
  };

  const handleDeployLiquidity = async () => {
    if (!connection || !publicKey || !state) return;

    setIsDeploying(true);
    setError(null);

    try {
      const txHash = await deployLiquidity(
        connection,
        tokenAddress,
        publicKey
      );

      setDeploymentTxHash(txHash);
      setState(prev => prev ? { ...prev, isLaunched: true } : prev);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeploying(false);
    }
  };

  return {
    state,
    isLoading,
    error,
    isContributing,
    isDeploying,
    deploymentTxHash,
    contribute: handleContribute,
    deployLiquidity: handleDeployLiquidity
  };
}