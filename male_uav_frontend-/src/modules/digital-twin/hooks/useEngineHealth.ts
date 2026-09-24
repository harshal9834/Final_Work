import { useState, useEffect } from 'react';
import { TelemetryData } from '../types/telemetry';
import { calculateEngineHealth } from '../services/healthEngine';
import { EngineHealth } from '../types/engine';

export function useEngineHealth(telemetry: TelemetryData) {
  const [health, setHealth] = useState<EngineHealth>({ overallHealth: 100, status: 'HEALTHY' });

  useEffect(() => {
    setHealth(calculateEngineHealth(telemetry));
  }, [telemetry]);

  return health;
}
