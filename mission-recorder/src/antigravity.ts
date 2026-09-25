import { Router } from 'express';
import { prisma } from './server';

const router = Router();

// GET /api/antigravity/status
router.get('/status', async (req, res) => {
  try {
    const activeExperiment = await prisma.antiGravityExperiment.findFirst({
      where: { status: 'RUNNING' },
      orderBy: { startTime: 'desc' },
      include: {
        telemetry: { orderBy: { timestamp: 'desc' }, take: 1 }
      }
    });

    if (activeExperiment) {
      const latest = activeExperiment.telemetry[0];
      return res.json({
        active: true,
        experimentId: activeExperiment.id,
        experimentName: activeExperiment.name,
        powerDrawKw: latest ? latest.powerDrawKw : activeExperiment.powerLevel,
        coreTempC: latest ? latest.coreTempC : activeExperiment.coreTemp,
        gravMetric: latest ? latest.gravMetric : 1.0,
        stability: latest ? latest.stability : 100
      });
    }

    res.json({
      active: false,
      powerDrawKw: 0,
      coreTempC: 22,
      gravMetric: 9.81,
      stability: 100
    });
  } catch (error: any) {
    console.error('AG STATUS ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch status', details: error.message });
  }
});

// GET /api/antigravity/experiments
router.get('/experiments', async (req, res) => {
  try {
    const experiments = await prisma.antiGravityExperiment.findMany({
      orderBy: { startTime: 'desc' },
      include: {
        telemetry: { orderBy: { timestamp: 'asc' } },
        logs: { orderBy: { timestamp: 'asc' } }
      }
    });
    res.json(experiments);
  } catch (error: any) {
    console.error('AG EXP ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch experiments', details: error.message });
  }
});

// GET /api/antigravity/logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await prisma.antiGravityEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (error: any) {
    console.error('AG LOGS ERROR:', error);
    res.status(500).json({ error: 'Failed to fetch logs', details: error.message });
  }
});

let activeInterval: NodeJS.Timeout | null = null;

// POST /api/antigravity/start
router.post('/start', async (req, res) => {
  try {
    const { name, targetPower } = req.body;
    
    // Stop any existing
    await prisma.antiGravityExperiment.updateMany({
      where: { status: 'RUNNING' },
      data: { status: 'STOPPED', endTime: new Date() }
    });
    if (activeInterval) clearInterval(activeInterval);

    const exp = await prisma.antiGravityExperiment.create({
      data: {
        name: name || 'Test Run ' + Date.now(),
        status: 'RUNNING',
        powerLevel: targetPower || 100,
        coreTemp: 22,
      }
    });

    await prisma.antiGravityEvent.create({
      data: {
        experimentId: exp.id,
        eventType: 'SYSTEM',
        message: 'Experiment started: ' + exp.name,
        severity: 'INFO'
      }
    });

    let currentPower = targetPower || 100;
    let currentTemp = 22.0;
    let currentGrav = 9.81;

    activeInterval = setInterval(async () => {
      try {
        currentTemp += Math.random() * 2;
        currentGrav = Math.max(0, currentGrav - (Math.random() * 0.1));
        currentPower = currentPower + (Math.random() * 5 - 2.5);

        await prisma.antiGravityTelemetry.create({
          data: {
            experimentId: exp.id,
            powerDrawKw: currentPower,
            coreTempC: currentTemp,
            gravMetric: currentGrav,
            stability: 100 - (currentTemp > 50 ? (currentTemp - 50) : 0)
          }
        });

        if (currentTemp > 80) {
           await prisma.antiGravityEvent.create({
             data: { experimentId: exp.id, eventType: 'WARNING', message: 'Core temp exceeding 80C', severity: 'WARNING' }
           });
        }
      } catch(e) {}
    }, 2000);

    res.json(exp);
  } catch (error: any) {
    console.error('AG START ERROR:', error);
    res.status(500).json({ error: 'Failed to start experiment', details: error.message });
  }
});

// POST /api/antigravity/stop
router.post('/stop', async (req, res) => {
  try {
    const { experimentId } = req.body;
    
    if (activeInterval) clearInterval(activeInterval);

    const exp = await prisma.antiGravityExperiment.update({
      where: { id: experimentId },
      data: { status: 'COMPLETED', endTime: new Date() }
    });

    await prisma.antiGravityEvent.create({
      data: {
        experimentId: exp.id,
        eventType: 'SYSTEM',
        message: 'Experiment completed successfully.',
        severity: 'INFO'
      }
    });

    res.json(exp);
  } catch (error: any) {
    console.error('AG STOP ERROR:', error);
    res.status(500).json({ error: 'Failed to stop experiment', details: error.message });
  }
});

export default router;
