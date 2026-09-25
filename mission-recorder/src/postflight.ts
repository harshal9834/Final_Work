import { Router } from 'express';
import { prisma } from './server';

const router = Router();

router.get('/missions', async (req, res) => {
  try {
    const missions = await prisma.missionSession.findMany({
      where: {
        status: { in: ['SUCCESS', 'FAILED', 'ABORTED'] }
      },
      orderBy: { startTime: 'desc' },
      select: { id: true, missionName: true, missionId: true, status: true, startTime: true, endTime: true, durationSeconds: true }
    });
    res.json(missions);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const session = await prisma.missionSession.findUnique({
      where: { id: req.params.id },
      include: {
        telemetryHistory: { orderBy: { timestamp: 'asc' } },
        faultHistories: { orderBy: { injectedAt: 'asc' } },
        aiInterventions: { orderBy: { timestamp: 'asc' } },
        missionEvents: { orderBy: { timestamp: 'asc' } }
      }
    });

    if (!session) return res.status(404).json({ error: 'Mission not found' });
    res.json(session);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch mission details' });
  }
});

export default router;
