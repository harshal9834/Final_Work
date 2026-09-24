import React, { useState } from 'react';

export const MissionReplay: React.FC = () => {
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Mission Replay</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setIsPlaying(!isPlaying)} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold shadow-sm hover:bg-indigo-700">
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
        <div className="flex gap-1 bg-slate-100 p-1 rounded">
          {[1, 2, 4, 8].map(s => (
            <button key={s} onClick={() => setSpeed(s)} className={`px-2 py-1 rounded text-xs font-bold ${speed === s ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
              {s}x
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative pt-4 pb-2">
        <div className="h-2 bg-slate-200 rounded-full w-full overflow-hidden">
          <div className="h-full bg-indigo-500" style={{ width: isPlaying ? '45%' : '0%' }}></div>
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
          <span>T-00:00</span>
          <span>T+45:00</span>
          <span>T+1:30:00</span>
        </div>
      </div>
    </div>
  );
};
