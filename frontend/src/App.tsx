import React from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { ExperimentDashboard } from './components/ExperimentDashboard';
import { GovernanceInterface } from './components/GovernanceInterface';
import '@solana/wallet-adapter-react-ui/styles.css';

const App: React.FC = () => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const wallets = [new PhantomWalletAdapter()];

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <div className="app">
                        <header>
                            <h1>Mushroom Mars Protocol</h1>
                        </header>
                        <main>
                            <ExperimentDashboard />
                            <GovernanceInterface />
                        </main>
                    </div>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default App; 