import { Router } from 'express';
import { prisma } from './server';

const router = Router();

// POST /api/missions/start - Start a new mission recording
router.post('/start', async (req, res) => {
  try {
    const { missionName, missionId, uavId, platform, initialFuelKg, initialHealthScore, initialRulHours } = req.body;
    
    const mission = await prisma.missionSession.create({
      data: {
        missionName,
        missionId,
        uavId,
        platform,
        startTime: new Date(),
        status: 'RUNNING',
        initialFuelKg,
        initialHealthScore,
        initialRulHours
      }
    });
    
    res.json({ missionSessionId: mission.id, status: 'started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start mission' });
  }
});

// POST /api/missions/:id/telemetry - 10Hz telemetry ingest
router.post('/:id/telemetry', async (req, res) => {
  try {
    const missionSessionId = req.params.id;
    const telemetryBatch = req.body.telemetry; // Expecting an array for batching or single object

    if (Array.isArray(telemetryBatch)) {
      await prisma.telemetryHistory.createMany({
        data: telemetryBatch.map((t: any) => ({
          ...t,
          missionSessionId,
          timestamp: t.timestamp ? new Date(t.timestamp) : new Date()
        }))
      });
    } else {
      await prisma.telemetryHistory.create({
        data: {
          ...telemetryBatch,
          missionSessionId,
          timestamp: telemetryBatch.timestamp ? new Date(telemetryBatch.timestamp) : new Date()
        }
      });
    }

    res.json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ingest telemetry' });
  }
});

// POST /api/missions/:id/event - Log a mission event
router.post('/:id/event', async (req, res) => {
  try {
    const missionSessionId = req.params.id;
    const event = await prisma.missionEvent.create({
      data: {
        ...req.body,
        missionSessionId,
        timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date()
      }
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log event' });
  }
});

// POST /api/missions/:id/fault - Log a fault
router.post('/:id/fault', async (req, res) => {
  try {
    const missionSessionId = req.params.id;
    const fault = await prisma.faultHistory.create({
      data: {
        ...req.body,
        missionSessionId,
        injectedAt: req.body.injectedAt ? new Date(req.body.injectedAt) : new Date(),
        detectedAt: req.body.detectedAt ? new Date(req.body.detectedAt) : null,
        recoveredAt: req.body.recoveredAt ? new Date(req.body.recoveredAt) : null,
      }
    });
    res.json(fault);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log fault' });
  }
});

// POST /api/missions/:id/ai - Log AI intervention
router.post('/:id/ai', async (req, res) => {
  try {
    const missionSessionId = req.params.id;
    const ai = await prisma.aiIntervention.create({
      data: {
        ...req.body,
        missionSessionId,
        timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date()
      }
    });
    res.json(ai);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log AI intervention' });
  }
});

// POST /api/missions/:id/end - End a mission and calculate summaries
router.post('/:id/end', async (req, res) => {
  try {
    const missionSessionId = req.params.id;
    const endTime = new Date();

    const session = await prisma.missionSession.findUnique({
      where: { id: missionSessionId },
      include: { telemetryHistory: { orderBy: { timestamp: 'asc' } } }
    });

    if (!session) return res.status(404).json({ error: 'Mission not found' });

    const durationSeconds = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
    
    // Calculate metrics
    let maxAltitude = 0;
    let totalDistance = 0; 
    const telemetry = session.telemetryHistory;
    
    if (telemetry.length > 0) {
      maxAltitude = Math.max(...telemetry.map(t => t.altitude));
      // Simplified total distance calculation
      totalDistance = telemetry.length * 0.1; 
    }

    const finalFuel = telemetry.length > 0 ? telemetry[telemetry.length - 1].fuelRemaining : session.initialFuelKg;
    const fuelConsumed = session.initialFuelKg && finalFuel ? session.initialFuelKg - finalFuel : 0;

    const updated = await prisma.missionSession.update({
      where: { id: missionSessionId },
      data: {
        endTime,
        durationSeconds,
        status: 'SUCCESS', // Or ABORTED depending on logic
        maxAltitude,
        totalDistance,
        fuelConsumed,
        finalEngineHealth: telemetry.length > 0 ? telemetry[telemetry.length - 1].engineHealth : session.initialHealthScore,
        finalRulHours: telemetry.length > 0 ? telemetry[telemetry.length - 1].rulHours : session.initialRulHours,
        missionSuccessRate: 100 // placeholder
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to end mission' });
  }
});

// GET /api/missions/completed - List historical missions for Replay
router.get('/completed', async (req, res) => {
  try {
    const missions = await prisma.missionSession.findMany({
      where: {
        status: { in: ['SUCCESS', 'FAILED', 'ABORTED'] }
      },
      orderBy: { startTime: 'desc' }
    });
    res.json(missions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

// GET /api/missions/:id/replay - Fetch full payload for replay
router.get('/:id/replay', async (req, res) => {
  try {
    const missionSessionId = req.params.id;
    const session = await prisma.missionSession.findUnique({
      where: { id: missionSessionId },
      include: {
        telemetryHistory: { orderBy: { timestamp: 'asc' } },
        missionEvents: { orderBy: { timestamp: 'asc' } },
        faultHistories: { orderBy: { injectedAt: 'asc' } },
        aiInterventions: { orderBy: { timestamp: 'asc' } }
      }
    });

    if (!session) return res.status(404).json({ error: 'Mission not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch replay data' });
  }
});

export default router;
