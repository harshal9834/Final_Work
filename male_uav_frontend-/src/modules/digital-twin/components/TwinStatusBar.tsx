import React, { useEffect, useState } from 'react';
import { EngineHealth } from '../types/engine';
import { calculateTwinSync } from '../services/twinSyncService';

interface Props {
  health: EngineHealth;
  telemetryTimestamp: number;
  activeFaultsCount: number;
  missionStatus: string;
}

export const TwinStatusBar: React.FC<Props> = ({ health, telemetryTimestamp, activeFaultsCount, missionStatus }) => {
  const [sync, setSync] = useState(100);

  useEffect(() => {
    setSync(calculateTwinSync(telemetryTimestamp, Date.now()));
  }, [telemetryTimestamp]);

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 w-full">
      <StatusCard label="Engine Health" value={`${health.overallHealth.toFixed(1)}%`} color={health.status === 'HEALTHY' ? 'text-green-600' : 'text-amber-500'} />
      <StatusCard label="Mission Reliability" value="96%" color="text-green-600" />
      <StatusCard label="Twin Sync" value={`${sync.toFixed(1)}%`} color="text-blue-600" />
      <StatusCard label="Fault Count" value={activeFaultsCount.toString()} color={activeFaultsCount > 0 ? "text-red-500" : "text-slate-600"} />
      <StatusCard label="Mission Status" value={missionStatus} color="text-slate-800" />
    </div>
  );
};

const StatusCard = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="flex flex-col items-center justify-center px-6 border-r border-slate-100 last:border-0 flex-1">
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</span>
    <span className={`text-2xl font-bold ${color}`}>{value}</span>
  </div>
);
