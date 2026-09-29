# -*- coding: utf-8 -*-
path_layout = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\modules\digital-twin\components\TwinLayout.tsx"

content_layout = """import React, { useState } from 'react';
import { EngineViewer } from './EngineViewer';
import { ComponentDetailsRightPanel } from './ComponentDetailsRightPanel';
import { TelemetryBottomBar } from './TelemetryBottomBar';
import { DigitalTwinViewMode } from '../services/faultVisualizationEngine';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';
import { useGcs } from '../../../contexts/GcsContext';
import { RotateCcw, Search, Box, RefreshCw, ZoomIn, Mountain, Navigation, Thermometer, Droplet, Clock } from 'lucide-react';

export const TwinLayout: React.FC = () => {
  const [viewMode, setViewMode] = useState<DigitalTwinViewMode>('NORMAL');
  const { selectedComponent, setSelectedComponent, explodedView, setExplodedView } = useDigitalTwin();
  const { telemetry, activeFaults } = useGcs();
  
  const internalTelemetry = {
    ...telemetry,
    cht: telemetry?.chtC?.[0] || 112.5,
    rpm: telemetry?.rpm || 5200,
    timestamp: Date.now()
  };

  return (
    <div className="h-full w-full bg-[#F8FAFC] flex flex-col font-sans overflow-hidden">
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        
        {/* CENTER 3D VIEWPORT */}
        <div className="flex-1 relative bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          
          {/* Top Header overlay */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 pointer-events-none">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-wider">3D ENGINE VIEW</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Rotax 915 iS - Turbocharged Aero Piston Engine</p>
            </div>
            
            <div className="flex gap-2 pointer-events-auto">
              <button className="px-4 py-1.5 bg-[#1e293b] text-white text-[11px] font-bold rounded shadow-sm hover:bg-slate-700">Auto Rotate</button>
              <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded shadow-sm hover:bg-slate-50" onClick={() => setSelectedComponent(null)}>Reset View</button>
              <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded shadow-sm hover:bg-slate-50" onClick={() => setExplodedView(!explodedView)}>Explode View</button>
              <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded shadow-sm hover:bg-slate-50 flex items-center gap-1"><Box className="w-3.5 h-3.5" /> Fit Engine</button>
            </div>
          </div>

          {/* Left Toolbar overlay */}
          <div className="absolute top-24 left-6 z-10 flex flex-col gap-2 pointer-events-auto shadow-sm rounded-lg overflow-hidden border border-slate-200 bg-white">
             <button className="p-2.5 bg-[#1e293b] text-white hover:bg-slate-700"><Navigation className="w-4 h-4" /></button>
             <button className="p-2.5 text-slate-600 hover:bg-slate-50 border-t border-slate-100"><RefreshCw className="w-4 h-4" /></button>
             <button className="p-2.5 text-slate-600 hover:bg-slate-50 border-t border-slate-100"><ZoomIn className="w-4 h-4" /></button>
             <button className="p-2.5 text-slate-600 hover:bg-slate-50 border-t border-slate-100"><Search className="w-4 h-4" /></button>
             <button className="p-2.5 text-slate-600 hover:bg-slate-50 border-t border-slate-100"><Box className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 w-full relative" style={{ background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)', backgroundImage: 'linear-gradient(rgba(203, 213, 225, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(203, 213, 225, 0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            <EngineViewer viewMode={viewMode} setViewMode={setViewMode} />
          </div>
          
          {/* BOTTOM TELEMETRY GAUGES overlay */}
          <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-auto">
             <TelemetryBottomBar telemetry={internalTelemetry} />
          </div>
        </div>

        {/* RIGHT PANEL: COMPONENT DETAILS & GRAPHS */}
        <div className="w-[420px] bg-white rounded-xl border border-slate-200 shadow-sm z-20 flex flex-col h-full overflow-hidden">
          <ComponentDetailsRightPanel selectedComponent={selectedComponent} telemetry={internalTelemetry} faults={activeFaults} />
        </div>
        
      </div>

      {/* ABSOLUTE BOTTOM GLOBAL BAR */}
      <div className="h-12 bg-white border-t border-slate-200 shrink-0 px-6 flex items-center justify-between text-xs">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
             <RefreshCw className="w-4 h-4 text-slate-400" />
             <div>
               <span className="text-[9px] font-bold text-slate-400 uppercase block leading-tight">Phase</span>
               <span className="font-black text-slate-800 uppercase tracking-wide">CRUISE</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Mountain className="w-4 h-4 text-slate-400" />
             <div>
               <span className="text-[9px] font-bold text-slate-400 uppercase block leading-tight">Altitude</span>
               <span className="font-black text-slate-800 tracking-wide">8,500 m</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Navigation className="w-4 h-4 text-slate-400" />
             <div>
               <span className="text-[9px] font-bold text-slate-400 uppercase block leading-tight">Airspeed</span>
               <span className="font-black text-slate-800 tracking-wide">165 km/h</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Thermometer className="w-4 h-4 text-slate-400" />
             <div>
               <span className="text-[9px] font-bold text-slate-400 uppercase block leading-tight">OAT</span>
               <span className="font-black text-slate-800 tracking-wide">12 °C</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Droplet className="w-4 h-4 text-slate-400" />
             <div>
               <span className="text-[9px] font-bold text-slate-400 uppercase block leading-tight">Fuel Remaining</span>
               <span className="font-black text-slate-800 tracking-wide">92.4 L (78%)</span>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
             <Clock className="w-4 h-4 text-slate-400" />
             <div>
               <span className="text-[9px] font-bold text-slate-400 uppercase block leading-tight">Last Update</span>
               <span className="font-black text-slate-800 tracking-wide">{new Date().toLocaleTimeString()} UTC</span>
             </div>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
"""

with open(path_layout, "w", encoding="utf-8") as f:
    f.write(content_layout)

path_bottom = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\modules\digital-twin\components\TelemetryBottomBar.tsx"
content_bottom = """import React from 'react';

export const TelemetryBottomBar: React.FC<{telemetry: any}> = ({ telemetry }) => {
  const metrics = [
    { label: 'RPM', value: telemetry.rpm || 5200, max: 6000, maxStr: '/ 6,000', color: '#ef4444' }, // Red for high RPM in screenshot
    { label: 'CHT (Avg)', value: telemetry.cht || 112.5, max: 250, maxStr: '/ 250', unit: '°C', color: '#22c55e' },
    { label: 'EGT (Avg)', value: telemetry.egtC?.[0] || 765, max: 900, maxStr: '/ 900', unit: '°C', color: '#22c55e' },
    { label: 'Oil Temp', value: telemetry.oilTempC || 106.2, max: 150, maxStr: '/ 150', unit: '°C', color: '#22c55e' },
    { label: 'Oil Pressure', value: telemetry.oilPressureBar || 4.35, max: 8, maxStr: '/ 8', unit: 'Bar', color: '#22c55e' },
    { label: 'Fuel Flow', value: telemetry.fuelFlowLitersHr || 6.4, max: 15, maxStr: '/ 15', unit: 'L/hr', color: '#22c55e' },
  ];

  return (
    <div className="flex gap-4 w-full overflow-x-auto">
      {metrics.map(m => (
        <div key={m.label} className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-xl flex-1 flex flex-col items-center shadow-md min-w-[140px]">
          <span className="text-[11px] font-bold text-slate-700 mb-2 whitespace-nowrap">{m.label}</span>
          <div className="relative w-24 h-12 overflow-hidden mb-1 flex justify-center">
            {/* Semi-circle Gauge SVG */}
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={m.color} strokeWidth="12" strokeDasharray={`${Math.PI * 40 * Math.min(1, m.value / m.max)} 251`} strokeLinecap="round" />
            </svg>
            <div className="absolute bottom-0 flex flex-col items-center justify-end leading-none">
              <span className={`text-2xl font-black text-slate-800`}>{m.value.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-col items-center mt-1">
            {m.unit && <span className="text-[10px] text-slate-500 font-bold">{m.unit}</span>}
            <span className="text-[9px] text-slate-400 font-semibold">{m.maxStr}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
"""
with open(path_bottom, "w", encoding="utf-8") as f:
    f.write(content_bottom)


path_right = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\modules\digital-twin\components\ComponentDetailsRightPanel.tsx"
content_right = """import React, { useState } from 'react';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';
import { Cpu, Thermometer, Activity, CheckCircle, Check, MoreHorizontal } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';

export const ComponentDetailsRightPanel: React.FC<{ selectedComponent: string | null, telemetry: any, faults: any[] }> = ({ selectedComponent, telemetry, faults }) => {
  const [tab, setTab] = useState('Live Data');

  // Generate some realistic looking graph data for the area charts
  const generateGraphData = (base: number, variance: number) => {
      return Array.from({length: 20}).map((_, i) => ({
          time: i,
          value: base + Math.sin(i) * variance + (Math.random() * variance * 0.5)
      }));
  };

  const chtData = generateGraphData(112.5, 5);
  const vibData = generateGraphData(2.35, 0.5);
  const presData = generateGraphData(35.8, 2);

  const displayComponent = selectedComponent || 'Turbocharger'; // fallback for demo if none selected
  
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
              <span className="bg-green-50 text-green-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1 border border-green-200">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> HEALTHY
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
           <div className="w-24 h-20 bg-slate-100 rounded-lg flex items-center justify-center p-2 shrink-0">
             <img src="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/RobotExpressive/RobotExpressive.png" alt="thumbnail" className="w-full h-full object-contain opacity-50 mix-blend-multiply" />
           </div>
           <div className="flex-1 flex flex-col gap-2 justify-center">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-500" /> Temperature (CHT)</span>
                 <span className="text-xs font-black text-slate-900">112.5 <span className="text-[9px] text-slate-500">°C</span></span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Activity className="w-3 h-3 text-blue-500" /> Pressure (Compression)</span>
                 <span className="text-xs font-black text-slate-900">35.8 <span className="text-[9px] text-slate-500">Bar</span></span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Activity className="w-3 h-3 text-green-500" /> Vibration (RMS)</span>
                 <span className="text-xs font-black text-green-600">2.35 <span className="text-[9px] text-green-500">mm/s</span></span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Operating Status</span>
                 <span className="text-[10px] font-black text-green-600 tracking-wider">HEALTHY</span>
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
               <button key={t} className={`text-[9px] font-bold px-2 py-1 rounded ${t === '15M' ? 'bg-[#1e293b] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{t}</button>
             ))}
           </div>
         </div>

         {/* CHT Chart */}
         <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3 shadow-sm">
            <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] font-bold text-slate-700">CHT (°C)</span>
               <span className="text-[10px] font-bold text-red-500">112.5 °C</span>
            </div>
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chtData}>
                    <defs>
                      <linearGradient id="colorCht" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={[90, 130]} />
                    <Area type="monotone" dataKey="value" stroke="#ef4444" fillOpacity={1} fill="url(#colorCht)" strokeWidth={2} />
                 </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Vibration Chart */}
         <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3 shadow-sm">
            <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] font-bold text-slate-700">Vibration (mm/s)</span>
               <span className="text-[10px] font-bold text-blue-500">2.35 mm/s</span>
            </div>
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={vibData}>
                    <defs>
                      <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={[0, 5]} />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVib)" strokeWidth={2} />
                 </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Pressure Chart */}
         <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3 shadow-sm">
            <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] font-bold text-slate-700">In-Cylinder Pressure (Bar)</span>
               <span className="text-[10px] font-bold text-green-500">35.8 Bar</span>
            </div>
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={presData}>
                    <defs>
                      <linearGradient id="colorPres" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={[20, 50]} />
                    <Area type="monotone" dataKey="value" stroke="#22c55e" fillOpacity={1} fill="url(#colorPres)" strokeWidth={2} />
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
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center gap-3">
               <div className="w-6 h-6 bg-green-500 rounded-full flex justify-center items-center shrink-0">
                  <Check className="w-4 h-4 text-white" />
               </div>
               <div>
                  <h4 className="text-[11px] font-black text-green-800">No Active Faults</h4>
                  <p className="text-[9px] text-green-700 font-semibold">All parameters within safe limits.</p>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};
"""
with open(path_right, "w", encoding="utf-8") as f:
    f.write(content_right)
print("Digital Twin rewritten!")
