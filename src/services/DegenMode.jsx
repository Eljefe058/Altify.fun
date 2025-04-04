import idl from '../../programs/degen-token/src/idl (10).json';
import { clusterApiUrl, Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { AnchorProvider, BN, Program, web3 } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { Buffer } from 'buffer';
import { TOKEN_PROGRAM_ID, MintLayout, createInitializeMintInstruction } from '@solana/spl-token';
window.Buffer = Buffer;

const programID = new PublicKey(idl.programID);
const network = clusterApiUrl("devnet");
const opts = {
    preflightCommitment: "processed",
};

const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window.solana, opts.preflightCommitment);
    return provider;
};

export async function degeninitializeToken(name, symbol, liquidity) {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);

    try {
        // Initialize the mintToken account
        const mintToken = web3.Keypair.generate();

        // Initialize the tokenInfo account
        const tokenInfo = web3.Keypair.generate();

        // Derive the PDA for liquidityPool
        const [liquidityPool, liquidityPoolBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('Liquidity_Pool'), provider.wallet.publicKey.toBuffer()],
            program.programId
        );

        // Derive the PDA for tokenMintAuthority
        const [mintAuthority, mintAuthorityBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('SAFE_TOKEN_AUTHORITY')],
            program.programId
        );

        // Derive the PDA for solAccount
        const [solAccount, solAccountBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('Sol_Account'), provider.wallet.publicKey.toBuffer()],
            program.programId
        );

        console.log({
            mintToken: mintToken.publicKey.toBase58(),
            tokenInfo: tokenInfo.publicKey.toBase58(),
            liquidityPool: liquidityPool.toBase58(),
            mintAuthority: mintAuthority.toBase58(),
            solAccount: solAccount.toBase58(),
        });

        const tx = new web3.Transaction().add(
            // Create mintToken account
            SystemProgram.createAccount({
                fromPubkey: provider.wallet.publicKey,
                newAccountPubkey: mintToken.publicKey,
                space: MintLayout.span,
                lamports: await provider.connection.getMinimumBalanceForRentExemption(MintLayout.span),
                programId: TOKEN_PROGRAM_ID,
            }),
            // Initialize mintToken account
            createInitializeMintInstruction(
                mintToken.publicKey,
                6, // Decimals
                provider.wallet.publicKey, // Mint authority
                provider.wallet.publicKey // Freeze authority
            ),
            // Create tokenInfo account
            SystemProgram.createAccount({
                fromPubkey: provider.wallet.publicKey,
                newAccountPubkey: tokenInfo.publicKey,
                space: 9000,
                lamports: await provider.connection.getMinimumBalanceForRentExemption(9000),
                programId: program.programId,
            })
        );

        // Add the initialization instruction using methods
        await program.methods.initialize(name, symbol, new BN(liquidity))
            .accounts({
                tokenInfo: tokenInfo.publicKey,
                mintToken: mintToken.publicKey,
                liquidityPool: liquidityPool,
                tokenMintAuthority: mintAuthority,
                solAccount: solAccount,
                user: provider.wallet.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers([mintToken, tokenInfo])
            .rpc();

        const signature = await provider.send(tx);
        console.log('Transaction signature', signature);
    } catch (err) {
        console.error('Transaction failed:', err);
    }
}