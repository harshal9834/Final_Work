import React, { useState } from 'react';
import { EngineViewer } from './EngineViewer';
import { ComponentDetailsRightPanel } from './ComponentDetailsRightPanel';
import { TelemetryBottomBar } from './TelemetryBottomBar';
import { DigitalTwinViewMode } from '../services/faultVisualizationEngine';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';
import { useGcs } from '../../../contexts/GcsContext';

export const TwinLayout: React.FC = () => {
  const [viewMode, setViewMode] = useState<DigitalTwinViewMode>('NORMAL');
  const { selectedComponent, setSelectedComponent } = useDigitalTwin();
  const { telemetry, activeFaults } = useGcs();
  
  const internalTelemetry = {
    ...telemetry,
    cht: telemetry?.chtC?.[0] || 212,
    rpm: telemetry?.rpm || 4320,
    timestamp: Date.now()
  };

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT PANEL: COMPONENTS */}
        <div className="w-[280px] bg-white border-r border-slate-200 shadow-xl z-20 flex flex-col h-full overflow-y-auto">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-800 sticky top-0 bg-white">COMPONENTS</div>
          <div className="p-4">
            <input type="text" placeholder="Search Component" className="w-full text-xs p-2 border border-slate-200 rounded mb-4" />
            <div className="space-y-1 text-sm font-semibold text-slate-600">
              {['Entire Engine', 'Cylinder #1', 'Cylinder #2', 'Cylinder #3', 'Cylinder #4', 'Turbocharger', 'Intercooler', 'Fuel Injectors', 'Oil System', 'Gearbox', 'Alternator', 'ECU', 'Cooling System', 'Exhaust System', 'Sensors'].map(c => (
                 <button 
                   key={c}
                   onClick={() => setSelectedComponent(c)}
                   className={`w-full text-left px-3 py-2 rounded transition-colors ${selectedComponent === c ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}
                 >
                   {c}
                 </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER 3D VIEWPORT */}
        <div className="flex-1 relative bg-gradient-to-b from-slate-50 to-slate-200">
          <EngineViewer viewMode={viewMode} setViewMode={setViewMode} />
          
          {/* BOTTOM TELEMETRY BAR */}
          <div className="absolute bottom-6 left-6 right-6">
             <TelemetryBottomBar telemetry={internalTelemetry} />
          </div>
        </div>

        {/* RIGHT PANEL: COMPONENT DETAILS */}
        <div className="w-[400px] bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col h-full">
          <ComponentDetailsRightPanel selectedComponent={selectedComponent} telemetry={internalTelemetry} faults={activeFaults} />
        </div>
        
      </div>
    </div>
  );
};
