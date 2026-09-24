import React from 'react';

interface GaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  size?: 'sm' | 'md' | 'lg';
  decimals?: number;
  subtext?: string;
  expectedValue?: number;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  min,
  max,
  label,
  unit,
  warningThreshold,
  criticalThreshold,
  size = 'md',
  decimals = 0,
  subtext,
  expectedValue,
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  // Semicircular calculation: angle from -135° to +135° (270° sweep)
  const radius = size === 'sm' ? 38 : size === 'lg' ? 68 : 52;
  const strokeWidth = size === 'sm' ? 6 : size === 'lg' ? 10 : 8;
  const center = radius + strokeWidth + 4;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (270 / 360);
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  // Determine status color
  const isCritical = criticalThreshold !== undefined && value >= criticalThreshold;
  const isWarning = warningThreshold !== undefined && value >= warningThreshold && !isCritical;
  
  const arcColor = isCritical 
    ? '#ef4444' 
    : isWarning 
    ? '#f59e0b' 
    : '#3b82f6';

  const glowClass = isCritical 
    ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
    : isWarning 
    ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
    : 'drop-shadow-[0_0_8px_rgba(59,130,246,0.35)]';

  const diffFromExpected = expectedValue !== undefined ? value - expectedValue : null;

  return (
    <div className="flex flex-col items-center justify-center p-3.5 bg-white panel-border rounded relative overflow-hidden group hover:border-blue-300 transition-all">
      <div className="scan-line" />
      
      {/* Top Label & Status */}
      <div className="w-full flex items-center justify-between text-[11px] font-mono-code font-bold text-[#000000] uppercase tracking-widest mb-1 z-10">
        <span className="truncate font-bold text-[#000000]">{label}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shadow-sm ${
          isCritical ? 'bg-red-100 text-red-900 border-red-300' :
          isWarning  ? 'bg-amber-100 text-amber-900 border-amber-300' :
                       'bg-blue-100 text-blue-900 border-blue-300'
        }`}>
          {isCritical ? 'CRIT' : isWarning ? 'WARN' : 'NORM'}
        </span>
      </div>

      {/* SVG Arc Gauge */}
      <div className="relative flex items-center justify-center my-1 z-10">
        <svg
          width={center * 2}
          height={center * 1.6}
          viewBox={`0 0 ${center * 2} ${center * 1.8}`}
          className={`transform rotate-[135deg] ${glowClass}`}
        >
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Active Value Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arcColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Digital Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="font-mono-code font-extrabold text-2xl md:text-3xl tracking-wide text-[#000000]">
            {value.toFixed(decimals)}
          </span>
          <span className="text-[12px] font-mono-code text-[#1D4ED8] font-bold uppercase tracking-widest mt-0.5">
            {unit}
          </span>
        </div>
      </div>

      {/* Footer Details */}
      <div className="w-full flex items-center justify-between text-[11px] font-mono-code text-[#334155] mt-1 pt-1.5 border-t border-[#E2E8F0] z-10 font-bold">
        <span className="text-[#334155] font-bold">MIN: {min}</span>
        {diffFromExpected !== null && (
          <span
            className="font-extrabold"
            style={{ color: diffFromExpected > 0 ? '#15803D' : '#B91C1C' }}
          >
            Δ {diffFromExpected > 0 ? `+${diffFromExpected.toFixed(decimals)}` : diffFromExpected.toFixed(decimals)}
          </span>
        )}
        {subtext && <span className="text-[#334155] font-bold">{subtext}</span>}
        <span className="text-[#334155] font-bold">MAX: {max}</span>
      </div>
    </div>
  );
};
