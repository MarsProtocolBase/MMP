import React, { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

interface ExperimentData {
    id: string;
    temperature: number;
    humidity: number;
    co2Level: number;
    timestamp: number;
}

export const ExperimentDashboard: React.FC = () => {
    const [experimentData, setExperimentData] = useState<ExperimentData[]>([]);
    const { publicKey } = useWallet();
    
    useEffect(() => {
        const fetchData = async () => {
            if (!publicKey) return;
            // Fetch experiment data implementation
        };
        
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [publicKey]);

    return (
        <div className="experiment-dashboard">
            <h2>Experiment Monitoring</h2>
            <div className="metrics-grid">
                {experimentData.map(data => (
                    <div key={data.id} className="metric-card">
                        <h3>Sensor Reading</h3>
                        <p>Temperature: {data.temperature}°C</p>
                        <p>Humidity: {data.humidity}%</p>
                        <p>CO₂ Level: {data.co2Level}ppm</p>
                        <p>Time: {new Date(data.timestamp).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}; 