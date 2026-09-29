import React, { useState } from 'react';
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
  
  const internalTelemetry = telemetry || {};

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
