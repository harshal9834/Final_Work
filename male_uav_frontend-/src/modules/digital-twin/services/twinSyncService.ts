export function calculateTwinSync(telemetryTimestamp: number, twinUpdateTimestamp: number): number {
  const diff = Math.abs(telemetryTimestamp - twinUpdateTimestamp);
  // Assume perfectly in sync if diff < 50ms. 
  // For Phase 1 demo, we simulate a 98-100% sync rate
  const sync = 100 - (diff / 100);
  return Math.max(95, Math.min(100, sync)); // Keep it realistic between 95 and 100 for the demo
}
