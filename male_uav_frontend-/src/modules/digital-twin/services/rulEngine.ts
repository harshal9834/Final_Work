export function calculateRUL(component: string, telemetry: any, activeFaults: string[], health: number) {
  let baseRUL = 2000; // base 2000 hours
  if (component === 'Transmission') baseRUL = 1000;
  if (component === 'Intercooler') baseRUL = 1500;
  
  // Degrade based on health
  const rul = (health / 100) * baseRUL;
  const confidence = Math.max(60, health - (activeFaults.length * 10));
  
  return {
    component,
    rulHours: Math.max(0, Math.round(rul)),
    confidence: Math.round(confidence),
    status: rul < 200 ? 'CRITICAL' : rul < 500 ? 'WARNING' : 'HEALTHY'
  };
}
