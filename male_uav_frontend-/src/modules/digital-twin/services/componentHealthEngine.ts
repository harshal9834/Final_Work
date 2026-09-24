import { TelemetryData } from '../types/telemetry';

export interface ComponentHealthStatus {
  health: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  temperature: number;
  pressure: number;
  vibration: number;
}

export function calculateComponentHealth(componentId: string, telemetry: TelemetryData, activeFaults: string[]): ComponentHealthStatus {
  let health = 100;
  let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
  
  // Base logic for each component
  let temp = 40;
  let pres = 1.0;
  let vib = telemetry.vibration;
  
  if (componentId === 'Main Engine') {
    temp = telemetry.cht;
    pres = telemetry.oilPressure;
    health = 100 - (telemetry.cht > 230 ? (telemetry.cht - 230) * 2 : 0);
  } else if (componentId === 'ECU') {
    temp = 45;
  } else if (componentId === 'Intercooler') {
    temp = telemetry.egt > 700 ? 80 : 50;
    if (activeFaults.includes('Cooling Degradation') || activeFaults.includes('Overheating')) health -= 30;
  } else if (componentId === 'Oil Tank') {
    temp = telemetry.oilTemp;
    pres = telemetry.oilPressure;
    if (activeFaults.includes('Lubrication Failure')) health -= 40;
  } else if (componentId === 'Ambient Sensor') {
    if (activeFaults.includes('Sensor Drift')) health -= 20;
  }
  
  if (activeFaults.includes('Misfire') && componentId === 'Main Engine') health -= 50;
  if (activeFaults.includes('Overheating') && componentId === 'Main Engine') health -= 40;

  health = Math.max(0, Math.min(100, health));
  
  if (health < 75) status = 'CRITICAL';
  else if (health < 90) status = 'WARNING';
  
  return { health, status, temperature: temp, pressure: pres, vibration: vib };
}
