import React from 'react';
import { 
  Shield, 
  Activity,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { useGcs } from '../../contexts/GcsContext';

interface NavbarProps {
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleChat, isChatOpen }) => {
  const { 
    selectedUav, 
    isSimulationRunning,
    toggleSimulation,
    setActiveTab,
    mission,
    alerts
  } = useGcs();

  
  const unreadCount = alerts?.filter(a => !a.acknowledged).length || 0;
  const criticalCount = alerts?.filter(a => !a.acknowledged && a.severity === 'CRITICAL').length || 0;
  const warningCount = alerts?.filter(a => !a.acknowledged && a.severity === 'WARNING').length || 0;
  const isFault = selectedUav.engineHealthIndex <= 60 || selectedUav.missionRiskScore >= 60;

  return (
    <div className="h-16 w-full bg-white border-b border-gray-200 flex items-center px-6 justify-between shadow-sm z-30 flex-shrink-0">
      
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shadow-sm">
          <Shield className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[15px] font-black text-gray-900 tracking-tight leading-tight">DRDO | GCS-X1</span>
          <span className="text-xs font-bold text-red-600 leading-tight">Aero Piston Twin</span>
        </div>
      </div>

      {/* CENTER SECTION - Operational KPIs */}
      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/80 px-5 py-1.5 gap-6 shadow-sm">
        
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-gray-800 uppercase tracking-widest leading-none flex flex-col gap-0.5">
            <span>Engine</span>
            <span>HLT:</span>
          </span>
          <span className="text-[15px] font-black leading-none tracking-tight text-gray-900">
            {selectedUav.engineHealthIndex.toFixed(1)}%
          </span>
        </div>
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-gray-800 uppercase tracking-widest leading-none">RUL:</span>
          <div className="flex flex-col items-center">
            <span className="text-[15px] font-black text-gray-900 leading-none tracking-tight">{selectedUav.predictedRulHours}</span>
            <span className="text-[8px] font-black text-gray-500 tracking-widest mt-0.5">hrs</span>
          </div>
        </div>
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-gray-800 uppercase tracking-widest leading-none flex flex-col gap-0.5">
            <span>Twin</span>
            <span>Sync:</span>
          </span>
          <span className="text-[15px] font-black text-gray-900 leading-none tracking-tight">{selectedUav.twinConfidenceScore.toFixed(1)}%</span>
        </div>
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-gray-800 uppercase tracking-widest">Decision:</span>
          <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black tracking-widest border border-green-200 uppercase">
            {selectedUav.missionRiskScore < 25 ? 'GO FLIGHT' : 'OBSERVE'}
          </div>
        </div>
        
        {isFault && (
          <>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-md text-[10px] font-black border border-red-200 flex items-center gap-1.5 uppercase shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                ALERT
              </div>
            </div>
          </>
        )}
      </div>

      {/* FAR RIGHT SECTION */}
      <div className="flex items-center gap-3">
        
        <button
          onClick={() => setActiveTab('alerts')}
          className="bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-700 px-6 py-2 rounded-lg font-black text-[11px] tracking-widest flex items-center gap-2 shadow-sm border border-gray-200 hover:border-red-200 transition-colors uppercase relative"
          title="Open Alarm Center"
        >
          <Bell className="w-4 h-4" />
          ALERTS {unreadCount > 0 && `(${unreadCount})`}
          
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full border border-red-800 animate-pulse shadow-md">
              C:${criticalCount} W:${warningCount}
            </span>
          )}
        </button>


        <button 
          onClick={() => {
            if (!isSimulationRunning) toggleSimulation();
            window.open(`http://localhost:3000/?missionId=${mission?.id || 'MIS-LIVE-001'}`, '_blank');
          }}
          className={`px-10 py-2 w-40 justify-center rounded-lg font-black text-[11px] tracking-widest flex items-center gap-2 shadow border transition-colors uppercase ${
            isSimulationRunning 
              ? 'bg-green-600 hover:bg-green-700 border-green-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 border-blue-700 text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          SIMULATOR
        </button>
      </div>
      
    </div>
  );
};
