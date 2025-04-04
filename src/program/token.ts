import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress,
} from '@solana/spl-token';

export const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens
const DECIMALS = 9; // Same as SOL for easy calculations

export async function createDegenToken(
  connection: Connection,
  payer: Keypair,
  name: string,
  symbol: string
): Promise<{ mint: PublicKey; txHash: string }> {
  try {
    // Create mint account
    const mint = await createMint(
      connection,
      payer,
      payer.publicKey, // Mint authority
      null, // Freeze authority (none)
      DECIMALS,
      undefined,
      undefined,
      TOKEN_PROGRAM_ID
    );

    // Create associated token account for bonding curve contract
    const bondingCurveATA = await createAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );

    // Mint total supply to bonding curve contract
    const mintTx = await mintTo(
      connection,
      payer,
      mint,
      bondingCurveATA,
      payer.publicKey,
      TOTAL_SUPPLY * (10 ** DECIMALS)
    );

    // Create metadata for the token
    const metadata = {
      name,
      symbol,
      uri: '', // Metadata URI (can be updated later)
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null
    };

    // In production, we would use the Metaplex SDK to create metadata
    // For demo, we'll skip actual metadata creation

    return {
      mint,
      txHash: mintTx
    };
  } catch (err: any) {
    throw new Error(`Failed to create token: ${err.message}`);
  }
}

export async function getTokenBalance(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey
): Promise<number> {
  try {
    const ata = await getAssociatedTokenAddress(mint, owner);
    const balance = await connection.getTokenAccountBalance(ata);
    return Number(balance.value.amount) / (10 ** DECIMALS);
  } catch (err) {
    console.error('Failed to get token balance:', err);
    return 0;
  }
}

export async function transferTokens(
  connection: Connection,
  mint: PublicKey,
  from: Keypair,
  to: PublicKey,
  amount: number
): Promise<string> {
  try {
    const fromATA = await getAssociatedTokenAddress(mint, from.publicKey);
    const toATA = await getAssociatedTokenAddress(mint, to);

    // Create destination account if it doesn't exist
    const toAccount = await connection.getAccountInfo(toATA);
    const transaction = new Transaction();

    if (!toAccount) {
      transaction.add(
        createAssociatedTokenAccount(
          connection,
          from,
          mint,
          to
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: fromATA,
        toPubkey: toATA,
        lamports: amount * (10 ** DECIMALS)
      })
    );

    // Send and confirm transaction
    const txHash = await sendAndConfirmTransaction(
      connection,
      transaction,
      [from]
    );

    return txHash;
  } catch (err: any) {
    throw new Error(`Failed to transfer tokens: ${err.message}`);
  }
}