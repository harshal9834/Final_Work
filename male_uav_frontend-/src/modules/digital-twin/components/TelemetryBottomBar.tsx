import React from 'react';

export const TelemetryBottomBar: React.FC<{telemetry: any}> = ({ telemetry }) => {
  const metrics = [
    { label: 'RPM', value: telemetry.rpm, max: 6000, unit: 'RPM', color: 'text-green-600' },
    { label: 'CHT (Avg)', value: telemetry.cht, max: 300, unit: '°C', color: 'text-green-600' },
    { label: 'EGT (Avg)', value: telemetry.egtC?.[0] || 718, max: 1000, unit: '°C', color: 'text-green-600' },
    { label: 'Oil Temp', value: telemetry.oilTempC || 92, max: 200, unit: '°C', color: 'text-green-600' },
    { label: 'Oil Pressure', value: telemetry.oilPressureBar || 4.2, max: 10, unit: 'Bar', color: 'text-green-600' },
    { label: 'Fuel Flow', value: telemetry.fuelFlowLitersHr || 28.5, max: 60, unit: 'L/hr', color: 'text-green-600' },
    { label: 'Vibration RMS', value: telemetry.vibrationRmsMmS || 2.1, max: 10, unit: 'mm/s', color: 'text-green-600' },
  ];

  return (
    <div className="flex gap-4 w-full overflow-x-auto pb-2">
      {metrics.map(m => (
        <div key={m.label} className="bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-xl flex-1 flex flex-col items-center shadow-lg min-w-[120px]">
          <span className="text-xs font-bold text-slate-500 mb-2">{m.label}</span>
          <div className="relative w-20 h-10 overflow-hidden mb-1 flex justify-center">
            {/* Semi-circle Gauge SVG */}
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={m.value > m.max * 0.8 ? '#ef4444' : '#22c55e'} strokeWidth="8" strokeDasharray={`${Math.PI * 40 * Math.min(1, m.value / m.max)} 251`} strokeLinecap="round" />
            </svg>
            <div className="absolute bottom-0 flex flex-col items-center justify-end leading-none">
              <span className={`text-xl font-black ${m.color}`}>{m.value}</span>
              <span className="text-[10px] text-slate-400 font-bold">{m.unit}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
