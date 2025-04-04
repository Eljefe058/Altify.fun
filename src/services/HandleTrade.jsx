import idl from '../../programs/degen-token/src/idl (8).json';
import {clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, Transaction} from '@solana/web3.js';
import {AnchorProvider, Program, utils} from "@project-serum/anchor";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {Buffer} from 'buffer';
import { BN } from '@coral-xyz/anchor';
import {getAccount, createMint, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress} from "@solana/spl-token";
import {connected} from "process";
window.Buffer = Buffer


const programID = new PublicKey(idl.programID);
const network = clusterApiUrl("devnet")
const opts = {
    preflightCommitment: "processed",
}

let initialLiquidity = 0;

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const getProvider = () => {

    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window.solana, opts.preflightCommitment);
    return provider;
}

export function getLiquidityAccount(liquidityAccount) {
    initialLiquidity = liquidityAccount;
}

export async function handleTheTransaction(amount, tokenAccount, userPublicKey, price) {

    try {
        console.log("first line");
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
        const lastTransactionTime = Math.floor(Date.now() / 1000).toString();
        console.log(initialLiquidity);
        let solBalance = 0;

        let newTokenKeypair = Keypair.generate();
        let newTokenAccount = newTokenKeypair.publicKey;
        console.log(price);

        const connection = provider.connection;
        const userKey = new PublicKey(userPublicKey)

        const liquidityAccountKeypair = newTokenKeypair.publicKey;
        // const liquidityAccount = new PublicKey(liquidityAccountKeypair);
        // console.log("New liquidity address: ", liquidityAccount.toBase58());

        const mintKeypair = Keypair.generate();
        const mintAddress = mintKeypair.publicKey;
        // const mintKey = new PublicKey(mintAddress);
        console.log("New mint address: ", mintAddress.toBase58());

        const ownerPublicKey = await provider.wallet.publicKey;

        const userTokenAccount = await getAssociatedTokenAddress(
            mintAddress,
            userKey,
            false,
            TOKEN_PROGRAM_ID
        );

        console.log("User Token Account: ", userTokenAccount.toBase58());

        try {
            await getAccount(connection, userTokenAccount);
            console.log("User token account already exists");
        }catch (err) {
            console.log("User token account does not exist. Creating it now...")
            const tx = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    provider.wallet.publicKey,
                    userTokenAccount,
                    userKey,
                    mintAddress
                )
            );

            const signature = await provider.sendAndConfirm(tx);
            console.log("User token account created with signature", signature);

        }

        const [newTokenAddress, bump] = PublicKey.findProgramAddressSync(
            [
                utils.bytes.utf8.encode("TOKEN_ACCOUNT_ONE"),
                provider.wallet.publicKey.toBuffer(),
            ],
            program.programId
        );

        const [usersTokenAccount, userTokenAccountBump] = PublicKey.findProgramAddressSync(
            [Buffer.from("user_token_account"), provider.wallet.publicKey.toBuffer()],
            program.programId
        );


        const [amountAccount, amountBump] = PublicKey.findProgramAddressSync(
            [Buffer.from("amount"), provider.wallet.publicKey.toBuffer()],
            program.programId
        );

        const [lastTransactionTokenAccount, lastTransactionTimeBump] = PublicKey.findProgramAddressSync(
            [Buffer.from("last_transaction_time"), provider.wallet.publicKey.toBuffer()],
            program.programId
        );

        const [platformOwnerPDA, platformOwnerBump] = PublicKey.findProgramAddressSync(
            [Buffer.from("platform_owner"), provider.wallet.publicKey.toBuffer()],
            program.programId
        );


        const signature = await program.methods
            .buyToken(amount.toString(), price.toString())
            .accounts({
                mint: newTokenAddress,
                user: provider.wallet.publicKey,
                last_transaction_time: lastTransactionTokenAccount,
                liquidity_account: newTokenAddress,
                user_token_account: usersTokenAccount,
                amount: amountAccount,
                platform_owner_account: platformOwnerPDA,
                token_program: TOKEN_PROGRAM_ID,
            })
            .rpc();

        console.log("Transaction completed with signature:", signature);

    } catch (error) {
        console.error("method handle transaction did not go through: ", error)
    }
}

export async function sellToken(amount, price) {
    try {
        console.log("Initializing token sell transaction... ")

        const provider = getProvider();
        if(!provider) throw new Error("Wallet not connected");

        const program = new Program(idl, programID, provider)
        const user = provider.wallet.publicKey;


        const [mintPda, mintPdaBump] = PublicKey.findProgramAddressSync(
            [
                utils.bytes.utf8.encode("TOKEN_ACCOUNT_ONE"),
                provider.wallet.publicKey.toBuffer()
            ],
            program.programId
        )
        const [lastTransactionTokenAccount, lastTransactionTimeBump] = PublicKey.findProgramAddressSync(
            [Buffer.from("last_transaction_time"), provider.wallet.publicKey.toBuffer()],
            program.programId
        );

        const [usersTokenAccount, userTokenAccountBump] = PublicKey.findProgramAddressSync(
                [Buffer.from("user_token_account"), provider.wallet.publicKey.toBuffer()],
            program.programId
        );


        const [amountAccount, amountBump] = PublicKey.findProgramAddressSync(
            [Buffer.from("amount"), provider.wallet.publicKey.toBuffer()],
            program.programId
        );


        const [platformOwnerPDA, platformOwnerBump] = PublicKey.findProgramAddressSync(
            [Buffer.from("platform_owner"), provider.wallet.publicKey.toBuffer()],
            program.programId
        );

        const signature = await program.methods
            .sellToken(amount.toString(), price.toString())
            .accounts({
                mint: mintPda,
                user: user,
                last_transaction_time: lastTransactionTokenAccount,
                liquidity_account: mintPda,
                user_token_account: usersTokenAccount,
                amount: amountAccount,
                platform_owner_account: platformOwnerPDA,
                token_program: TOKEN_PROGRAM_ID,
            })
            .rpc()
        console.log("Transaction successful w/ signature: ", signature);

    }catch(error){
        console.error("Sell token transaction failed; ", error);
    }
}