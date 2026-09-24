import React from 'react';

export const SystemStatus: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">System Status</h3>
      <div className="space-y-2">
        <StatusItem label="Telemetry Connected" active />
        <StatusItem label="Twin Active" active />
        <StatusItem label="Data Stream Healthy" active />
        <StatusItem label="Component Registry Loaded" active />
        <StatusItem label="3D Model Loaded" active />
      </div>
    </div>
  );
};

const StatusItem = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-600">{label}</span>
    <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
  </div>
);
