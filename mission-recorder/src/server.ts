import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import missionRoutes from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/missions', missionRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mission-recorder' });
});

app.listen(port, () => {
  console.log(`Mission Recorder Service running on port ${port}`);
});
