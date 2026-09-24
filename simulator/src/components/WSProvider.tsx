'use client';
import { useEffect } from 'react';
import { simulation } from '@/simulation/SimulationLoop';
import { useTelemetryStore } from '@/stores/telemetryStore';

export default function WSProvider({ children }: { children: React.ReactNode }) {
  const connected  = useTelemetryStore((s) => s.connected);
  const packetCount = useTelemetryStore((s) => s.packetCount);

  useEffect(() => {
    simulation.start();
  }, []);

  return (
    <>
      {/* Connection status bar */}
      <div className={`px-4 py-1 text-xs flex items-center gap-2.5 border-b font-medium ${
        connected
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-red-50 border-red-200 text-red-700'
      }`}>
        <span className={`w-2 h-2 rounded-full shrink-0 ${
          connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`} />
        <span>
          {connected
            ? `BACKEND CONNECTED — ${packetCount} packets received`
            : 'BACKEND DISCONNECTED — start uvicorn on port 4000'}
        </span>
      </div>
      {children}
    </>
  );
}
