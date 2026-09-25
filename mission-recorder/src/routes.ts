import { Router } from 'express';
import { prisma } from './server';

const router = Router();

// POST /api/missions/start - Start a new mission recording
router.post('/start', async (req, res) => {
  try {
    console.log('START PARAMS:', req.params);
    console.log('START BODY:', req.body);
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
    console.error('START ERROR:', error);
    res.status(500).json({ error: 'Failed to start mission', details: error.message });
  }
});

// POST /api/missions/:id/telemetry - 10Hz telemetry ingest
router.post('/:id/telemetry', async (req, res) => {
  try {
    console.log('TELEMETRY PARAMS:', req.params);
    const missionSessionId = req.params.id;
    let telemetryBatch = req.body.telemetry; 

    if (!Array.isArray(telemetryBatch)) {
      telemetryBatch = [telemetryBatch];
    }

    await prisma.telemetryHistory.createMany({
      data: telemetryBatch.map((t: any) => ({
        missionSessionId,
        timestamp: t.timestamp ? new Date(t.timestamp) : new Date(),
        latitude: t.latitude ?? 14.2384,
        longitude: t.longitude ?? 76.3982,
        altitude: t.altitude ?? 22450,
        groundSpeed: t.groundSpeed ?? 118,
        heading: t.heading ?? 0,
        rpm: t.rpm ?? 0,
        chtAvg: t.chtC ? (t.chtC.reduce((a:number,b:number)=>a+b,0)/t.chtC.length) : 0,
        egtAvg: t.egtC ? (t.egtC.reduce((a:number,b:number)=>a+b,0)/t.egtC.length) : 0,
        oilTemp: t.oilTempC ?? 0,
        oilPressure: t.oilPressureBar ?? 0,
        turboBoost: t.turboBoostBar ?? 0,
        manifoldPressure: t.manifoldPressureInHg ?? 0,
        fuelRemaining: t.fuelRemainingKg ?? 100,
        engineHealth: t.engineHealthIndex ?? 100,
        rulHours: t.predictedRulHours ?? 100,
        missionPhase: t.missionPhase ?? 'CRUISE'
      }))
    });

    res.json({ status: 'ok' });
  } catch (error: any) {
    console.error('TELEMETRY ERROR:', error);
    res.status(500).json({ error: 'Failed to ingest telemetry', details: error.message, stack: error.stack });
  }
});

// POST /api/missions/:id/event - Log a mission event
router.post('/:id/event', async (req, res) => {
  try {
    console.log('EVENT PARAMS:', req.params);
    console.log('EVENT BODY:', req.body);
    const missionSessionId = req.params.id;
    const event = await prisma.missionEvent.create({
      data: {
        missionSessionId,
        timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
        eventType: req.body.eventType ?? 'SYSTEM',
        severity: req.body.severity ?? 'INFO',
        title: req.body.title ?? 'Log Event',
        description: req.body.description ?? ''
      }
    });
    res.json(event);
  } catch (error: any) {
    console.error('EVENT ERROR:', error);
    res.status(500).json({ error: 'Failed to log event', details: error.message, stack: error.stack });
  }
});

// POST /api/missions/:id/fault - Log a fault
router.post('/:id/fault', async (req, res) => {
  try {
    console.log('FAULT PARAMS:', req.params);
    console.log('FAULT BODY:', req.body);
    const missionSessionId = req.params.id;
    const fault = await prisma.faultHistory.create({
      data: {
        missionSessionId,
        faultType: req.body.faultType ?? 'UNKNOWN_FAULT',
        severity: req.body.severity ?? 'WARNING',
        affectedSystems: req.body.affectedSystems ?? 'General',
        injectedAt: req.body.injectedAt ? new Date(req.body.injectedAt) : new Date(),
        detectedAt: req.body.detectedAt ? new Date(req.body.detectedAt) : null,
        recoveredAt: req.body.recoveredAt ? new Date(req.body.recoveredAt) : null,
        impactDescription: req.body.impactDescription ?? null,
        aiResponse: req.body.aiResponse ?? null,
        outcome: req.body.outcome ?? null
      }
    });
    res.json(fault);
  } catch (error: any) {
    console.error('FAULT ERROR:', error);
    res.status(500).json({ error: 'Failed to log fault', details: error.message, stack: error.stack });
  }
});

// POST /api/missions/:id/ai - Log AI intervention
router.post('/:id/ai', async (req, res) => {
  try {
    console.log('AI PARAMS:', req.params);
    console.log('AI BODY:', req.body);
    const missionSessionId = req.params.id;
    const ai = await prisma.aiIntervention.create({
      data: {
        missionSessionId,
        timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
        actionType: req.body.actionType ?? 'UNKNOWN_ACTION',
        reason: req.body.reason ?? 'Autonomous intervention triggered without explicit reason.',
        confidenceScore: req.body.confidenceScore ?? 100.0,
        telemetrySnapshot: req.body.telemetrySnapshot ?? '{}'
      }
    });
    res.json(ai);
  } catch (error: any) {
    console.error('AI ERROR:', error);
    res.status(500).json({ error: 'Failed to log AI intervention', details: error.message, stack: error.stack });
  }
});

// POST /api/missions/:id/end - End a mission and calculate summaries
router.post('/:id/end', async (req, res) => {
  try {
    console.log('END PARAMS:', req.params);
    console.log('END BODY:', req.body);
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

    // Generate Post Flight Analysis
    if (telemetry.length > 0) {
      const avgAlt = telemetry.reduce((sum, t) => sum + t.altitude, 0) / telemetry.length;
      const maxRpm = Math.max(...telemetry.map(t => t.rpm));
      const avgRpm = telemetry.reduce((sum, t) => sum + t.rpm, 0) / telemetry.length;
      const maxCht = Math.max(...telemetry.map(t => t.chtAvg));
      const avgCht = telemetry.reduce((sum, t) => sum + t.chtAvg, 0) / telemetry.length;
      const maxEgt = Math.max(...telemetry.map(t => t.egtAvg));
      const avgEgt = telemetry.reduce((sum, t) => sum + t.egtAvg, 0) / telemetry.length;

      await prisma.postFlightAnalysis.upsert({
        where: { missionId: missionSessionId },
        update: {
          missionDuration: durationSeconds,
          distanceCovered: totalDistance,
          averageAltitude: avgAlt,
          maximumAltitude: maxAltitude,
          averageRPM: avgRpm,
          maximumRPM: maxRpm,
          averageCHT: avgCht,
          maximumCHT: maxCht,
          averageEGT: avgEgt,
          maximumEGT: maxEgt,
          fuelConsumed: fuelConsumed || 0,
          engineHealth: telemetry[telemetry.length - 1].engineHealth,
          missionStatus: 'SUCCESS'
        },
        create: {
          missionId: missionSessionId,
          missionDuration: durationSeconds,
          distanceCovered: totalDistance,
          averageAltitude: avgAlt,
          maximumAltitude: maxAltitude,
          averageRPM: avgRpm,
          maximumRPM: maxRpm,
          averageCHT: avgCht,
          maximumCHT: maxCht,
          averageEGT: avgEgt,
          maximumEGT: maxEgt,
          fuelConsumed: fuelConsumed || 0,
          engineHealth: telemetry[telemetry.length - 1].engineHealth,
          missionStatus: 'SUCCESS'
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('END ERROR:', error);
    res.status(500).json({ error: 'Failed to end mission', details: error.message });
  }
});

// GET /api/post-flight-analysis/:missionId - Fetch analysis data
router.get('/post-flight-analysis/:missionId', async (req, res) => {
  try {
    const missionId = req.params.missionId;
    
    // Fetch analysis and session details
    const analysis = await prisma.postFlightAnalysis.findUnique({
      where: { missionId }
    });

    const session = await prisma.missionSession.findUnique({
      where: { id: missionId },
      include: {
        telemetryHistory: { orderBy: { timestamp: 'asc' } },
        missionEvents: { orderBy: { timestamp: 'asc' } }
      }
    });

    if (!session || !analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    const telemetry = session.telemetryHistory;
    
    // Build complex response as requested
    res.json({
      missionSummary: {
        missionName: session.missionName,
        missionId: session.missionId,
        missionDuration: session.durationSeconds,
        takeoffTime: session.startTime,
        landingTime: session.endTime,
        distanceCovered: analysis.distanceCovered,
        averageAltitude: analysis.averageAltitude,
        maximumAltitude: analysis.maximumAltitude,
        missionStatus: session.status,
        missionSuccess: session.status === 'SUCCESS'
      },
      flightProfile: {
        groundTime: telemetry.filter(t => t.missionPhase === 'GROUND').length * 0.1, // assuming 10Hz
        takeoffDuration: telemetry.filter(t => t.missionPhase === 'TAKEOFF').length * 0.1,
        climbDuration: telemetry.filter(t => t.missionPhase === 'CLIMB').length * 0.1,
        cruiseDuration: telemetry.filter(t => t.missionPhase === 'CRUISE').length * 0.1,
        loiterDuration: telemetry.filter(t => t.missionPhase === 'LOITER').length * 0.1,
        descentDuration: telemetry.filter(t => t.missionPhase === 'DESCENT').length * 0.1,
        landingDuration: telemetry.filter(t => t.missionPhase === 'LANDING').length * 0.1,
        events: session.missionEvents
      },
      engineAnalysis: {
        averageRPM: analysis.averageRPM,
        maximumRPM: analysis.maximumRPM,
        minimumRPM: Math.min(...telemetry.map(t => t.rpm)),
        averageCHT: analysis.averageCHT,
        maximumCHT: analysis.maximumCHT,
        averageEGT: analysis.averageEGT,
        maximumEGT: analysis.maximumEGT,
        averageOilTemperature: telemetry.reduce((sum, t) => sum + t.oilTemp, 0) / telemetry.length,
        maximumOilTemperature: Math.max(...telemetry.map(t => t.oilTemp)),
        averageOilPressure: telemetry.reduce((sum, t) => sum + t.oilPressure, 0) / telemetry.length,
        minimumOilPressure: Math.min(...telemetry.map(t => t.oilPressure)),
        engineHealth: analysis.engineHealth
      },
      fuelAnalysis: {
        startingFuel: session.initialFuelKg,
        endingFuel: session.initialFuelKg ? session.initialFuelKg - analysis.fuelConsumed : 0,
        fuelConsumed: analysis.fuelConsumed,
        averageFuelBurnRate: analysis.fuelConsumed / (analysis.missionDuration / 3600), // kg/hr
        telemetryFuel: telemetry.map(t => ({ time: t.timestamp, fuelRemaining: t.fuelRemaining }))
      },
      kpis: {
        missionDuration: session.durationSeconds,
        distanceCovered: analysis.distanceCovered,
        fuelUsed: analysis.fuelConsumed,
        maxAltitude: analysis.maximumAltitude,
        maxRPM: analysis.maximumRPM,
        engineHealth: analysis.engineHealth,
        missionStatus: session.status
      },
      charts: {
        telemetry: telemetry.map(t => ({
          time: t.timestamp,
          altitude: t.altitude,
          rpm: t.rpm,
          chtAvg: t.chtAvg,
          egtAvg: t.egtAvg,
          fuelRemaining: t.fuelRemaining
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post flight analysis' });
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
