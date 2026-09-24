import React from 'react';

export const RULPanel: React.FC<{ rulData: any[] }> = ({ rulData }) => {
  const critical = rulData.filter(r => r.status !== 'HEALTHY');
  const displayData = critical.length > 0 ? critical : rulData.slice(0, 3); // Show top 3 or critical

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Remaining Useful Life (RUL)</h3>
      <div className="space-y-3">
        {displayData.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
            <div className="flex flex-col">
              <span className="font-semibold text-slate-700">{item.component}</span>
              <span className="text-xs text-slate-400">Confidence: {item.confidence}%</span>
            </div>
            <div className="flex flex-col items-end">
              <span className={`font-mono font-bold ${item.status === 'CRITICAL' ? 'text-red-600' : item.status === 'WARNING' ? 'text-yellow-600' : 'text-green-600'}`}>
                {item.rulHours} Hrs
              </span>
              <span className="text-xs text-slate-500">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
