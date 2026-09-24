import { Color } from 'three';

export type DigitalTwinViewMode = 'NORMAL' | 'THERMAL' | 'STRESS' | 'VIBRATION' | 'COMPONENT_HEALTH';

export function getComponentColor(componentName: string, mode: DigitalTwinViewMode, telemetry: any, activeFaults: string[], componentHealth: number): string | null {
  // Fault overrides (highest priority)
  if (mode === 'NORMAL' || mode === 'COMPONENT_HEALTH') {
    if (activeFaults.includes('Misfire') && componentName === 'Main Engine') return '#ef4444'; // Red
    if (activeFaults.includes('Overheating') && (componentName === 'Main Engine' || componentName === 'Intercooler')) return '#f97316'; // Orange
    if (activeFaults.includes('Lubrication Failure') && componentName === 'Oil Tank') return '#ef4444';
    if (activeFaults.includes('Sensor Drift') && componentName === 'Ambient Sensor') return '#eab308'; // Yellow
    if (activeFaults.includes('Cooling Degradation') && componentName === 'Intercooler') return '#f97316';
  }

  // View modes
  if (mode === 'THERMAL') {
    const temp = componentName === 'Main Engine' ? telemetry.cht : (componentName === 'Oil Tank' ? telemetry.oilTemp : 50);
    if (temp > 220) return '#ef4444';
    if (temp > 180) return '#f97316';
    if (temp > 120) return '#eab308';
    if (temp > 70) return '#22c55e';
    return '#3b82f6';
  }

  if (mode === 'STRESS') {
    const stress = telemetry.rpm > 5500 ? 'high' : (telemetry.rpm > 4500 ? 'elevated' : 'safe');
    if (stress === 'high') return '#ef4444';
    if (stress === 'elevated') return '#eab308';
    return '#22c55e';
  }

  if (mode === 'VIBRATION') {
    const vib = telemetry.vibration;
    if (vib > 4.5) return '#ef4444';
    if (vib > 3.0) return '#eab308';
    return '#8b5cf6';
  }

  if (mode === 'COMPONENT_HEALTH') {
    if (componentHealth < 75) return '#ef4444';
    if (componentHealth < 90) return '#eab308';
    return '#22c55e';
  }

  return null; // Original material color
}
