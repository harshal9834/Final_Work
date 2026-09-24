import React from 'react';
import { ComponentHealthStatus } from '../services/componentHealthEngine';

interface Props {
  componentName: string | null;
  healthMap: Record<string, ComponentHealthStatus>;
}

export const ComponentDetails: React.FC<Props> = ({ componentName, healthMap }) => {
  if (!componentName) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center h-48 text-slate-400 text-sm">
        Select a component to view details
      </div>
    );
  }

  const stat = healthMap[componentName];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4">{componentName}</h3>
      <div className="space-y-4">
        <DetailRow label="Health" value={`${stat?.health.toFixed(1) || 100}%`} valueColor={stat?.status === 'CRITICAL' ? 'text-red-600' : stat?.status === 'WARNING' ? 'text-yellow-600' : 'text-green-600'} />
        <DetailRow label="Status" value={stat?.status || 'HEALTHY'} valueColor={stat?.status === 'CRITICAL' ? 'text-red-600' : stat?.status === 'WARNING' ? 'text-yellow-600' : 'text-green-600'} />
        <DetailRow label="Temperature" value={`${stat?.temperature.toFixed(1) || 40}°C`} />
        <DetailRow label="Pressure" value={`${stat?.pressure.toFixed(1) || 1.0} Bar`} />
        <DetailRow label="Vibration" value={`${stat?.vibration.toFixed(2) || 0} mm/s`} />
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, valueColor = "text-slate-700" }: { label: string, value: string, valueColor?: string }) => (
  <div className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className={`text-sm font-semibold font-mono ${valueColor}`}>{value}</span>
  </div>
);
