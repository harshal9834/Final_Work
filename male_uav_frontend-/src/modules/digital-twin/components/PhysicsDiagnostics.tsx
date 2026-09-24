import React from 'react';

export const PhysicsDiagnostics: React.FC<{ telemetry: any }> = ({ telemetry }) => {
  const combustionEfficiency = Math.max(50, 94 - (telemetry.cht > 230 ? 10 : 0));
  const thermalEfficiency = Math.max(50, 91 - (telemetry.oilTemp > 105 ? 5 : 0));
  const cooling = Math.max(0, 100 - (telemetry.cht > 200 ? telemetry.cht - 200 : 0));
  
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Physics Diagnostics</h3>
      <div className="space-y-3">
        <DiagnosticRow label="Combustion Efficiency" value={`${combustionEfficiency.toFixed(1)}%`} />
        <DiagnosticRow label="Thermal Efficiency" value={`${thermalEfficiency.toFixed(1)}%`} />
        <DiagnosticRow label="Cooling Effectiveness" value={`${cooling.toFixed(1)}%`} />
        <DiagnosticRow label="Mechanical Load" value={`${((telemetry.rpm / 5800) * 100).toFixed(1)}%`} />
      </div>
    </div>
  );
};

const DiagnosticRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-slate-600">{label}</span>
    <span className="font-mono font-semibold text-slate-800">{value}</span>
  </div>
);
