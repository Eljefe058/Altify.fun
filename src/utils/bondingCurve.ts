import {Connection, Keypair, PublicKey, SystemProgram, Transaction} from '@solana/web3.js';
import { getSOLPrice } from './price';
import { Program, AnchorProvider, Wallet} from "@project-serum/anchor";
// import {program} from "@project-serum/anchor/dist/cjs/native/system";
import { getAnchorProvider ,getProgram} from "../pages/anchorClient.ts";
import { SystemProgram } from '@solana/web3.js';
// import createTokenSafeMode from '../../programs/degen-token/src/'




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

export async function initializeBondingCurve(wallet: Wallet,
  initialLiquidity: number
): Promise<BondingCurveState> {
  const solPrice = await getSOLPrice();
  const targetAmount = TARGET_USD / solPrice;
  const currentUSD = initialLiquidity * solPrice;

  const provider = getAnchorProvider(wallet);
  const program = getProgram(provider);
  const publicKey = provider.wallet.publicKey;
  const lastTransactionTime = new Keypair();

  //Initialize the smart contract
  // const transaction = new Transaction().add(
    await program.methods
    .transaction_protection()
        .accounts({
          owner: publicKey,
          lastTransactionTime: lastTransactionTime.publicKey,
          user: publicKey,
          system_program: SystemProgram.programId,
        }).signers([lastTransactionTime]).rpc();
// )
  return {
    currentAmount: initialLiquidity,
    targetAmount,
    currentUSD,
    targetUSD: TARGET_USD,
    solPrice,
    contributors: 0,
    isLaunched: currentUSD >= TARGET_USD
  };
}

export function calculateTokenPrice(
  currentAmount: number,
  targetAmount: number,
  solPrice: number
): number {
  // Exponential bonding curve: price = (current_amount)^2 / (2 * target_amount)
  const priceInSOL = (currentAmount * currentAmount) / (2 * targetAmount);
  return priceInSOL * solPrice;
}

export async function simulateContribution(
  state: BondingCurveState,
  contributionAmount: number
): Promise<BondingCurveState> {
  const solPrice = await getSOLPrice();
  const newAmount = state.currentAmount + contributionAmount;
  const currentUSD = newAmount * solPrice;
  const targetAmount = TARGET_USD / solPrice;
  const isLaunched = currentUSD >= TARGET_USD;

  return {
    ...state,
    currentAmount: newAmount,
    targetAmount,
    currentUSD,
    targetUSD: TARGET_USD,
    solPrice,
    contributors: state.contributors + 1,
    isLaunched
  };
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatSOL(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount);
}

export async function monitorBondingCurve(
  connection: Connection,
  tokenMint: string,
  onUpdate: (data: { currentAmount: number; currentUSD: number }) => void
): Promise<() => void> {
  let isRunning = true;

  const checkProgress = async () => {
    while (isRunning) {
      try {
        const solPrice = await getSOLPrice();
        
        // In production, fetch actual amounts from the smart contract
        // For demo, we'll use mock data
        const currentAmount = Math.random() * 100;
        const currentUSD = currentAmount * solPrice;

        onUpdate({ currentAmount, currentUSD });

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (err) {
        console.error('Error monitoring bonding curve:', err);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  };

  checkProgress();

  return () => {
    isRunning = false;
  };
}