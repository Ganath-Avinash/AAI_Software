import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

import masterRoutes from './routes/masters.js';
import dashboardRoutes from './routes/dashboard.js';
import assetRoutes from './routes/assets.js';
import userRoutes from './routes/users.js';
import assignmentRoutes from './routes/assignments.js';
import vendorRoutes from './routes/vendors.js';

app.use('/api/masters', masterRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/vendors', vendorRoutes);

const PORT = process.env.PORT || 5000;

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Old inline routes removed

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
