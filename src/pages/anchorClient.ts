import {AnchorProvider, Program, Wallet, web3} from '@project-serum/anchor';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import idl from '../../programs/degen-token/src/idl (3).json'; // Ensure the path to the IDL file is correct

// Options for the Anchor provider
const opts = {
    preflightCommitment: 'processed'
};

// The program ID of the deployed smart contract
const programID = new PublicKey('HT2nJyxW88YnSD5e7FdJ6kjZd2wCHdYAj2yNhazUEFbU');

// Function to get the Anchor provider
export const getAnchorProvider = (wallet : Wallet) => {
    // Create a connection to the Solana cluster
    const connection = new Connection('https://api.devnet.solana.com', opts.preflightCommitment);

    if(!wallet) {
        console.error('wallet is undefined');
    }else{
        console.log('wallet: ', wallet);
    }
    // Create an Anchor provider
    const provider = new AnchorProvider(connection, wallet, opts);
    return provider;
};

// Function to get the Anchor program
export const getProgram = (provider : AnchorProvider) => {
    // Create a new program instance with the IDL and program ID
    return new Program(idl, programID, provider);
};