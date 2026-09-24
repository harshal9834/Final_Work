import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, Terminal, Zap, Activity,
  Wind, Cloud, Gauge, CheckCircle2,
  Play, Pause, RotateCcw, Crosshair, Radio,
  TrendingUp, ArrowRight
} from 'lucide-react';
import { useGcs } from '../contexts/GcsContext';

// Safe Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-mono">
          <AlertTriangle className="w-5 h-5 mb-2" />
          <p className="font-bold">Module Render Error</p>
          <p>{this.state.error?.toString()}</p>
        </div>
      );
    }
    return this.props.children; 
  }
}

export const MissionControlPage: React.FC = () => {
  const { 
    selectedUav, 
    mission, 
    telemetry, 
    injectFault, 
    clearFault, 
    activeFaults = [],
    isSimulationRunning = false,
    toggleSimulation,
    resetTelemetryToNormal
  } = useGcs();

  // Defensive fallback values
  const safePhase = mission?.phase ?? 'UNKNOWN';
  const safeAlt = selectedUav?.altitudeFt ?? 0;
  const safeCallsign = selectedUav?.callsign ?? 'UNKNOWN UAV';
  
  const [activePhase, setActivePhase] = useState(safePhase);
  const [targetAlt, setTargetAlt] = useState(safeAlt);
  const [engineLoad, setEngineLoad] = useState('MEDIUM');

  const [eventLog, setEventLog] = useState<{time: string, text: string}[]>([
    { time: new Date().toLocaleTimeString(), text: 'Mission Control Center Initialized' },
    { time: new Date().toLocaleTimeString(), text: `Telemetry Synced with ${safeCallsign}` }
  ]);

  const [impactRecord, setImpactRecord] = useState<{
    title: string,
    changes: {label: string, from: any, to: any}[]
  } | null>(null);

  const addEvent = (text: string) => {
    setEventLog(prev => [{ time: new Date().toLocaleTimeString(), text }, ...prev]);
  };

  const handlePhaseChange = (phase: string) => {
    setActivePhase(phase);
    addEvent(`Mission Phase Changed to ${phase}`);
    setImpactRecord({
      title: 'MISSION PHASE CHANGED',
      changes: [
        { label: 'Phase', from: activePhase ?? 'UNKNOWN', to: phase },
        { label: 'RPM target', from: telemetry?.rpm ?? 0, to: phase === 'TAKEOFF' ? 5500 : 4200 },
        { label: 'Fuel Flow', from: telemetry?.fuelFlowLitersHr ?? 0, to: phase === 'TAKEOFF' ? 38.5 : 24.2 }
      ]
    });
  };

  const handleLoadChange = (load: string) => {
    setEngineLoad(load);
    addEvent(`Engine Load Adjusted to ${load}`);
    setImpactRecord({
      title: 'ENGINE LOAD CHANGED',
      changes: [
        { label: 'Load', from: engineLoad ?? 'UNKNOWN', to: load },
        { label: 'MAP', from: telemetry?.manifoldPressureInHg ?? 0, to: load === 'MAXIMUM' ? 40.5 : 29.9 }
      ]
    });
  };

  const handleFault = (faultId: string) => {
    const isAct = activeFaults?.some(f => f.id === faultId);
    if (isAct) {
      clearFault?.(faultId);
      addEvent(`Cleared Fault: ${faultId}`);
    } else {
      injectFault?.(faultId, 80);
      addEvent(`Injected Fault: ${faultId}`);
    }
  };

  const riskScore = selectedUav?.missionRiskScore ?? 0;
  const healthIndex = selectedUav?.engineHealthIndex ?? 0;
  const isGo = riskScore < 30;

  const phases = ['GROUND IDLE', 'TAKEOFF', 'CLIMB', 'CRUISE', 'LOITER', 'DESCENT', 'LANDING'];
  const loads = ['LOW', 'MEDIUM', 'HIGH', 'MAXIMUM'];
  const faults = [
    { id: 'cylinder_overheat', label: 'Cylinder Overheat' },
    { id: 'turbo_failure', label: 'Turbocharger Failure' },
    { id: 'oil_pressure_loss', label: 'Oil Pressure Loss' },
    { id: 'injector_failure', label: 'Fuel Injector Failure' },
    { id: 'alternator_failure', label: 'Alternator Failure' },
    { id: 'sensor_drift', label: 'Sensor Drift' },
    { id: 'cooling_failure', label: 'Cooling System Failure' },
    { id: 'exhaust_restriction', label: 'Exhaust Restriction' }
  ];

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto text-gray-900 bg-slate-50 min-h-full font-sans">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
          <Terminal className="w-6 h-6 text-blue-600" />
          <h1 className="font-black text-2xl tracking-tight text-gray-900 uppercase">
            Live Simulator Command Center
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: CONTROLS (8/12) */}
          <div className="col-span-12 xl:col-span-8 space-y-6">
            
            {/* MISSION EXECUTION PANEL */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                <h2 className="font-black text-sm text-gray-800 tracking-widest uppercase flex items-center gap-2">
                  <Play className="w-4 h-4 text-blue-600" />
                  Mission Execution Phase
                </h2>
              </div>
              <div className="p-5 flex flex-wrap gap-3">
                {phases.map(phase => (
                  <button 
                    key={phase}
                    onClick={() => handlePhaseChange(phase)}
                    className={`px-5 py-2.5 rounded-lg font-black text-[11px] tracking-widest border transition-colors uppercase flex-1 min-w-[120px] ${
                      activePhase === phase 
                        ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-200' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {phase}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ENGINE LOAD CONTROL */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                  <h2 className="font-black text-sm text-gray-800 tracking-widest uppercase flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-amber-600" />
                    Engine Load Control
                  </h2>
                </div>
                <div className="p-5 flex gap-2">
                  {loads.map(load => (
                    <button 
                      key={load}
                      onClick={() => handleLoadChange(load)}
                      className={`flex-1 py-2.5 rounded font-black text-[10px] tracking-widest border transition-colors uppercase ${
                        engineLoad === load 
                          ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-200' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      {load}
                    </button>
                  ))}
                </div>
              </div>

              {/* FLIGHT CONDITION CONTROL */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                  <h2 className="font-black text-sm text-gray-800 tracking-widest uppercase flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-400" />
                    Flight Conditions
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Target Altitude</label>
                    <select 
                      value={targetAlt}
                      onChange={(e) => { setTargetAlt(Number(e.target.value)); addEvent(`Altitude changed to ${e.target.value} FT`); }}
                      className="w-full bg-gray-50 border border-gray-200 text-xs font-black p-2 rounded outline-none"
                    >
                      {[0, 5000, 10000, 15000, 22000, 25000].map(alt => (
                        <option key={alt} value={alt}>{alt} FT</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Wind Speed</label>
                    <input type="text" defaultValue="14 KTS" className="w-full bg-gray-50 border border-gray-200 text-xs font-black p-2 rounded outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* FAULT INJECTION CENTER */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-red-50 border-b border-red-100 px-5 py-3 flex items-center justify-between">
                <h2 className="font-black text-sm text-red-900 tracking-widest uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-600" />
                  Fault Injection Center
                </h2>
              </div>
              <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                {faults?.map(f => {
                  const isActive = activeFaults?.some(af => af.id === f.id);
                  return (
                    <button 
                      key={f.id}
                      onClick={() => handleFault(f.id)}
                      className={`flex flex-col items-start p-3 rounded-lg border-2 transition-colors gap-1 text-left ${
                        isActive 
                          ? 'bg-red-600 text-white border-red-700 shadow-md' 
                          : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{f.label}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-red-200' : 'text-gray-400'}`}>
                        {isActive ? '● ACTIVE (80%)' : '○ CLEARED'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* MISSION COMMANDS */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                <h2 className="font-black text-sm text-gray-800 tracking-widest uppercase flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-700" />
                  Mission Commands
                </h2>
              </div>
              <div className="p-5 flex flex-wrap gap-3">
                <button onClick={() => addEvent('Start Mission Initiated')} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded font-black text-[10px] uppercase tracking-widest border border-green-700">Start Mission</button>
                <button onClick={() => {toggleSimulation?.(); addEvent(isSimulationRunning ? 'Mission Paused' : 'Mission Resumed')}} className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 rounded font-black text-[10px] uppercase tracking-widest">{isSimulationRunning ? 'Pause Mission' : 'Resume Mission'}</button>
                <button onClick={() => addEvent('Executing Return To Base')} className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 rounded font-black text-[10px] uppercase tracking-widest">Return To Base</button>
                <button onClick={() => {resetTelemetryToNormal?.(); addEvent('Simulator Reset to Nominal')}} className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 rounded font-black text-[10px] uppercase tracking-widest">Reset Simulator</button>
                <button onClick={() => addEvent('Mission Aborted')} className="px-5 py-2.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded font-black text-[10px] uppercase tracking-widest ml-auto">Abort Mission</button>
                <button onClick={() => addEvent('Emergency Mode Activated!')} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded font-black text-[10px] uppercase tracking-widest border border-red-700">Emergency Mode</button>
              </div>
            </div>

          </div>
          
          {/* RIGHT COLUMN: STATE & LOGS (4/12) */}
          <div className="col-span-12 xl:col-span-4 space-y-6">
            
            {/* SIMULATOR STATE MONITOR */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-100 px-5 py-3">
                <h2 className="font-black text-sm text-blue-900 tracking-widest uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Simulator State Monitor
                </h2>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Phase</span>
                  <span className="text-xs font-black text-gray-900">{activePhase}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Engine Load</span>
                  <span className="text-xs font-black text-amber-600">{engineLoad}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Telemetry Rate</span>
                  <span className="text-xs font-black text-green-600">20 Hz</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Active Faults</span>
                  <span className={`text-xs font-black ${activeFaults?.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{activeFaults?.length ?? 0} DETECTED</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Engine Score</span>
                  <span className="text-xs font-black text-gray-900">{healthIndex.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">AI Status</span>
                  <span className="text-xs font-black text-blue-600">ONLINE</span>
                </div>
              </div>
            </div>

            {/* REAL-TIME IMPACT PANEL */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-[200px] flex flex-col">
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                <h2 className="font-black text-sm text-gray-800 tracking-widest uppercase flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  Real-Time Impact
                </h2>
              </div>
              <div className="p-5 flex-1 overflow-y-auto">
                {!impactRecord ? (
                  <div className="h-full flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Awaiting Command Input...
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block uppercase tracking-widest mb-3 border border-blue-200">
                      {impactRecord.title}
                    </div>
                    <div className="space-y-2">
                      {impactRecord.changes?.map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-mono">
                          <span className="text-gray-500 font-bold uppercase tracking-wide">{c.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">{c.from}</span>
                            <ArrowRight className="w-3 h-3 text-blue-500" />
                            <span className="font-black text-gray-900">{c.to}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI DECISION CENTER */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-100 px-5 py-3">
                <h2 className="font-black text-sm text-blue-900 tracking-widest uppercase flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-blue-600" />
                  AI Decision Center
                </h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Mission Success Prob</span>
                  <span className={`font-black ${isGo ? 'text-green-600' : 'text-amber-600'}`}>{(100 - riskScore).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Risk Level</span>
                  <span className={`font-black ${isGo ? 'text-green-600' : 'text-red-600'}`}>{isGo ? 'LOW' : 'HIGH'}</span>
                </div>
                <div className="mt-3 pt-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Recommended Action</span>
                  <div className={`p-2 rounded border text-[11px] font-black uppercase tracking-widest text-center ${
                    isGo ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    {isGo ? 'CONTINUE CURRENT PHASE' : 'ABORT. RETURN TO BASE.'}
                  </div>
                </div>
              </div>
            </div>

            {/* SIMULATOR EVENT LOG */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[250px]">
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                <h2 className="font-black text-sm text-gray-800 tracking-widest uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Simulator Event Log
                </h2>
              </div>
              <div className="p-4 overflow-y-auto flex-1 bg-gray-50 space-y-2 font-mono">
                {eventLog?.map((log, idx) => (
                  <div key={idx} className="flex gap-3 text-xs pb-2 border-b border-gray-200 last:border-0">
                    <span className="text-gray-400 font-bold shrink-0">{log.time}</span>
                    <span className="text-gray-800 font-semibold">{log.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
