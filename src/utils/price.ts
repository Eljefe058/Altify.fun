import { Connection, PublicKey } from '@solana/web3.js';

// Cache price data to avoid excessive API calls
let lastPriceUpdate = 0;
let cachedPrice: number | null = null;
const CACHE_DURATION = 5000; // 5 seconds

// Price update subscribers
const subscribers = new Set<(price: number) => void>();

// Fallback price if all APIs fail
const FALLBACK_PRICE = 100; // $100 USD

// API endpoints with API keys
const ENDPOINTS = {
  coingecko: 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&x_cg_demo_api_key=CG-Dja2R2rhxMMJ7ixZXJ3SQqyk',
  jupiter: 'https://price.jup.ag/v4/price?ids=SOL'
};

// Track API failures to implement backoff
const apiFailures = new Map<string, { count: number; lastTry: number }>();
const MAX_RETRIES = 3;
const BACKOFF_DURATION = 60000; // 1 minute

async function fetchWithTimeout(url: string, timeout = 3000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function fetchFromCoinGecko(): Promise<number> {
  try {
    const response = await fetchWithTimeout(ENDPOINTS.coingecko);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data?.solana?.usd) {
      throw new Error('Invalid price data from CoinGecko');
    }

    const price = data.solana.usd;
    validatePrice(price);

    // Reset failure count on success
    apiFailures.delete('coingecko');
    
    return price;
  } catch (err) {
    // Track failure
    const failures = apiFailures.get('coingecko') || { count: 0, lastTry: 0 };
    apiFailures.set('coingecko', {
      count: failures.count + 1,
      lastTry: Date.now()
    });
    
    throw err;
  }
}

async function fetchFromJupiter(): Promise<number> {
  try {
    const response = await fetchWithTimeout(ENDPOINTS.jupiter);
    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data?.data?.SOL?.price) {
      throw new Error('Invalid price data from Jupiter');
    }

    const price = data.data.SOL.price;
    validatePrice(price);

    // Reset failure count on success
    apiFailures.delete('jupiter');
    
    return price;
  } catch (err) {
    // Track failure
    const failures = apiFailures.get('jupiter') || { count: 0, lastTry: 0 };
    apiFailures.set('jupiter', {
      count: failures.count + 1,
      lastTry: Date.now()
    });
    
    throw err;
  }
}

function validatePrice(price: number): void {
  if (typeof price !== 'number' || isNaN(price) || price <= 0 || price > 10000) {
    throw new Error('Invalid SOL price received');
  }
}

function shouldRetryAPI(api: string): boolean {
  const failures = apiFailures.get(api);
  if (!failures) return true;

  // Check if we should reset backoff
  if (Date.now() - failures.lastTry > BACKOFF_DURATION) {
    apiFailures.delete(api);
    return true;
  }

  return failures.count < MAX_RETRIES;
}

export async function getSOLPrice(): Promise<number> {
  // Return cached price if available and recent
  if (cachedPrice && Date.now() - lastPriceUpdate < CACHE_DURATION) {
    return cachedPrice;
  }

  // Try CoinGecko first
  if (shouldRetryAPI('coingecko')) {
    try {
      const price = await fetchFromCoinGecko();
      cachedPrice = price;
      lastPriceUpdate = Date.now();
      subscribers.forEach(callback => callback(price));
      return price;
    } catch (err) {
      console.warn('CoinGecko API failed, trying Jupiter:', err);
    }
  }

  // Try Jupiter as backup
  if (shouldRetryAPI('jupiter')) {
    try {
      const price = await fetchFromJupiter();
      cachedPrice = price;
      lastPriceUpdate = Date.now();
      subscribers.forEach(callback => callback(price));
      return price;
    } catch (err) {
      console.warn('Jupiter API failed, using fallback:', err);
    }
  }

  // Use cached price if available
  if (cachedPrice !== null) {
    console.info('Using cached SOL price as fallback');
    return cachedPrice;
  }

  // Use fallback price as last resort
  console.info('Using fallback SOL price');
  return FALLBACK_PRICE;
}

export function subscribeToSOLPrice(callback: (price: number) => void): () => void {
  subscribers.add(callback);
  
  // Immediately get current price
  if (cachedPrice) {
    callback(cachedPrice);
  } else {
    getSOLPrice().then(callback);
  }

  // Return unsubscribe function
  return () => subscribers.delete(callback);
}

export function startPriceUpdates(): () => void {
  const interval = setInterval(getSOLPrice, CACHE_DURATION);
  return () => clearInterval(interval);
}

// Formatting utilities
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount < 0.01 ? 8 : 2,
    maximumFractionDigits: amount < 0.01 ? 8 : 2
  }).format(amount);
}

export function formatSOL(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount);
}

// Price calculation utilities
export function calculateTokenPrice(
  solAmount: number,
  tokenSupply: number,
  solPrice: number
): number {
  // Base price in SOL
  const basePrice = solAmount / tokenSupply;
  // Convert to USD
  return basePrice * solPrice;
}

export function calculateBondingCurvePrice(
  currentAmount: number,
  targetAmount: number,
  solPrice: number
): number {
  // Exponential bonding curve: price = (current_amount)^2 / (2 * target_amount)
  const priceInSOL = (currentAmount * currentAmount) / (2 * targetAmount);
  return priceInSOL * solPrice;
}

// Calculate SOL amount needed to reach USD target
export function calculateSOLAmount(
  targetUSD: number,
  solPrice: number
): number {
  return targetUSD / solPrice;
}

// Calculate price impact
export function calculatePriceImpact(
  amount: number,
  poolLiquidity: number
): number {
  return (amount / (poolLiquidity + amount)) * 100;
}