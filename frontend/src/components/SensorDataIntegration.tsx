import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SensorDataService } from '../services/sensorDataService';

interface SensorData {
  timestamp: number;
  temperature: number;
  humidity: number;
  co2: number;
  pressure: number;
  radiation: number;
}

export const SensorDataIntegration: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const data = await SensorDataService.getSensorData(connection, publicKey);
        setSensorData(data);
      } catch (err) {
        setError('Failed to fetch sensor data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (connection && publicKey) {
      fetchSensorData();
    }
  }, [connection, publicKey]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Environmental Sensor Data
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Temperature & Humidity
            </Typography>
            <LineChart width={800} height={400} data={sensorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#8884d8"
                name="Temperature (°C)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#82ca9d"
                name="Humidity (%)"
              />
            </LineChart>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              CO2 & Pressure
            </Typography>
            <LineChart width={800} height={400} data={sensorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="co2"
                stroke="#ffc658"
                name="CO2 (ppm)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="pressure"
                stroke="#ff7300"
                name="Pressure (hPa)"
              />
            </LineChart>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Radiation Levels
            </Typography>
            <LineChart width={800} height={400} data={sensorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="radiation"
                stroke="#ff0000"
                name="Radiation (μSv/h)"
              />
            </LineChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 