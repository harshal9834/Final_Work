import { TelemetryData } from '../types/telemetry';
import { EngineHealth } from '../types/engine';

export function calculateEngineHealth(telemetry: TelemetryData): EngineHealth {
  // Simple heuristic for phase 1 demo
  let penalty = 0;
  if (telemetry.rpm > 5500) penalty += 5;
  if (telemetry.cht > 250) penalty += 10;
  if (telemetry.oilTemp > 110) penalty += 10;
  
  const health = Math.max(0, 100 - penalty);
  
  return {
    overallHealth: health,
    status: health > 90 ? 'HEALTHY' : health > 75 ? 'WARNING' : 'CRITICAL'
  };
}
