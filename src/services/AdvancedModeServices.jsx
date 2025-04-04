import idl from '../../programs/degen-token/src/idl (9).json';
import {clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, Transaction} from '@solana/web3.js';
import {AnchorProvider, BN, Program, utils} from "@project-serum/anchor";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {Buffer} from 'buffer';
// import { BN } from '@coral-xyz/anchor';
import {getAccount, createMint, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress} from "@solana/spl-token";
window.Buffer = Buffer


const programID = new PublicKey(idl.programID);
const network = clusterApiUrl("devnet")
const opts = {
    preflightCommitment: "processed",
}

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window.solana, opts.preflightCommitment);
    return provider;
}


export async function advancedModeInitialize(name, token_symbol, amount, price) {
    console.log("First line")
    const provider = getProvider();
    const program = new Program(idl, programID, provider);


    const [tokenMint, tokenMintBump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("TOKEN_MINT"),
            provider.wallet.publicKey.toBuffer()
        ],
        program.programId
    );


    console.log("2nd line")

   const tokenAccount = await getAssociatedTokenAddress(
       tokenMint,
       provider.wallet.publicKey,
   );

    const [tokenInfo, tokenInfoBump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("TOKEN_INFO"),
            provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
    );

    const [bondingState, bondingStateBump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("BONDING_STATE"),
            Buffer.from(""),
        ],
        program.programId,
    );

    const [tokenMintAuthority, tokenMintAuthorityBump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("TOKEN_MINT_AUTHORITY"),
            Buffer.from(""),
        ],
        program.programId,
    );

    const [solPdaAccount, solPdaAccountBump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("SOL_VAULT"),
            provider.wallet.publicKey.toBuffer()
        ],
        program.programId
    );
    //
    console.log("3rd line")

    const safeAmount = amount ? new BN(amount) : new BN(0);
    const safePrice = price ? new BN(price) : new BN(0);

    try{
        const signature = await program.methods
            .initialize(name.toString(), token_symbol.toString(), new BN(amount), new BN(price))
            .accounts({
                tokenMint,
                pdaTokenAccount: tokenAccount,
                tokenInfo: tokenInfo,
                user: provider.wallet.publicKey,
                bondingState: bondingState,
                tokenMintAuthority: tokenMintAuthority,
                solPdaAccount: solPdaAccount,
                systemProgram:SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc()
            console.log("Transaction succeeded w/ signature: ", signature);
        console.log("4th line")
    }catch(error){
        console.error("Something happened: ", error);
    }
}