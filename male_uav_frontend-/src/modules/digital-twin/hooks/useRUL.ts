import { useState, useEffect } from 'react';
import { calculateRUL } from '../services/rulEngine';
import { ENGINE_COMPONENTS_REGISTRY } from '../constants/engineComponents';

export function useRUL(telemetry: any, activeFaults: string[], healthMap: any) {
  const [rulData, setRulData] = useState<any[]>([]);

  useEffect(() => {
    const data = ENGINE_COMPONENTS_REGISTRY.map(comp => 
      calculateRUL(comp, telemetry, activeFaults, healthMap[comp]?.health || 100)
    );
    setRulData(data);
  }, [telemetry, activeFaults, healthMap]);

  return rulData;
}
