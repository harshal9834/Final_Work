import React from 'react';
import { TelemetryData } from '../types/telemetry';

export const TelemetryPanel: React.FC<{ data: TelemetryData }> = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Live Telemetry</h3>
      <div className="grid grid-cols-2 gap-4">
        <TelemetryItem label="RPM" value={data.rpm.toFixed(0)} unit="RPM" />
        <TelemetryItem label="CHT" value={data.cht.toFixed(1)} unit="°C" />
        <TelemetryItem label="EGT" value={data.egt.toFixed(1)} unit="°C" />
        <TelemetryItem label="Oil Temp" value={data.oilTemp.toFixed(1)} unit="°C" />
        <TelemetryItem label="Oil Pressure" value={data.oilPressure.toFixed(2)} unit="Bar" />
        <TelemetryItem label="Fuel Flow" value={data.fuelFlow.toFixed(1)} unit="L/h" />
        <TelemetryItem label="Battery" value={data.battery.toFixed(1)} unit="%" />
        <TelemetryItem label="Vibration" value={data.vibration.toFixed(2)} unit="mm/s" />
      </div>
    </div>
  );
};

const TelemetryItem = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col">
    <span className="text-xs text-slate-500 mb-1">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-lg font-bold text-slate-800 font-mono">{value}</span>
      <span className="text-xs text-slate-400">{unit}</span>
    </div>
  </div>
);
