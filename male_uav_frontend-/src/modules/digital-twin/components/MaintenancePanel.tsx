import React from 'react';

export const MaintenancePanel: React.FC<{ actions: any[] }> = ({ actions }) => {
  if (actions.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Maintenance Advisory</h3>
      <div className="space-y-3">
        {actions.map((act, i) => (
          <div key={i} className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-amber-900">{act.action}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${act.priority === 'HIGH' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}`}>
                {act.priority}
              </span>
            </div>
            <div className="text-amber-800 text-xs">Window: {act.window} | Risk: {act.risk}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
