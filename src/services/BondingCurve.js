import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web.js';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor';
import { getSOLPrice} from "../utils/price.js";
import { getAnchorProvider, getProgram } from '../pages/anchorClient';

const TARGET_USD = 20000;

interface BondingCurveState {
    currentAmount: number;
    targetAmount: number;
    currentUSD: number;
    targetUSD: number;
    solPrice: number;
    contributors: number;
    isLaunched: boolean;
}

export async function initializeBondingCurve(wallet: Wallet, initializeLiquidity: number): Promise<BondingCurveState> {
    const solPrice = await getSOLPrice()
    const targetAmount = TARGET_USD / solPrice;
    const currentUSD = initialLiquidity * solPrice;

    const Provider
}