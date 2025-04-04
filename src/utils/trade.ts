import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getSOLPrice } from './price';

interface TradeParams {
  type: 'buy' | 'sell';
  amount: number;
  slippage: number;
  tokenMint: string;
  userPublicKey: PublicKey;
}

interface TradeQuote {
  expectedAmount: number;
  minAmount: number;
  maxAmount: number;
  priceImpact: number;
  fee: number;
}

// Cache quotes briefly to prevent rapid price changes during confirmation
const quoteCache = new Map<string, { quote: TradeQuote; timestamp: number }>();
const QUOTE_CACHE_DURATION = 10000; // 10 seconds

export async function getTradeQuote(
  connection: Connection,
  params: TradeParams
): Promise<TradeQuote> {
  const cacheKey = `${params.type}-${params.amount}-${params.tokenMint}`;
  const cached = quoteCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < QUOTE_CACHE_DURATION) {
    return cached.quote;
  }

  try {
    // Get current SOL price
    const solPrice = await getSOLPrice();
    const tokenPrice = 0.00123; // Mock token price

    let expectedAmount: number;
    if (params.type === 'buy') {
      expectedAmount = params.amount / tokenPrice;
    } else {
      expectedAmount = params.amount * tokenPrice;
    }

    const slippageMultiplier = 1 - (params.slippage / 100);
    const minAmount = expectedAmount * slippageMultiplier;
    const maxAmount = expectedAmount * (2 - slippageMultiplier);

    // Calculate price impact based on liquidity pool depth
    const priceImpact = calculatePriceImpact(params.amount);

    const quote: TradeQuote = {
      expectedAmount,
      minAmount,
      maxAmount,
      priceImpact,
      fee: 0.0025 * params.amount // 0.25% fee
    };

    // Cache the quote
    quoteCache.set(cacheKey, {
      quote,
      timestamp: Date.now()
    });

    return quote;
  } catch (err: any) {
    throw new Error(`Failed to get trade quote: ${err.message}`);
  }
}

export async function executeTrade(
  connection: Connection,
  params: TradeParams
): Promise<{ txHash: string; actualAmount: number }> {
  try {
    // Get fresh quote
    const quote = await getTradeQuote(connection, params);

    // Simulate successful trade
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock transaction hash
    const txHash = Array.from({ length: 64 }, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');

    return {
      txHash,
      actualAmount: quote.expectedAmount
    };
  } catch (err: any) {
    throw new Error(`Failed to execute trade: ${err.message}`);
  }
}

// Calculate price impact based on trade size relative to pool liquidity
function calculatePriceImpact(amount: number): number {
  // Mock calculation - in production, use actual pool data
  const poolLiquidity = 1000; // Mock pool liquidity
  return (amount / (poolLiquidity + amount)) * 100;
}

export function formatSlippage(slippage: number): string {
  return `${slippage}%`;
}

export function validateSlippage(slippage: number): boolean {
  return slippage >= 0.1 && slippage <= 50;
}