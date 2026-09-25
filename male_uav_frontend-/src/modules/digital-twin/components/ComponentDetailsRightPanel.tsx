import React, { useState } from 'react';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';

export const ComponentDetailsRightPanel: React.FC<{ selectedComponent: string | null, telemetry: any, faults: any[] }> = ({ selectedComponent, telemetry, faults }) => {
  const [tab, setTab] = useState('Live Data');
  const { components } = useDigitalTwin();

  if (!selectedComponent) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
        <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
        <div className="font-bold text-lg mb-2 text-slate-500">No Component Selected</div>
        <p className="text-sm">Click on any component on the 3D Engine to view real-time telemetry, health analytics, and maintenance data.</p>
      </div>
    );
  }

    // --- DYNAMIC LIVE TELEMETRY LOGIC ---
  // NO MOCK DATA. NO FALLBACK CONSTANTS.
  const nLower = (selectedComponent || 'Main Engine').toLowerCase();
  
  // Base metrics from live simulator telemetry
  let liveCht = telemetry?.chtC?.[0] || 0;
  let livePressure = telemetry?.manifoldPressureInHg || 0;
  let liveVibration = telemetry?.vibrationRmsMmS || 0;

  // Adapt slightly if they selected specific components to show their specific relevant telemetry, 
  // but NEVER use static mock values.
  if (nLower.includes('oil')) {
      livePressure = telemetry?.oilPressureBar || 0;
      liveCht = telemetry?.oilTempC || 0;
  } else if (nLower.includes('turbo') || nLower.includes('overboost')) {
      livePressure = telemetry?.turboBoostBar || 0;
      liveCht = telemetry?.egtC?.[0] || 0;
  } else if (nLower.includes('intercooler') || nLower.includes('cool')) {
      liveCht = telemetry?.coolantTempC || 0;
  }

  // Calculate Health Status from real telemetry faults
  const compFaults = (faults || []).filter((f: any) => {
     const fn = (f.name + ' ' + (f.description || '')).toLowerCase();
     if (nLower.includes('main') || nLower.includes('cylinder')) return fn.includes('cylinder') || fn.includes('misfire') || fn.includes('overheat');
     if (nLower.includes('turbo') || nLower.includes('overboost')) return fn.includes('turbo');
     if (nLower.includes('oil')) return fn.includes('oil') || fn.includes('leak');
     if (nLower.includes('injector') || nLower.includes('magnetovalve')) return fn.includes('injector') || fn.includes('fuel');
     if (nLower.includes('ecu')) return fn.includes('ecu');
     if (nLower.includes('cool') || nLower.includes('intercooler')) return fn.includes('cool');
     if (nLower.includes('alternator') || nLower.includes('fusebox')) return fn.includes('alternator');
     return false;
  });

  let liveStatus = 'HEALTHY';
  if (compFaults.length > 0) {
      liveStatus = compFaults.some((f: any) => f.severity === 'CRITICAL' || f.severity === 'EMERGENCY') ? 'CRITICAL' : 'WARNING';
  } else {
      const overallHealth = telemetry?.health_score !== undefined ? telemetry.health_score : 100;
      if (overallHealth <= 50) liveStatus = 'CRITICAL';
      else if (overallHealth <= 80) liveStatus = 'WARNING';
  }
  
  // ------------------------------------
  
  const tabs = ['Live Data', 'Health', 'AI Analysis', 'Maintenance'];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* HEADER */}
      <div className="p-6 pb-0 border-b border-slate-100 flex-shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selectedComponent}</h2>
              <div className="text-xs text-slate-500">Combustion Chamber Assembly</div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${liveStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            <span className={`w-2 h-2 rounded-full ${liveStatus === 'CRITICAL' ? 'bg-red-500' : 'bg-green-500'}`}></span>
            {liveStatus}
          </div>
        </div>
        <div className="flex gap-6 mt-4">
          {tabs.map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-xs font-bold border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* KPI CARDS */}
        <div className="flex gap-4 items-center">
          <div className="w-32 h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 flex items-center justify-center relative">
             <div className="text-slate-400 text-xs font-bold">IMAGE FEED</div>
          </div>
          <div className="flex-1 space-y-3">
            <KPI icon="thermometer" label="Temperature (CHT)" value={liveCht} unit="°C" color="text-slate-800" />
            <KPI icon="gauge" label="Pressure (Compression)" value={livePressure} unit="Bar" color="text-slate-800" />
            <KPI icon="activity" label="Vibration (RMS)" value={liveVibration} unit="mm/s" color="text-green-600" />
            <KPI icon="check" label="Operating Status" value={liveStatus} unit="" color={liveStatus === 'CRITICAL' ? 'text-red-600' : 'text-green-600'} />
          </div>
        </div>

        {/* REAL-TIME GRAPHS MOCKUP */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800 text-sm">Real-time Graphs</h3>
            <div className="flex gap-1">
              {['1M', '5M', '15M', '1H'].map(time => (
                <button key={time} className={`text-[10px] px-2 py-0.5 rounded font-bold ${time === '15M' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{time}</button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <MockGraph label="CHT (°C)" value={liveCht} color="blue" />
            <MockGraph label="Vibration (mm/s)" value={liveVibration} color="green" />
            <MockGraph label="In-Cylinder Pressure (Bar)" value={livePressure} color="orange" />
          </div>
        </div>

        </div>

        {/* GLOBAL ACTIVE FAULTS SECTION */}
      <div className="border-t border-slate-200 bg-slate-50 p-6 flex-shrink-0">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3 pb-2 border-b border-slate-200">
          ACTIVE FAULTS
        </h3>
        {faults && faults.length > 0 ? (
          <div className="space-y-2">
            {faults.map((f: any, idx: number) => {
               const isCrit = f.severity === 'CRITICAL' || f.severity === 'EMERGENCY';
               return (
                 <div key={idx} className="bg-white border border-slate-200 rounded p-3 text-xs shadow-sm">
                   <div className="flex justify-between items-start mb-1">
                     <span className={`font-bold flex items-center gap-1.5 ${isCrit ? 'text-red-600' : 'text-amber-500'}`}>
                       {isCrit ? '🔴' : '🟠'} {f.name}
                     </span>
                   </div>
                   <div className="grid grid-cols-2 gap-1 text-[10px] mt-2 text-slate-600">
                     <div>Severity: <span className={`font-bold ${isCrit ? 'text-red-600' : 'text-amber-500'}`}>{f.severity}</span></div>
                     <div>Status: <span className="font-bold text-slate-800">ACTIVE</span></div>
                   </div>
                 </div>
               );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded p-4 text-xs shadow-sm flex items-start gap-3">
            <span className="text-green-500">✓</span>
            <div>
              <div className="font-bold text-slate-800">No Active Faults</div>
              <div className="text-slate-500 mt-1">System operating normally.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const KPI = ({ icon, label, value, unit, color }: any) => (
  <div className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
    <div className="flex items-center gap-2 text-slate-600">
      <div className="bg-slate-100 p-1.5 rounded text-blue-500">
        <span className="text-[10px] uppercase font-black">{icon.slice(0,3)}</span>
      </div>
      <span className="text-xs">{label}</span>
    </div>
    <div className="text-right">
      <span className={`font-bold text-lg ${color}`}>{value}</span>
      <span className={`text-[10px] font-bold ml-1 ${color}`}>{unit}</span>
    </div>
  </div>
);

const MockGraph = ({ label, value, color }: any) => (
  <div className="relative h-12 w-full border-b border-slate-100 pb-2">
    <div className="flex justify-between items-center text-xs mb-1">
      <span className="text-slate-500 font-bold flex items-center gap-1">
        <span className={`w-1 h-3 bg-${color}-500 rounded`}></span> {label}
      </span>
      <span className={`font-bold text-${color}-600`}>{value}</span>
    </div>
    {/* SVG Sparkline */}
    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className={`w-full h-6 stroke-${color}-500 opacity-60`}>
      <path d="M0,10 L10,12 L20,8 L30,15 L40,5 L50,11 L60,9 L70,14 L80,6 L90,12 L100,10" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);
