import React from 'react';

export const AIPredictionPanel: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        AI Analysis Status
      </h3>
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center text-center">
        <span className="text-slate-500 font-medium mb-2">Waiting for AI Analytics Engine</span>
        <div className="grid grid-cols-2 gap-4 w-full text-xs mt-2 text-left">
          <div className="bg-white p-2 rounded border border-slate-200">
            <span className="text-slate-400 block mb-1">Status</span>
            <span className="font-bold text-slate-700">Connected</span>
          </div>
          <div className="bg-white p-2 rounded border border-slate-200">
            <span className="text-slate-400 block mb-1">Source</span>
            <span className="font-bold text-slate-700">Telemetry Stream</span>
          </div>
        </div>
      </div>
    </div>
  );
};
