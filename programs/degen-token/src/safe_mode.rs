use anchor_lang::prelude::Pubkey;
use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, Burn, InitializeMint, Mint, SetAuthority, Token, TokenAccount, Transfer
};
use spl_token::instruction::AuthorityType;

use anchor_lang::prelude::account;
use anchor_lang::prelude::Accounts;

declare_id!("HT2nJyxW88YnSD5e7FdJ6kjZd2wCHdYAj2yNhazUEFbU");

#[program]
pub mod safe_token_contract {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let ownership = &mut *ctx.accounts.owner;
        ownership.owner = Pubkey::default();

        let current_time = Clock::get()?.unix_timestamp;
        ctx.accounts.last_transaction_time.timestamp = current_time;
        Ok(())
    }

    pub fn liquidity_lock(ctx: Context<LockLiquidity>, amount: u64) -> Result<()> {
        let seeds = &[b"lock_liquidity".as_ref(), &[ctx.accounts.pda_account.bump]];
        let signer = &[&seeds[..]];
        let liquidity_fees = amount / 100;

        let cpi_accounts = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.pda_token_account.to_account_info(),
            authority: ctx.accounts.pda_account.to_account_info(),
        };

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        token::transfer(cpi_context, amount)?;


        let cpi_authority = SetAuthority {
            account_or_mint: ctx.accounts.from.to_account_info(),
            current_authority: ctx.accounts.pda_account.to_account_info(),
        };

        let cpi_authority_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_authority);

        token::set_authority(cpi_authority_ctx, AuthorityType::AccountOwner, None)?;
        
        let cpi_pda_authority = SetAuthority {
            account_or_mint: ctx.accounts.pda_token_account.to_account_info(),
            current_authority: ctx.accounts.pda_account.to_account_info(),
        };

        let cpi_pda_context = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_pda_authority);

        token::set_authority(cpi_pda_context, AuthorityType::AccountOwner, None)?;

        Ok(())
    }

    pub fn transaction_protection(ctx: Context<Transaction>, amount: u64) -> Result<()> {
        //Anti-Whale protection
        let set_highest_amount = 10_000_000;
        let transaction_fees = amount / 100;

        if amount > set_highest_amount {
            return Err(ErrorCode::AmountExceedsLimit.into());
        }

        let current_time = Clock::get()?.unix_timestamp;
        let last_transaction_time = ctx.accounts.last_transaction_time.timestamp;
        let minimal_interval = 15;

        if current_time - last_transaction_time < minimal_interval {
            return Err(ErrorCode::TransactionTooSoon.into());
        }

        ctx.accounts.last_transaction_time.timestamp = current_time;

        let cpi_accounts = Transfer {
            from: ctx.accounts.from_account.to_account_info(),
            to: ctx.accounts.to_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        let cpi_context = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_context, amount)?;


        let cpi_account = Transfer {
            from: ctx.accounts.from_account.to_account_info(),
            to: ctx.accounts.platform_owner_address.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
             
        };

        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_account);
        token::transfer(cpi_ctx, transaction_fees);

        Ok(())
    }



    #[derive(Accounts)]
    pub struct Transaction<'info> {
        #[account(mut)]
        pub from_account: Account<'info, TokenAccount>,
        #[account(mut)]
        pub to_account: Account<'info, TokenAccount>,
        #[account(mut)]
        pub user: Signer<'info>,
        #[account(mut)]
        pub last_transaction_time: Account<'info, LastTransactionTime>,
        #[account(mut)]
        pub platform_owner_address: Account<'info, TokenAccount>,
        pub token_program: Program<'info, Token>,
    }

    #[derive(Accounts)]
    pub struct Initialize<'info> {
        #[account(init, payer=user, space=8 + 64 + 8 + 8)]
        pub owner: Account<'info, Ownership>,
        #[account(init, payer=user, space=8+ 64 + 8 + 8)]
        pub last_transaction_time: Account<'info, LastTransactionTime>,
        #[account(mut)]
        pub user: Signer<'info>,
        pub system_program: Program<'info, System>,
    }

    #[derive(Accounts)]
    pub struct LockLiquidity<'info> {
        #[account(mut, seeds = [b"pda_account"], bump)]
        pub pda_account: Account<'info, PDAAccount>,
        #[account(mut)]
        pub from: Account<'info, TokenAccount>,
        #[account(mut)]
        pub pda_token_account: Account<'info, TokenAccount>,
        #[account(mut)]
        pub burn_account: Account<'info, TokenAccount>,
        pub token_program: Program<'info, Token>,
    }

    #[account]
    pub struct LastTransactionTime {
        pub timestamp: i64,
    }

    #[account]
    pub struct Ownership {
        pub owner: Pubkey,
    }

    #[account]
    pub struct PDAAccount {
        pub bump: u8,
    }

    #[error_code]
    pub enum ErrorCode {
        #[msg("Cannot buy such amount, amount exceeds allowed limit!!!")]
        AmountExceedsLimit,
        #[msg("Transaction are happening too quickly, Pls wait a bit before trying again")]
        TransactionTooSoon,
    }
}
