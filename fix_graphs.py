# -*- coding: utf-8 -*-
path_right = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\modules\digital-twin\components\ComponentDetailsRightPanel.tsx"
content_right = """import React, { useState, useEffect } from 'react';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';
import { Cpu, Thermometer, Activity, CheckCircle, Check, MoreHorizontal, Box, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';

export const ComponentDetailsRightPanel: React.FC<{ selectedComponent: string | null, telemetry: any, faults: any[] }> = ({ selectedComponent, telemetry, faults }) => {
  const [tab, setTab] = useState('Live Data');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!telemetry || Object.keys(telemetry).length === 0) return;
    
    // Map telemetry values, handling undefined safely
    const newDataPoint = {
        time: Date.now(),
        cht: telemetry.chtC?.[0] || telemetry.cht || 0,
        vib: telemetry.vibrationRmsMmS || 0,
        pres: telemetry.mapKpa ? (telemetry.mapKpa / 100).toFixed(2) : 0 // approx kPa to Bar
    };
    
    setHistory(prev => {
        const newHistory = [...prev, newDataPoint];
        if (newHistory.length > 20) return newHistory.slice(-20);
        return newHistory;
    });
  }, [telemetry]);

  // Use the latest value for the text display
  const latestData = history.length > 0 ? history[history.length - 1] : { cht: 0, vib: 0, pres: 0 };

  const displayComponent = selectedComponent || 'Turbocharger';
  const isHealthy = !faults || faults.length === 0;
  
  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Component Header Card */}
      <div className="bg-white p-4 border-b border-slate-200">
        <div className="flex justify-between items-start mb-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                 <Cpu className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                 <h3 className="font-black text-slate-900 text-lg leading-tight">{displayComponent === 'Entire Engine' ? 'Mesh001_59' : displayComponent}</h3>
                 <p className="text-[10px] text-slate-500 font-bold">{displayComponent === 'Entire Engine' ? 'Combustion Chamber Assembly' : 'Aero Engine Component'}</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1 border ${isHealthy ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div> {isHealthy ? 'HEALTHY' : 'CRITICAL'}
              </span>
              <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-4 h-4" /></button>
           </div>
        </div>

        <div className="flex gap-4 border-b border-slate-200">
           {['Live Data', 'Health', 'AI Analysis', 'Maintenance'].map(t => (
             <button 
               key={t} 
               onClick={() => setTab(t)}
               className={`text-[11px] font-bold pb-2 px-1 border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
             >
               {t}
             </button>
           ))}
        </div>
        
        {/* Component Quick Stats */}
        <div className="flex gap-4 mt-4">
           <div className="w-24 h-20 bg-slate-100 rounded-lg flex items-center justify-center p-2 shrink-0 border border-slate-200">
             <div className="flex flex-col items-center justify-center text-slate-400">
                 <Box className="w-8 h-8 mb-1" />
                 <span className="text-[8px] font-black uppercase tracking-widest">Model</span>
             </div>
           </div>
           <div className="flex-1 flex flex-col gap-2 justify-center">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-500" /> Temperature (CHT)</span>
                 <span className="text-xs font-black text-slate-900">{latestData.cht} <span className="text-[9px] text-slate-500">°C</span></span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Activity className="w-3 h-3 text-blue-500" /> Pressure (Compression)</span>
                 <span className="text-xs font-black text-slate-900">{latestData.pres} <span className="text-[9px] text-slate-500">Bar</span></span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Activity className="w-3 h-3 text-green-500" /> Vibration (RMS)</span>
                 <span className="text-xs font-black text-green-600">{latestData.vib} <span className="text-[9px] text-green-500">mm/s</span></span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><CheckCircle className={`w-3 h-3 ${isHealthy ? 'text-green-500' : 'text-red-500'}`} /> Operating Status</span>
                 <span className={`text-[10px] font-black tracking-wider ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>{isHealthy ? 'HEALTHY' : 'CRITICAL'}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Real-Time Graphs */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
         <div className="flex justify-between items-center mb-4">
           <h3 className="font-bold text-slate-800 text-sm">Real-time Graphs</h3>
           <div className="flex gap-1">
             {['1M', '5M', '15M', '1H'].map(t => (
               <button key={t} className={`text-[9px] font-bold px-2 py-1 rounded ${t === '1M' ? 'bg-[#1e293b] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{t}</button>
             ))}
           </div>
         </div>

         {/* CHT Chart */}
         <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3 shadow-sm">
            <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] font-bold text-slate-700">CHT (°C)</span>
               <span className="text-[10px] font-bold text-red-500">{latestData.cht} °C</span>
            </div>
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={history.length > 0 ? history : [{time: 0, cht: 0}]}>
                    <defs>
                      <linearGradient id="colorCht" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={['auto', 'auto']} />
                    <Area type="monotone" dataKey="cht" stroke="#ef4444" fillOpacity={1} fill="url(#colorCht)" strokeWidth={2} isAnimationActive={false} />
                 </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Vibration Chart */}
         <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3 shadow-sm">
            <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] font-bold text-slate-700">Vibration (mm/s)</span>
               <span className="text-[10px] font-bold text-blue-500">{latestData.vib} mm/s</span>
            </div>
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={history.length > 0 ? history : [{time: 0, vib: 0}]}>
                    <defs>
                      <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={['auto', 'auto']} />
                    <Area type="monotone" dataKey="vib" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVib)" strokeWidth={2} isAnimationActive={false} />
                 </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Pressure Chart */}
         <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3 shadow-sm">
            <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] font-bold text-slate-700">In-Cylinder Pressure (Bar)</span>
               <span className="text-[10px] font-bold text-green-500">{latestData.pres} Bar</span>
            </div>
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={history.length > 0 ? history : [{time: 0, pres: 0}]}>
                    <defs>
                      <linearGradient id="colorPres" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={['auto', 'auto']} />
                    <Area type="monotone" dataKey="pres" stroke="#22c55e" fillOpacity={1} fill="url(#colorPres)" strokeWidth={2} isAnimationActive={false} />
                 </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Active Faults */}
         <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-slate-800 text-sm">Active Faults</h3>
               <button className="text-[9px] font-bold text-blue-600 hover:underline">View All</button>
            </div>
            {isHealthy ? (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center gap-3">
                   <div className="w-6 h-6 bg-green-500 rounded-full flex justify-center items-center shrink-0">
                      <Check className="w-4 h-4 text-white" />
                   </div>
                   <div>
                      <h4 className="text-[11px] font-black text-green-800">No Active Faults</h4>
                      <p className="text-[9px] text-green-700 font-semibold">All parameters within safe limits.</p>
                   </div>
                </div>
            ) : (
                <div className="space-y-2">
                   {faults.map(f => (
                       <div key={f.id} className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-3">
                          <div className="w-6 h-6 bg-red-500 rounded-full flex justify-center items-center shrink-0 mt-0.5">
                             <AlertTriangle className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div>
                             <h4 className="text-[11px] font-black text-red-800 uppercase tracking-wide">{f.name || f.faultType || 'Fault Detected'}</h4>
                             <p className="text-[9px] text-red-700 font-semibold leading-relaxed mt-0.5">{f.description || 'System anomaly detected. Action required.'}</p>
                          </div>
                       </div>
                   ))}
                </div>
            )}
         </div>

      </div>
    </div>
  );
};
"""
with open(path_right, "w", encoding="utf-8") as f:
    f.write(content_right)

print("ComponentDetailsRightPanel updated.")
