const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const sessions = await prisma.missionSession.count();
  const telemetry = await prisma.telemetryHistory.count();
  const events = await prisma.missionEvent.count();
  const faults = await prisma.faultHistory.count();
  const ais = await prisma.aiIntervention.count();
  console.log(JSON.stringify({ sessions, telemetry, events, faults, ais }, null, 2));
  
  const comp = await prisma.missionSession.findMany({ where: { status: 'SUCCESS' } });
  console.log('Completed missions:', comp.length);
}
main().finally(() => prisma.$disconnect());
