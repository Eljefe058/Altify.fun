import {
    Connection,
    PublicKey,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token";
import { WalletContextState } from '@solana/wallet-adapter-base';

interface TransactionAccounts {
    fromAccount: PublicKey;
    toAccount: PublicKey;
    tokenProgram: PublicKey;
    user: PublicKey;
    platformOwnerAddress: PublicKey;
    lastTransactionTime: { timestamp: number};
}

interface TransactionContext {
    accounts: TransactionAccounts;
}

export async function executeTransactionProtection (
    wallet: WalletContextState,
    connection: Connection,
    fromAccount: PublicKey,
    toAccount: PublicKey,
    amount: number,
    platformOwnerAddress: PublicKey,
    lastTransactionTime: { timestamp: number }

): Promise<void> {
    if(!wallet.publicKey) {
        throw new Error('wallet not connected');
}

    const set_highest_amount = 10_000_000;
    const transaction_fees = amount / 100;

    if (amount > set_highest_amount) {
        throw new Error('Amount exceeds limit');
    }

    const current_time = Math.floor(Date.now() / 1000);
    const minimal_interval = 15;

    if(current_time - lastTransactionTime.timestamp < minimal_interval) {
        throw new Error('Transaction too soon');
    }

    lastTransactionTime.timestamp = current_time;

    const transferInstruction1 = createTransferInstruction(
        fromAccount,
        toAccount,
        wallet.publicKey,
        amount
    );

    const transferInstruction2 = createTransferInstruction(
        fromAccount,
        platformOwnerAddress,
        wallet.publicKey,
        transaction_fees
    );

    const transaction = new Transaction().add(transferInstruction1, transferInstruction2);

    await sendAndConfirmTransaction(
        connection,
        transaction,
        [wallet]
    );
}