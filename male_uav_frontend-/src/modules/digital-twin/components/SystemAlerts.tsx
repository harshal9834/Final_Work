import React from 'react';

export const SystemAlerts: React.FC<{ activeFaults: string[] }> = ({ activeFaults }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6 h-48 overflow-y-auto">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">System Alerts</h3>
      {activeFaults.length === 0 ? (
        <div className="text-sm text-slate-500">No active alerts. System operating normally.</div>
      ) : (
        <div className="space-y-2">
          {activeFaults.map((fault, i) => (
            <div key={i} className="bg-red-50 border-l-4 border-red-500 p-2 text-sm text-red-700">
              <strong>WARNING:</strong> {fault} detected!
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
