import { useState, useEffect } from 'react';
import { TelemetryData } from '../types/telemetry';
import { calculateComponentHealth, ComponentHealthStatus } from '../services/componentHealthEngine';
import { ENGINE_COMPONENTS_REGISTRY } from '../constants/engineComponents';

export function useComponentHealth(telemetry: TelemetryData, activeFaults: string[]) {
  const [registry, setRegistry] = useState<Record<string, ComponentHealthStatus>>({});

  useEffect(() => {
    const newRegistry: Record<string, ComponentHealthStatus> = {};
    ENGINE_COMPONENTS_REGISTRY.forEach(comp => {
      newRegistry[comp] = calculateComponentHealth(comp, telemetry, activeFaults);
    });
    setRegistry(newRegistry);
  }, [telemetry, activeFaults]);

  return registry;
}
