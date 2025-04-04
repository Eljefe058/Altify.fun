import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { DegenToken } from "../target/types/degen_token";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { assert } from "chai";

describe("degen-token", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.DegenToken as Program<DegenToken>;
  
  let mint: anchor.web3.PublicKey;
  let fromTokenAccount: anchor.web3.PublicKey;
  let toTokenAccount: anchor.web3.PublicKey;
  let feeTokenAccount: anchor.web3.PublicKey;
  
  const payer = anchor.web3.Keypair.generate();
  const recipient = anchor.web3.Keypair.generate();
  const feeWallet = new anchor.web3.PublicKey("FeeWa11etXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
  
  const tokenName = "Degen Token";
  const tokenSymbol = "DEGEN";
  const decimals = 9;

  before(async () => {
    // Airdrop SOL to payer
    const signature = await provider.connection.requestAirdrop(
      payer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    // Create mint
    mint = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      null,
      decimals,
      undefined,
      undefined,
      TOKEN_PROGRAM_ID
    );

    // Create token accounts
    fromTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      payer,
      mint,
      payer.publicKey
    );

    toTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      payer,
      mint,
      recipient.publicKey
    );

    feeTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      payer,
      mint,
      feeWallet
    );

    // Mint some tokens to payer
    await mintTo(
      provider.connection,
      payer,
      mint,
      fromTokenAccount,
      payer.publicKey,
      1000000000 // 1000 tokens with 6 decimals
    );
  });

  it("Initializes the degen token", async () => {
    const [tokenInfo] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("token-info"), mint.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeDegenToken(tokenName, tokenSymbol, decimals)
      .accounts({
        tokenInfo,
        mint,
        authority: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([payer])
      .rpc();

    const tokenInfoAccount = await program.account.tokenInfo.fetch(tokenInfo);
    assert.equal(tokenInfoAccount.name, tokenName);
    assert.equal(tokenInfoAccount.symbol, tokenSymbol);
    assert.equal(tokenInfoAccount.decimals, decimals);
  });

  it("Transfers tokens with 1% fee", async () => {
    const [tokenInfo] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("token-info"), mint.toBuffer()],
      program.programId
    );

    const transferAmount = new anchor.BN(100000000); // 100 tokens
    const expectedFee = transferAmount.divn(100); // 1%
    const expectedTransfer = transferAmount.sub(expectedFee);

    const beforeFromBalance = await provider.connection.getTokenAccountBalance(fromTokenAccount);
    const beforeToBalance = await provider.connection.getTokenAccountBalance(toTokenAccount);
    const beforeFeeBalance = await provider.connection.getTokenAccountBalance(feeTokenAccount);

    await program.methods
      .transferWithFee(transferAmount)
      .accounts({
        from: fromTokenAccount,
        to: toTokenAccount,
        feeAccount: feeTokenAccount,
        mint,
        tokenInfo,
        authority: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([payer])
      .rpc();

    const afterFromBalance = await provider.connection.getTokenAccountBalance(fromTokenAccount);
    const afterToBalance = await provider.connection.getTokenAccountBalance(toTokenAccount);
    const afterFeeBalance = await provider.connection.getTokenAccountBalance(feeTokenAccount);

    // Verify balances
    assert.equal(
      beforeFromBalance.value.amount - afterFromBalance.value.amount,
      transferAmount.toString()
    );
    assert.equal(
      afterToBalance.value.amount - beforeToBalance.value.amount,
      expectedTransfer.toString()
    );
    assert.equal(
      afterFeeBalance.value.amount - beforeFeeBalance.value.amount,
      expectedFee.toString()
    );
  });
});