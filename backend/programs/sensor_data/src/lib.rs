use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("MMPS111111111111111111111111111111111111111");

#[program]
pub mod mmp_sensor_data {
    use super::*;

    pub fn submit_sensor_data(
        ctx: Context<SubmitSensorData>,
        temperature: f64,
        humidity: f64,
        co2: f64,
        pressure: f64,
        radiation: f64,
    ) -> Result<()> {
        // Validate sensor data
        require!(
            temperature >= -273.15 && temperature <= 100.0,
            ErrorCode::InvalidSensorData
        );
        require!(humidity >= 0.0 && humidity <= 100.0, ErrorCode::InvalidSensorData);
        require!(co2 >= 0.0 && co2 <= 10000.0, ErrorCode::InvalidSensorData);
        require!(pressure >= 0.0 && pressure <= 2000.0, ErrorCode::InvalidSensorData);
        require!(radiation >= 0.0 && radiation <= 1000.0, ErrorCode::InvalidSensorData);

        let sensor_data = &mut ctx.accounts.sensor_data;
        sensor_data.user = ctx.accounts.user.key();
        sensor_data.timestamp = Clock::get()?.unix_timestamp;
        sensor_data.temperature = temperature;
        sensor_data.humidity = humidity;
        sensor_data.co2 = co2;
        sensor_data.pressure = pressure;
        sensor_data.radiation = radiation;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SubmitSensorData<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 8,
        seeds = [b"sensor_data", user.key().as_ref()],
        bump
    )]
    pub sensor_data: Account<'info, SensorData>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct SensorData {
    pub user: Pubkey,
    pub timestamp: i64,
    pub temperature: f64,
    pub humidity: f64,
    pub co2: f64,
    pub pressure: f64,
    pub radiation: f64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid sensor data provided")]
    InvalidSensorData,
    #[msg("Unauthorized access to sensor data")]
    UnauthorizedAccess,
} 