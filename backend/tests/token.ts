import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { MMPToken } from '../target/types/mmp_token';
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from '@solana/spl-token';
import { expect } from 'chai';

describe('mmp_token', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.MMPToken as Program<MMPToken>;
    let mint: anchor.web3.PublicKey;
    let tokenAccount: anchor.web3.PublicKey;
    const totalSupply = new anchor.BN(1000000000); // 1 billion tokens

    before(async () => {
        // Create mint
        mint = await createMint(
            provider.connection,
            provider.wallet.payer,
            provider.wallet.publicKey,
            null,
            9 // 9 decimals
        );

        // Create token account
        tokenAccount = await createAccount(
            provider.connection,
            provider.wallet.payer,
            mint,
            provider.wallet.publicKey
        );
    });

    it('Initializes token with correct supply', async () => {
        await program.methods
            .initialize(totalSupply)
            .accounts({
                mint: mint,
                tokenAccount: tokenAccount,
                authority: provider.wallet.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

        const account = await provider.connection.getTokenAccountBalance(tokenAccount);
        expect(account.value.amount).to.equal(totalSupply.toString());
    });

    it('Burns tokens correctly', async () => {
        const burnAmount = new anchor.BN(1000000); // 1 million tokens

        await program.methods
            .burnTokens(burnAmount)
            .accounts({
                mint: mint,
                from: tokenAccount,
                authority: provider.wallet.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

        const account = await provider.connection.getTokenAccountBalance(tokenAccount);
        expect(account.value.amount).to.equal(totalSupply.sub(burnAmount).toString());
    });
}); 