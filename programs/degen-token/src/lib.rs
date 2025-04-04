    use anchor_lang::prelude::*;
    use anchor_spl::{
        token::{self, Mint, Token, TokenAccount, Transfer},
        associated_token::AssociatedToken,
    };

    declare_id!("EQh3ABfGEFKTYKZzwDaqb9pgEPg2n7LXYRJSMGyBTrzj");

    // Fixed target of $20,000 USD for graduation
    pub const TARGET_USD: u64 = 20_000;

    // Mock fee wallet - in production this would be your actual fee wallet
    pub const FEE_WALLET: &str = "FeeWa11etXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

    #[program]
    pub mod degen_token {
        use super::*;

        pub fn initialize_degen_token(
            ctx: Context<InitializeDegenToken>,
            name: String,
            symbol: String,
            decimals: u8,
            sol_price_usd: u64,  // Current SOL price in USD (6 decimals)
        ) -> Result<()> {
            let token_info = &mut ctx.accounts.token_info;
            token_info.authority = ctx.accounts.authority.key();
            token_info.mint = ctx.accounts.mint.key();
            token_info.name = name;
            token_info.symbol = symbol;
            token_info.decimals = decimals;
            token_info.total_supply = 0;
            token_info.total_sol_raised = 0;
            token_info.sol_price_usd = sol_price_usd;
            token_info.is_graduated = false;

            Ok(())
        }

        pub fn contribute(
            ctx: Context<Contribute>,
            amount: u64,
            sol_price_usd: u64,  // Current SOL price in USD (6 decimals)
        ) -> Result<()> {
            let token_info = &mut ctx.accounts.token_info;

            // Verify token hasn't graduated yet
            require!(!token_info.is_graduated, ErrorCode::AlreadyGraduated);

            // Update SOL price
            token_info.sol_price_usd = sol_price_usd;

            // Calculate USD value of contribution
            let contribution_usd = (amount as u128)
                .checked_mul(sol_price_usd as u128)
                .ok_or(ErrorCode::CalculationFailed)?
                .checked_div(1_000_000)  // Adjust for 6 decimals
                .ok_or(ErrorCode::CalculationFailed)? as u64;

            // Update total SOL raised
            token_info.total_sol_raised = token_info.total_sol_raised
                .checked_add(amount)
                .ok_or(ErrorCode::CalculationFailed)?;

            // Calculate total USD raised
            let total_usd = (token_info.total_sol_raised as u128)
                .checked_mul(sol_price_usd as u128)
                .ok_or(ErrorCode::CalculationFailed)?
                .checked_div(1_000_000)  // Adjust for 6 decimals
                .ok_or(ErrorCode::CalculationFailed)? as u64;

            // Check if token should graduate
            if total_usd >= TARGET_USD {
                token_info.is_graduated = true;
            }

            // Transfer SOL from contributor to token vault
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.contributor.to_account_info(),
                    to: ctx.accounts.token_vault.to_account_info(),
                },
            );
            anchor_lang::system_program::transfer(cpi_context, amount)?;

            Ok(())
        }

        pub fn transfer_with_fee(
            ctx: Context<TransferWithFee>,
            amount: u64,
        ) -> Result<()> {
            // Verify token has graduated
            require!(ctx.accounts.token_info.is_graduated, ErrorCode::NotGraduated);

            // Calculate 1% fee
            let fee_amount = amount.checked_div(100).ok_or(ErrorCode::CalculationFailed)?;
            let transfer_amount = amount.checked_sub(fee_amount).ok_or(ErrorCode::CalculationFailed)?;

            // Transfer main amount to recipient
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.from.to_account_info(),
                        to: ctx.accounts.to.to_account_info(),
                        authority: ctx.accounts.authority.to_account_info(),
                    },
                ),
                transfer_amount,
            )?;

            // Transfer fee to fee wallet
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.from.to_account_info(),
                        to: ctx.accounts.fee_account.to_account_info(),
                        authority: ctx.accounts.authority.to_account_info(),
                    },
                ),
                fee_amount,
            )?;

            Ok(())
        }
    }

    #[derive(Accounts)]
    pub struct InitializeDegenToken<'info> {
        #[account(
            init,
            payer = authority,
            space = TokenInfo::LEN,
            seeds = [b"token-info", mint.key().as_ref()],
            bump
        )]
        pub token_info: Account<'info, TokenInfo>,

        #[account(mut)]
        pub mint: Account<'info, Mint>,

        #[account(mut)]
        pub authority: Signer<'info>,

        pub system_program: Program<'info, System>,
        pub token_program: Program<'info, Token>,
        pub associated_token_program: Program<'info, AssociatedToken>,
        pub rent: Sysvar<'info, Rent>,
    }

    #[derive(Accounts)]
    pub struct Contribute<'info> {
        #[account(mut)]
        pub token_info: Account<'info, TokenInfo>,

        #[account(mut)]
        pub token_vault: SystemAccount<'info>,

        #[account(mut)]
        pub contributor: Signer<'info>,

        pub system_program: Program<'info, System>,
    }

    #[derive(Accounts)]
    pub struct TransferWithFee<'info> {
        #[account(mut)]
        pub from: Account<'info, TokenAccount>,

        #[account(mut)]
        pub to: Account<'info, TokenAccount>,

        #[account(mut)]
        pub fee_account: Account<'info, TokenAccount>,

        pub mint: Account<'info, Mint>,

        #[account(
            seeds = [b"token-info", mint.key().as_ref()],
            bump,
            has_one = mint,
        )]
        pub token_info: Account<'info, TokenInfo>,

        pub authority: Signer<'info>,
        pub token_program: Program<'info, Token>,
    }

    #[account]
    pub struct TokenInfo {
        pub authority: Pubkey,
        pub mint: Pubkey,
        pub name: String,
        pub symbol: String,
        pub decimals: u8,
        pub total_supply: u64,
        pub total_sol_raised: u64,     // Total SOL contributed
        pub sol_price_usd: u64,        // Current SOL price in USD (6 decimals)
        pub is_graduated: bool,         // Whether token has reached $20k threshold
    }

    impl TokenInfo {
        pub const LEN: usize = 8 +  // discriminator
            32 + // authority
            32 + // mint
            32 + // name string
            8 +  // symbol string
            1 +  // decimals
            8 +  // total_supply
            8 +  // total_sol_raised
            8 +  // sol_price_usd
            1;   // is_graduated
    }

    #[error_code]
    pub enum ErrorCode {
        #[msg("Calculation failed")]
        CalculationFailed,
        #[msg("Token has already graduated")]
        AlreadyGraduated,
        #[msg("Token has not graduated yet")]
        NotGraduated,
    }