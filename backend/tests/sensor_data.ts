import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { MmpSensorData } from '../target/types/mmp_sensor_data';
import { expect } from 'chai';

describe('sensor_data', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MmpSensorData as Program<MmpSensorData>;

  it('submits sensor data successfully', async () => {
    const sensorData = {
      temperature: 25.5,
      humidity: 60.0,
      co2: 400.0,
      pressure: 1013.25,
      radiation: 0.1,
    };

    const [sensorDataPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('sensor_data'), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .submitSensorData(
        new anchor.BN(sensorData.temperature * 100),
        new anchor.BN(sensorData.humidity * 100),
        new anchor.BN(sensorData.co2 * 100),
        new anchor.BN(sensorData.pressure * 100),
        new anchor.BN(sensorData.radiation * 100)
      )
      .accounts({
        sensorData: sensorDataPda,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const account = await program.account.sensorData.fetch(sensorDataPda);
    expect(account.temperature).to.equal(sensorData.temperature);
    expect(account.humidity).to.equal(sensorData.humidity);
    expect(account.co2).to.equal(sensorData.co2);
    expect(account.pressure).to.equal(sensorData.pressure);
    expect(account.radiation).to.equal(sensorData.radiation);
  });

  it('fails with invalid temperature', async () => {
    const sensorData = {
      temperature: 150.0, // Invalid temperature
      humidity: 60.0,
      co2: 400.0,
      pressure: 1013.25,
      radiation: 0.1,
    };

    const [sensorDataPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('sensor_data'), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .submitSensorData(
          new anchor.BN(sensorData.temperature * 100),
          new anchor.BN(sensorData.humidity * 100),
          new anchor.BN(sensorData.co2 * 100),
          new anchor.BN(sensorData.pressure * 100),
          new anchor.BN(sensorData.radiation * 100)
        )
        .accounts({
          sensorData: sensorDataPda,
          user: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      assert.fail('Should have failed with invalid temperature');
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.include('InvalidSensorData');
    }
  });
}); 