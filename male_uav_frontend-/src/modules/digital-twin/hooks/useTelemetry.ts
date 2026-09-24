import { useState, useEffect } from 'react';
import { TelemetryData } from '../types/telemetry';

// Mock live telemetry generation for Phase 1
export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    rpm: 4320,
    cht: 212,
    egt: 728,
    oilTemp: 88,
    oilPressure: 4.2,
    fuelFlow: 18.6,
    battery: 95,
    vibration: 3.1,
    timestamp: Date.now()
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        rpm: 4320 + Math.random() * 50 - 25,
        cht: 212 + Math.random() * 2 - 1,
        egt: 728 + Math.random() * 10 - 5,
        oilTemp: 88 + Math.random() * 1 - 0.5,
        oilPressure: 4.2 + Math.random() * 0.1 - 0.05,
        fuelFlow: 18.6 + Math.random() * 0.5 - 0.25,
        battery: 95 - Math.random() * 0.01,
        vibration: 3.1 + Math.random() * 0.2 - 0.1,
        timestamp: Date.now()
      }));
    }, 100); // 10Hz

    return () => clearInterval(interval);
  }, []);

  return telemetry;
}
