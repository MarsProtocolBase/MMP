import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import { IDL } from '../idl/sensor_data';

export class SensorDataService {
  private static PROGRAM_ID = new PublicKey('MMPS111111111111111111111111111111111111111');

  static async getSensorData(connection: Connection, wallet: PublicKey | null): Promise<any[]> {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    const provider = new AnchorProvider(connection, window.solana, {});
    const program = new Program(IDL, this.PROGRAM_ID, provider);

    try {
      const sensorData = await program.account.sensorData.all([
        {
          memcmp: {
            offset: 8, // Discriminator offset
            bytes: wallet.toBase58(),
          },
        },
      ]);

      return sensorData.map((data) => ({
        timestamp: data.account.timestamp.toNumber(),
        temperature: data.account.temperature.toNumber(),
        humidity: data.account.humidity.toNumber(),
        co2: data.account.co2.toNumber(),
        pressure: data.account.pressure.toNumber(),
        radiation: data.account.radiation.toNumber(),
      }));
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      throw error;
    }
  }

  static async submitSensorData(
    connection: Connection,
    wallet: PublicKey | null,
    data: {
      temperature: number;
      humidity: number;
      co2: number;
      pressure: number;
      radiation: number;
    }
  ): Promise<string> {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    const provider = new AnchorProvider(connection, window.solana, {});
    const program = new Program(IDL, this.PROGRAM_ID, provider);

    try {
      const [sensorDataPda] = await PublicKey.findProgramAddress(
        [Buffer.from('sensor_data'), wallet.toBuffer()],
        this.PROGRAM_ID
      );

      const tx = await program.methods
        .submitSensorData(
          data.temperature,
          data.humidity,
          data.co2,
          data.pressure,
          data.radiation
        )
        .accounts({
          sensorData: sensorDataPda,
          user: wallet,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error submitting sensor data:', error);
      throw error;
    }
  }
} 