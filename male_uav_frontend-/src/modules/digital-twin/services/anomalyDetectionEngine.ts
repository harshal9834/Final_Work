export function detectAnomalies(telemetry: any, activeFaults: string[]) {
  const anomalies = [];
  if (telemetry.cht > 230 || activeFaults.includes('Overheating')) {
    anomalies.push({
      fault: "Cooling Degradation",
      probability: 87,
      severity: "HIGH",
      confidence: 94
    });
  }
  if (telemetry.rpm > 5000 && telemetry.vibration > 4.0) {
    anomalies.push({
      fault: "Rotor Imbalance",
      probability: 65,
      severity: "MEDIUM",
      confidence: 82
    });
  }
  return anomalies;
}
