use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Token};

declare_id!("MMPG111111111111111111111111111111111111111");

#[program]
pub mod mmp_governance {
    use super::*;

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        voting_period: i64,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        proposal.title = title;
        proposal.description = description;
        proposal.creator = ctx.accounts.creator.key();
        proposal.yes_votes = 0;
        proposal.no_votes = 0;
        proposal.end_time = Clock::get()?.unix_timestamp + voting_period;
        proposal.executed = false;
        Ok(())
    }

    pub fn cast_vote(ctx: Context<CastVote>, vote: bool) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let voter_tokens = ctx.accounts.voter_token_account.amount;

        require!(
            Clock::get()?.unix_timestamp < proposal.end_time,
            ErrorCode::VotingEnded
        );

        if vote {
            proposal.yes_votes = proposal.yes_votes.checked_add(voter_tokens)
                .ok_or(ErrorCode::VoteOverflow)?;
        } else {
            proposal.no_votes = proposal.no_votes.checked_add(voter_tokens)
                .ok_or(ErrorCode::VoteOverflow)?;
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(
        init,
        payer = creator,
        space = 1000
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub voter: Signer<'info>,
    pub voter_token_account: Account<'info, TokenAccount>,
}

#[account]
pub struct Proposal {
    pub title: String,
    pub description: String,
    pub creator: Pubkey,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub end_time: i64,
    pub executed: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Voting period has ended")]
    VotingEnded,
    #[msg("Vote calculation overflow")]
    VoteOverflow,
} 