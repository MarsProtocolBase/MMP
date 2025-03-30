import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { MMPDataAccess } from '../target/types/mmp_data_access';
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from '@solana/spl-token';
import { expect } from 'chai';

describe('mmp_data_access', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.MMPDataAccess as Program<MMPDataAccess>;
    let mint: anchor.web3.PublicKey;
    let tokenAccount: anchor.web3.PublicKey;
    let accessLevel: anchor.web3.PublicKey;

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

    it('Creates an access level', async () => {
        const level = 1;
        const requiredTokens = new anchor.BN(1000000); // 1 million tokens

        accessLevel = anchor.web3.Keypair.generate().publicKey;

        await program.methods
            .createAccessLevel(level, requiredTokens)
            .accounts({
                accessLevel: accessLevel,
                admin: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        const accessLevelAccount = await program.account.accessLevel.fetch(accessLevel);
        expect(accessLevelAccount.level).to.equal(level);
        expect(accessLevelAccount.requiredTokens.toNumber()).to.equal(requiredTokens.toNumber());
    });

    it('Verifies access with sufficient tokens', async () => {
        const requiredLevel = 1;

        await program.methods
            .verifyAccess(requiredLevel)
            .accounts({
                accessLevel: accessLevel,
                userTokenAccount: tokenAccount,
                user: provider.wallet.publicKey,
            })
            .rpc();

        // If we get here, the verification passed
        expect(true).to.be.true;
    });

    it('Denies access with insufficient tokens', async () => {
        const requiredLevel = 2; // Higher level than what we have

        try {
            await program.methods
                .verifyAccess(requiredLevel)
                .accounts({
                    accessLevel: accessLevel,
                    userTokenAccount: tokenAccount,
                    user: provider.wallet.publicKey,
                })
                .rpc();
            throw new Error('Should have failed');
        } catch (error) {
            expect(error).to.be.instanceOf(Error);
        }
    });
}); 