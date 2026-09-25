import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import missionRoutes from './routes';
import postFlightRoutes from './postflight';

dotenv.config();

const app = express();
const port = process.env.PORT || 4001;

export const prisma = new PrismaClient();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/missions', missionRoutes);
app.use('/api/postflight', postFlightRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mission-recorder' });
});

app.listen(port, () => {
  console.log(`Mission Recorder Service running on port ${port}`);
});

