import idl from '../../programs/degen-token/src/idl (8).json';
import {clusterApiUrl, Connection, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import {AnchorProvider, BN, Program, utils} from "@project-serum/anchor";
import {Buffer} from 'buffer';
window.Buffer = Buffer;

// Public key of the deployed smart contract
const programID = new PublicKey(idl.programID)
const real_network = clusterApiUrl("devnet");
const opts = {
    preflightCommitment: "processed",
}


const getProvider = () => {
    const connection = new Connection(real_network, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window.solana, opts.preflightCommitment);
    return provider;
}


export async function createTheToken(name, symbol, liquidity)  {
        try {
            console.log("First line")
            const provider = getProvider();
            const program = new Program(idl, programID, provider);
            const encoder = new TextEncoder();
            // Generate a new Keypair for the token account

            const tx = new Transaction();

            console.log("second line")
            //


           const [newTokenAddress, bump] = PublicKey.findProgramAddressSync(
                [
                    utils.bytes.utf8.encode("TOKEN_ACCOUNT_ONE"),
                    provider.wallet.publicKey.toBuffer(),
                ],
                program.programId
            );

            console.log(Buffer.from("TOKEN_ACCOUNT_ONE"))
            console.log(Buffer.from(provider.wallet.publicKey.toBuffer()))
            console.log("Third line")
            // console.log(newTokenAddress);

            // const bigNumber = new BN('5678');
            // const buffer = bigNumber.toArrayLike(Buffer, 'le', 8);



            // Now, call the program's `initialize` method
            await program.methods.initialize(name,symbol, liquidity.toString())
                .accounts({
                    mint: newTokenAddress,
                    owner:provider.wallet.publicKey,// Pass the new token account's PublicKey
                    user: provider.wallet.publicKey,  // User (signer) account
                    systemProgram: SystemProgram.programId,
                })
                .signers([])  // Sign with the newly created Keypair for the token account// Include the account creation instruction
                .rpc()
                .then(() => {
                    console.log("Created a new token with address: ", newTokenAddress.toString()); // Log the address in Base58 format
                    return true;
                })
            console.log("Fourth line")

            console.log("Created a new token with address: ", newTokenAddress.toString()); // Log the address in Base58 format
        } catch (error) {
            console.error("Error creating token account: ", error);
        }


}
