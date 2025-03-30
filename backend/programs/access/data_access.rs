use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

declare_id!("MMPA111111111111111111111111111111111111111");

#[program]
pub mod mmp_data_access {
    use super::*;

    pub fn create_access_level(
        ctx: Context<CreateAccessLevel>,
        level: u8,
        required_tokens: u64,
    ) -> Result<()> {
        let access_level = &mut ctx.accounts.access_level;
        access_level.level = level;
        access_level.required_tokens = required_tokens;
        Ok(())
    }

    pub fn verify_access(ctx: Context<VerifyAccess>, required_level: u8) -> Result<()> {
        let user_tokens = ctx.accounts.user_token_account.amount;
        let access_level = &ctx.accounts.access_level;
        
        require!(
            access_level.level <= required_level &&
            user_tokens >= access_level.required_tokens,
            ErrorCode::InsufficientAccess
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateAccessLevel<'info> {
    #[account(
        init,
        payer = admin,
        space = 100
    )]
    pub access_level: Account<'info, AccessLevel>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyAccess<'info> {
    pub access_level: Account<'info, AccessLevel>,
    pub user_token_account: Account<'info, TokenAccount>,
    pub user: Signer<'info>,
}

#[account]
pub struct AccessLevel {
    pub level: u8,
    pub required_tokens: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient access level or token balance")]
    InsufficientAccess,
} 