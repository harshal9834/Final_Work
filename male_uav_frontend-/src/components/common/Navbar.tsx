import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Radio, 
  Volume2, 
  VolumeX, 
  Eye, 
  Moon, 
  Sun,
  Maximize2, 
  Bell, 
  Sparkles, 
  Bot, 
  Play, 
  Pause, 
  AlertTriangle,
  RotateCcw,
  Clock,
  Compass
} from 'lucide-react';
import { useGcs } from '../../contexts/GcsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FACILITY_NAME } from '../../constants';

interface NavbarProps {
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleChat, isChatOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { 
    uavFleet, 
    selectedUav, 
    setSelectedUavId, 
    mission, 
    alerts, 
    voiceAlertsEnabled, 
    setVoiceAlertsEnabled, 
    nightVisionMode, 
    toggleNightVisionMode,
    isSimulationRunning,
    toggleSimulation,
    resetTelemetryToNormal,
    startDemoTour,
    setActiveTab
  } = useGcs();

  const [utcTime, setUtcTime] = useState<string>('');
  const [istTime, setIstTime] = useState<string>('');

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
      setIstTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
    };
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <header className={`w-full border-b transition-colors z-40 ${
      nightVisionMode 
        ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300' 
        : 'bg-white border-[#E2E8F0] text-[#0F172A]'
    } backdrop-blur-md sticky top-0 shadow-sm`}>
      {/* Top micro classification banner */}
      <div className="w-full bg-red-50 border-b border-red-100 py-0.5 px-4 flex items-center justify-between text-[11px] font-mono-code font-bold tracking-widest text-red-600">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 led-glow"></span>
          <span>RESTRICTED // DRDO-ADE // MALE UAV DIGITAL TWIN GROUND STATION // OPERATIONAL NODE 03</span>
        </div>
        <div className="flex items-center gap-4 hidden sm:flex text-[#334155] font-semibold">
          <span>SEC: CLASS-IV TOP SECRET</span>
          <span>CYBER: AES-GCM-256</span>
          <span className="text-green-800 font-bold">LINK: KU-BAND SATCOM 99.8%</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-2 flex items-center justify-between gap-3">
        {/* Left: DRDO Insignia & UAV Select */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 border-r border-[#E2E8F0] pr-3.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shadow-sm text-blue-600">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-widest text-blue-600 uppercase">DRDO | GCS-X1</span>
                <span className="px-1.5 py-0.2 bg-blue-50 border border-blue-200 rounded text-[9px] font-mono-code text-blue-700 font-semibold uppercase">
                  Digital Twin
                </span>
              </div>
              <p className="text-[10px] text-[#334155] font-mono-code font-semibold uppercase leading-tight">
                Aero Piston Twin
              </p>
            </div>
          </div>

          {/* Active UAV Selector */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2.5 py-1">
            <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono-code text-[#334155] font-bold uppercase">UAV:</span>
            <select
              value={selectedUav.id}
              onChange={(e) => setSelectedUavId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#0F172A] outline-none cursor-pointer pr-1"
            >
              {uavFleet.map((uav) => (
                <option key={uav.id} value={uav.id} className="bg-white text-[#0F172A]">
                  {uav.callsign} ({uav.engineHealthIndex.toFixed(0)}% HLT)
                </option>
              ))}
            </select>
            <span className={`w-2 h-2 rounded-full led-glow ${
              selectedUav.status === 'ACTIVE_MISSION' ? 'bg-green-500' :
              selectedUav.status === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-blue-500'
            }`} />
          </div>

          {/* Mission Tag */}
          <div className="hidden xl:flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2.5 py-1 text-xs">
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-mono-code text-[#334155] font-bold uppercase">MSN:</span>
            <span className="font-mono-code font-bold text-[#000000] text-xs">{mission.codeName.split(' - ')[0]}</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-code font-bold bg-green-100 text-green-900 border border-green-300">
              {mission.phase.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

          <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded px-3 py-1 text-xs font-mono-code">
            <div className="flex items-center gap-1.5">
              <span className="text-[#334155] text-[10px] font-bold uppercase">Engine HLT:</span>
              <span className={`font-bold ${
                selectedUav.engineHealthIndex > 80 ? 'text-green-800' :
                selectedUav.engineHealthIndex > 65 ? 'text-amber-800' : 'text-red-800'
              }`}>
                {selectedUav.engineHealthIndex.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 w-px bg-[#D1D5DB]" />
            <div className="flex items-center gap-1.5">
              <span className="text-[#334155] text-[10px] font-bold uppercase">RUL:</span>
              <span className="font-bold text-[#1E40AF]">{selectedUav.predictedRulHours} hrs</span>
            </div>
            <div className="h-3 w-px bg-[#D1D5DB]" />
            <div className="flex items-center gap-1.5">
              <span className="text-[#334155] text-[10px] font-bold uppercase">Twin Sync:</span>
              <span className="font-bold text-green-800">{selectedUav.twinConfidenceScore}%</span>
            </div>
            <div className="h-3 w-px bg-[#D1D5DB]" />
            <div className="flex items-center gap-1.5">
              <span className="text-[#334155] text-[10px] font-bold uppercase">Decision:</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                selectedUav.missionRiskScore < 25 ? 'bg-green-100 text-green-900 border border-green-300' :
                selectedUav.missionRiskScore < 60 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-red-100 text-red-900 border border-red-300'
              }`}>
                {selectedUav.missionRiskScore < 25 ? 'GO FLIGHT' : 'OBSERVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry Controls & Clocks */}
        <div className="flex items-center gap-2">
          {/* Dual Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
            <span className="text-[10px] font-bold text-[#334155] uppercase">UTC</span>
            <span className="text-xs font-mono-code font-bold text-[#000000]">{utcTime.replace(' UTC', '')}</span>
          </div>

          {/* Demo Tour Button */}
          <button
            onClick={startDemoTour}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-2.5 py-1.5 rounded shadow border border-blue-500 transition-transform active:scale-95"
            title="Launch Interactive Innovation Tour for Judges"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span className="hidden sm:inline">JUDGE TOUR</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:bg-[#EFF6FF] hover:text-blue-600 hover:border-blue-300 transition-all font-mono-code font-bold text-xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>LIGHT MODE</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#475569]" />
                <span>DARK MODE</span>
              </>
            )}
          </button>

          {/* Simulation Toggles */}
          <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded p-0.5">
            <button
              onClick={toggleSimulation}
              className={`p-1.5 rounded text-xs transition-colors ${
                isSimulationRunning ? 'text-green-600 hover:bg-[#EFF6FF]' : 'text-amber-600 bg-amber-50'
              }`}
              title={isSimulationRunning ? 'Pause live telemetry stream' : 'Resume live stream'}
            >
              {isSimulationRunning ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={resetTelemetryToNormal}
              className="p-1.5 text-[#64748B] hover:text-blue-600 hover:bg-[#EFF6FF] rounded transition-colors"
              title="Reset all engine parameters to nominal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Voice Alerts */}
          <button
            onClick={() => setVoiceAlertsEnabled(!voiceAlertsEnabled)}
            className={`p-2 rounded border transition-colors ${
              voiceAlertsEnabled 
                ? 'bg-blue-50 border-blue-200 text-blue-600' 
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8]'
            }`}
            title={voiceAlertsEnabled ? 'Acoustic Voice Alerts Enabled' : 'Voice Alerts Muted'}
          >
            {voiceAlertsEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Night Vision Toggle */}
          <button
            onClick={toggleNightVisionMode}
            className={`p-2 rounded border transition-colors hidden sm:flex ${
              nightVisionMode 
                ? 'bg-emerald-900/60 border-emerald-600 text-emerald-300' 
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-blue-600 hover:border-blue-300'
            }`}
            title="Toggle Tactical Night HUD filter"
          >
            {nightVisionMode ? <Moon className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* AI Copilot Chat */}
          <button
            onClick={onToggleChat}
            className={`p-2 rounded border transition-colors relative ${
              isChatOpen 
                ? 'bg-blue-50 border-blue-300 text-blue-600' 
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-blue-600 hover:border-blue-300'
            }`}
            title="Open AI Tactical Copilot Assistant"
          >
            <Bot className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 led-glow" />
          </button>

          {/* Alerts Bell */}
          <button
            onClick={() => setActiveTab('alerts')}
            className="p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-red-600 hover:border-red-200 relative transition-colors"
            title="Open Alarm Center"
          >
            <Bell className="w-4 h-4" />
            {unacknowledgedAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-red-600 text-white font-mono-code text-[9px] font-bold rounded-full animate-bounce">
                {unacknowledgedAlerts.length}
              </span>
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullScreen}
            className="p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-blue-600 hover:border-blue-300 transition-colors hidden md:flex"
            title="Toggle Fullscreen GCS Display"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
