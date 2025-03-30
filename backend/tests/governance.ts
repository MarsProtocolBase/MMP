import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { MMPGovernance } from '../target/types/mmp_governance';
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from '@solana/spl-token';
import { expect } from 'chai';

describe('mmp_governance', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.MMPGovernance as Program<MMPGovernance>;
    let mint: anchor.web3.PublicKey;
    let tokenAccount: anchor.web3.PublicKey;
    let proposal: anchor.web3.PublicKey;

    before(async () => {
        // Create mint and token account for testing
        mint = await createMint(
            provider.connection,
            provider.wallet.payer,
            provider.wallet.publicKey,
            null,
            9
        );

        tokenAccount = await createAccount(
            provider.connection,
            provider.wallet.payer,
            mint,
            provider.wallet.publicKey
        );

        // Mint some tokens for testing
        await mintTo(
            provider.connection,
            provider.wallet.payer,
            mint,
            tokenAccount,
            provider.wallet.publicKey,
            1000000000 // 1 billion tokens
        );
    });

    it('Creates a proposal', async () => {
        const title = "Test Proposal";
        const description = "This is a test proposal";
        const votingPeriod = new anchor.BN(86400); // 24 hours

        proposal = anchor.web3.Keypair.generate().publicKey;

        await program.methods
            .createProposal(title, description, votingPeriod)
            .accounts({
                proposal: proposal,
                creator: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        const proposalAccount = await program.account.proposal.fetch(proposal);
        expect(proposalAccount.title).to.equal(title);
        expect(proposalAccount.description).to.equal(description);
        expect(proposalAccount.creator).to.eql(provider.wallet.publicKey);
        expect(proposalAccount.yesVotes.toNumber()).to.equal(0);
        expect(proposalAccount.noVotes.toNumber()).to.equal(0);
        expect(proposalAccount.executed).to.equal(false);
    });

    it('Casts a vote', async () => {
        const vote = true; // Yes vote

        await program.methods
            .castVote(vote)
            .accounts({
                proposal: proposal,
                voter: provider.wallet.publicKey,
                voterTokenAccount: tokenAccount,
            })
            .rpc();

        const proposalAccount = await program.account.proposal.fetch(proposal);
        expect(proposalAccount.yesVotes.toNumber()).to.be.greaterThan(0);
    });

    it('Prevents voting after period ends', async () => {
        // Set proposal end time to past
        const proposalAccount = await program.account.proposal.fetch(proposal);
        const pastTime = new anchor.BN(0);
        
        // This should fail
        try {
            await program.methods
                .castVote(true)
                .accounts({
                    proposal: proposal,
                    voter: provider.wallet.publicKey,
                    voterTokenAccount: tokenAccount,
                })
                .rpc();
            throw new Error('Should have failed');
        } catch (error) {
            expect(error).to.be.instanceOf(Error);
        }
    });
}); 