# -*- coding: utf-8 -*-
path_bottom = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\modules\digital-twin\components\TelemetryBottomBar.tsx"
content_bottom = """import React from 'react';

export const TelemetryBottomBar: React.FC<{telemetry: any}> = ({ telemetry }) => {
  const metrics = [
    { label: 'RPM', value: telemetry?.rpm || 0, max: 6000, maxStr: '/ 6,000', color: (telemetry?.rpm || 0) > 5500 ? '#ef4444' : '#22c55e' }, 
    { label: 'CHT (Avg)', value: telemetry?.chtC?.[0] || telemetry?.cht || 0, max: 250, maxStr: '/ 250', unit: '°C', color: '#22c55e' },
    { label: 'EGT (Avg)', value: telemetry?.egtC?.[0] || 0, max: 900, maxStr: '/ 900', unit: '°C', color: '#22c55e' },
    { label: 'Oil Temp', value: telemetry?.oilTempC || 0, max: 150, maxStr: '/ 150', unit: '°C', color: '#22c55e' },
    { label: 'Oil Pressure', value: telemetry?.oilPressureBar || 0, max: 8, maxStr: '/ 8', unit: 'Bar', color: '#22c55e' },
    { label: 'Fuel Flow', value: telemetry?.fuelFlowLitersHr || 0, max: 15, maxStr: '/ 15', unit: 'L/hr', color: '#22c55e' },
  ];

  return (
    <div className="flex gap-4 w-full overflow-x-auto">
      {metrics.map(m => (
        <div key={m.label} className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-xl flex-1 flex flex-col items-center shadow-md min-w-[140px]">
          <span className="text-[11px] font-bold text-slate-700 mb-2 whitespace-nowrap">{m.label}</span>
          <div className="relative w-24 h-12 overflow-hidden mb-1 flex justify-center">
            {/* Semi-circle Gauge SVG */}
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={m.color} strokeWidth="12" strokeDasharray={`${Math.PI * 40 * Math.min(1, m.value / m.max)} 251`} strokeLinecap="round" />
            </svg>
            <div className="absolute bottom-0 flex flex-col items-center justify-end leading-none">
              <span className={`text-2xl font-black text-slate-800`}>
                {typeof m.value === 'number' ? (m.value % 1 !== 0 ? m.value.toFixed(1) : m.value.toLocaleString()) : 0}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center mt-1">
            {m.unit && <span className="text-[10px] text-slate-500 font-bold">{m.unit}</span>}
            <span className="text-[9px] text-slate-400 font-semibold">{m.maxStr}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
"""
with open(path_bottom, "w", encoding="utf-8") as f:
    f.write(content_bottom)

path_layout = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\modules\digital-twin\components\TwinLayout.tsx"
with open(path_layout, "r", encoding="utf-8") as f:
    layout_code = f.read()

import re
# Replace the internalTelemetry block
layout_code = re.sub(
    r"const internalTelemetry = \{[\s\S]*?\};\n",
    r"const internalTelemetry = telemetry || {};\n",
    layout_code
)

with open(path_layout, "w", encoding="utf-8") as f:
    f.write(layout_code)

print("TelemetryBottomBar and TwinLayout updated.")
