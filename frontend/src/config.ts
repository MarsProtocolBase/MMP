import { PublicKey } from '@solana/web3.js';

export const TOKEN_PROGRAM_ID = new PublicKey('MMP111111111111111111111111111111111111111');
export const GOVERNANCE_PROGRAM_ID = new PublicKey('MMPG111111111111111111111111111111111111111');
export const DATA_ACCESS_PROGRAM_ID = new PublicKey('MMPA111111111111111111111111111111111111111');

export const NETWORK = 'devnet';
export const RPC_ENDPOINT = 'https://api.devnet.solana.com';

export const TOKEN_DECIMALS = 9;
export const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens

export const VOTING_PERIOD = 86400; // 24 hours in seconds
export const MIN_PROPOSAL_TOKENS = 100_000; // 100k tokens required to create a proposal

export const ACCESS_LEVELS = {
    BASIC: 1,
    PREMIUM: 2,
    RESEARCHER: 3,
} as const;

export const ACCESS_REQUIREMENTS = {
    [ACCESS_LEVELS.BASIC]: 10_000, // 10k tokens
    [ACCESS_LEVELS.PREMIUM]: 100_000, // 100k tokens
    [ACCESS_LEVELS.RESEARCHER]: 1_000_000, // 1M tokens
} as const; 