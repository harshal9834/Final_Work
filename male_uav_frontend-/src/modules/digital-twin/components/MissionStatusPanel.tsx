import React from 'react';

export const MissionStatusPanel: React.FC<{ telemetry: any }> = ({ telemetry }) => {
  const rpm = telemetry.rpm;
  let mission = "GROUND_IDLE";
  if (rpm > 5000) mission = "TAKEOFF";
  else if (rpm > 4500) mission = "CRUISE";
  
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Mission Status</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-500">Mission Phase</div>
          <div className="font-bold text-slate-800">{mission}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Engine Load</div>
          <div className="font-bold text-slate-800">{((rpm / 5800) * 100).toFixed(0)}%</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Altitude</div>
          <div className="font-bold text-slate-800">5200 m</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Environment</div>
          <div className="font-bold text-slate-800">Moderate</div>
        </div>
      </div>
    </div>
  );
};
