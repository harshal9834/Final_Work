import { useState, useEffect } from 'react';
import { detectAnomalies } from '../services/anomalyDetectionEngine';
import { explainAnomaly } from '../services/explainabilityEngine';

export function usePredictions(telemetry: any, activeFaults: string[]) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [explanations, setExplanations] = useState<any[]>([]);

  useEffect(() => {
    const anomalies = detectAnomalies(telemetry, activeFaults);
    setPredictions(anomalies);
    setExplanations(anomalies.map(a => explainAnomaly(a, telemetry)));
  }, [telemetry, activeFaults]);

  return { predictions, explanations };
}
