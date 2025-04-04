// import {Connection, PublicKey, Keypair, Transaction, SystemProgram, clusterApiUrl} from "@solana/web3.js";
// import {Wallet, Program, AnchorProvider, web3} from '@project-serum/anchor';
// import idl from '../../programs/degen-token/src/idl (3).json';
// import {useState} from "react";
// // import {getAnchorProvider} from "../pages/anchorClient.ts";
//
//
// const programID = new PublicKey(idl.metadata);
// const network = clusterApiUrl("devnet")
// const opts = {
//     preflightCommitment: "processed",
// }
//
// const {SystemProgram} = web3;
//
//
// export async function createAndSignTransaction(wallet: Wallet, connection: Connection, publicKey: PublicKey) {
//     try {
//        const [walletAddress, setWalletAddress ] = useState(null);
//
//        const getProvider = () => {
//            const connection = new Connection(network, opts.preflightCommitment);
//            const provider = new AnchorProvider(connection, window.solana, opts.preflightCommitment);
//        }
//
//     }
// }