import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Program, web3 } from '@project-serum/anchor';

interface SensorData {
    temperature: number;
    humidity: number;
    co2Level: number;
    timestamp: number;
}

interface ExperimentData {
    id: string;
    name: string;
    description: string;
    startDate: number;
    endDate: number;
    status: 'active' | 'completed' | 'failed';
    sensorData: SensorData[];
}

export class ExperimentDataService {
    private connection: Connection;
    private program: Program;
    private tokenProgramId: PublicKey;

    constructor(connection: Connection, program: Program) {
        this.connection = connection;
        this.program = program;
        this.tokenProgramId = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
    }

    async submitSensorData(
        experimentId: string,
        temperature: number,
        humidity: number,
        co2Level: number
    ): Promise<string> {
        try {
            const experimentPubkey = new PublicKey(experimentId);
            const timestamp = Math.floor(Date.now() / 1000);

            const tx = await this.program.methods
                .submitSensorData(
                    new web3.BN(timestamp),
                    new web3.BN(temperature * 100), // Store as integer with 2 decimal places
                    new web3.BN(humidity * 100),
                    new web3.BN(co2Level)
                )
                .accounts({
                    experiment: experimentPubkey,
                })
                .rpc();

            return tx;
        } catch (error) {
            console.error('Error submitting sensor data:', error);
            throw error;
        }
    }

    async verifyMilestone(experimentId: string, milestoneId: string): Promise<boolean> {
        try {
            const experimentPubkey = new PublicKey(experimentId);
            const milestonePubkey = new PublicKey(milestoneId);

            const tx = await this.program.methods
                .verifyMilestone()
                .accounts({
                    experiment: experimentPubkey,
                    milestone: milestonePubkey,
                })
                .rpc();

            return true;
        } catch (error) {
            console.error('Error verifying milestone:', error);
            return false;
        }
    }

    async fetchExperimentData(experimentId: string): Promise<ExperimentData> {
        try {
            const experimentPubkey = new PublicKey(experimentId);
            const experiment = await this.program.account.experiment.fetch(experimentPubkey);

            return {
                id: experimentId,
                name: experiment.name,
                description: experiment.description,
                startDate: experiment.startDate.toNumber(),
                endDate: experiment.endDate.toNumber(),
                status: experiment.status,
                sensorData: experiment.sensorData.map((data: any) => ({
                    temperature: data.temperature.toNumber() / 100,
                    humidity: data.humidity.toNumber() / 100,
                    co2Level: data.co2Level.toNumber(),
                    timestamp: data.timestamp.toNumber(),
                })),
            };
        } catch (error) {
            console.error('Error fetching experiment data:', error);
            throw error;
        }
    }

    async createExperiment(
        name: string,
        description: string,
        duration: number
    ): Promise<string> {
        try {
            const experimentKeypair = web3.Keypair.generate();
            const startDate = Math.floor(Date.now() / 1000);
            const endDate = startDate + duration;

            const tx = await this.program.methods
                .createExperiment(
                    name,
                    description,
                    new web3.BN(startDate),
                    new web3.BN(endDate)
                )
                .accounts({
                    experiment: experimentKeypair.publicKey,
                })
                .signers([experimentKeypair])
                .rpc();

            return experimentKeypair.publicKey.toString();
        } catch (error) {
            console.error('Error creating experiment:', error);
            throw error;
        }
    }
} 