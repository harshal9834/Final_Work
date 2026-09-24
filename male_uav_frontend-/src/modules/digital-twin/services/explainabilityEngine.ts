export function explainAnomaly(anomaly: any, telemetry: any) {
  if (anomaly.fault === 'Cooling Degradation') {
    return {
      prediction: "Overheating Risk",
      reason: "Sustained high CHT beyond nominal limits combined with degraded thermal dissipation.",
      parameters: ["CHT", "EGT", "Cooling Efficiency"],
      confidence: anomaly.confidence
    };
  }
  return {
    prediction: anomaly.fault,
    reason: "Pattern matches historical degradation signatures.",
    parameters: ["Vibration", "RPM"],
    confidence: anomaly.confidence
  };
}
