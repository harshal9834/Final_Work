import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, Rewind, FastForward, Activity, 
  MapPin, Clock, AlertTriangle, FileText, Download, 
  Settings, Zap, Cpu, TrendingUp, Compass, ChevronDown,
  Navigation, Crosshair, CheckCircle, BrainCircuit, List
} from 'lucide-react';
import { useGcs } from '../contexts/GcsContext';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_SIMULATOR_URL + '/api/missions';

const EmptyReplayState = () => (
  <div className="flex flex-col items-center justify-center h-full p-12 text-slate-500">
    <Activity className="w-12 h-12 mb-4 text-slate-300" />
    <h2 className="text-lg font-black uppercase tracking-widest text-slate-700">No Mission Data Available</h2>
    <p className="text-xs uppercase tracking-widest mt-2">Please select a completed mission to replay.</p>
  </div>
);

export const MissionReplayPage: React.FC = () => {
  const { selectedUav, setActiveTab } = useGcs();
  
  // Data State
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [replayData, setReplayData] = useState<any>(null);
  
  // Replay State
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSec, setTimeSec] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [duration, setDuration] = useState(0);

  // Fetch Missions
  useEffect(() => {
    fetch(`${API_BASE_URL}/completed`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMissions(data);
        } else {
          setMissions([]);
          console.error("API did not return an array:", data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch missions", err);
        setMissions([]);
      });
  }, []);

  // Fetch Replay Data
  useEffect(() => {
    if (selectedMissionId) {
      fetch(`${API_BASE_URL}/${selectedMissionId}/replay`)
        .then(res => res.json())
        .then(data => {
          setReplayData(data);
          setDuration(data.durationSeconds || 0);
          setTimeSec(0);
          setIsPlaying(false);
        })
        .catch(err => console.error("Failed to fetch replay data", err));
    }
  }, [selectedMissionId]);

  // Playback Engine
  useEffect(() => {
    let interval: any;
    if (isPlaying && duration > 0) {
      interval = setInterval(() => {
        setTimeSec(prev => {
          if (prev >= duration) { setIsPlaying(false); return duration; }
          return prev + (1 * speed);
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, duration]);

  if (!selectedUav) {
    return <EmptyReplayState />;
  }

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const progress = duration > 0 ? (timeSec / duration) * 100 : 0;

  // Render Mission Selector
  if (!replayData) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-black mb-6">SELECT A MISSION TO REPLAY</h2>
        <div className="flex flex-col gap-2 items-center">
          {missions.map(m => (
            <button 
              key={m.id} 
              onClick={() => setSelectedMissionId(m.id)}
              className="px-6 py-3 border border-slate-300 hover:bg-slate-50 w-full max-w-md text-left"
            >
              <div className="font-bold">{m.missionName}</div>
              <div className="text-xs text-slate-500">{m.missionId} | {new Date(m.startTime).toLocaleString()}</div>
            </button>
          ))}
          {missions.length === 0 && <p className="text-sm text-slate-500">No completed missions found.</p>}
        </div>
      </div>
    );
  }

  // Filter telemetry up to current time
  const currentTelemetry = replayData.telemetryHistory?.filter((t: any) => {
    const tSec = (new Date(t.timestamp).getTime() - new Date(replayData.startTime).getTime()) / 1000;
    return tSec <= timeSec;
  }) || [];

  const activeEventIndex = replayData.missionEvents?.findIndex((e: any) => {
    const eSec = (new Date(e.timestamp).getTime() - new Date(replayData.startTime).getTime()) / 1000;
    return eSec > timeSec;
  }) ?? -1;

  const currentEvents = replayData.missionEvents?.filter((e: any) => {
    const eSec = (new Date(e.timestamp).getTime() - new Date(replayData.startTime).getTime()) / 1000;
    return eSec <= timeSec;
  }) || [];

  const currentFault = replayData.faultHistories?.find((f: any) => {
    const inSec = (new Date(f.injectedAt).getTime() - new Date(replayData.startTime).getTime()) / 1000;
    const recSec = f.recoveredAt ? (new Date(f.recoveredAt).getTime() - new Date(replayData.startTime).getTime()) / 1000 : Infinity;
    return timeSec >= inSec && timeSec <= recSec;
  });

  const currentAi = replayData.aiInterventions?.find((a: any) => {
    const aSec = (new Date(a.timestamp).getTime() - new Date(replayData.startTime).getTime()) / 1000;
    return timeSec >= aSec && timeSec < aSec + 60; // Show for 60s
  });

  const safeCallsign = selectedUav?.callsign ?? 'TAPAS-BH-201';

  return (
    <div className="p-4 md:p-6 bg-white min-h-full font-sans text-slate-900 space-y-4 max-w-[1920px] mx-auto" 
         style={{ backgroundImage: 'linear-gradient(rgba(226, 232, 240, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(226, 232, 240, 0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      
      {/* PAGE TITLE */}
      <div className="border-b border-slate-300 pb-2 mb-4">
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" /> MISSION REPLAY & FLIGHT INVESTIGATION CENTER
        </h1>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Replay, Analyze and Reconstruct Historical UAV Missions</p>
      </div>

      {/* TOP HEADER SECTION */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white border border-slate-300 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Mission Name</span>
            <span className="text-sm font-black text-slate-900 uppercase">{replayData.missionName}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Mission ID</span>
            <span className="text-sm font-black text-slate-900 font-mono">{replayData.missionId}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">UAV</span>
            <span className="text-sm font-black text-slate-900 uppercase">{replayData.uavId}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Mission Date</span>
            <span className="text-sm font-black text-slate-900 uppercase">{new Date(replayData.startTime).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Duration</span>
            <span className="text-sm font-black text-slate-900 uppercase">{formatTime(replayData.durationSeconds || 0)}</span>
          </div>
          <div className="border-l border-slate-300 pl-8">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Status</span>
            <span className={`text-sm font-black uppercase ${replayData.status === 'SUCCESS' ? 'text-green-700' : 'text-red-700'}`}>
              {replayData.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4 xl:mt-0">
          <button onClick={() => setReplayData(null)} className="px-4 py-1.5 border border-slate-300 hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-700">Select Mission</button>
          <button onClick={() => setActiveTab('post-flight-analysis')} className="px-4 py-1.5 border border-blue-500 bg-blue-50 hover:bg-blue-100 text-[10px] font-black uppercase tracking-widest text-blue-700 flex items-center gap-1"><FileText className="w-3 h-3" /> Post Flight Analysis</button>
          <button className="px-4 py-1.5 border border-slate-300 hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-1"><Download className="w-3 h-3" /> Export</button>
        </div>
      </div>

      {/* PLAYBACK CONTROL BAR */}
      <div className="bg-white border border-slate-300 p-4 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-1">
          <button onClick={() => setTimeSec(Math.max(0, timeSec - 300))} className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"><Rewind className="w-3.5 h-3.5" /> Prev</button>
          <button onClick={() => setIsPlaying(!isPlaying)} className={`p-2 border hover:bg-slate-50 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest w-20 justify-center ${isPlaying ? 'border-amber-500 text-amber-700' : 'border-blue-500 text-blue-700'}`}>
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />} {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>
          <button onClick={() => {setIsPlaying(false); setTimeSec(0);}} className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"><Square className="w-3.5 h-3.5" /> Stop</button>
          <button onClick={() => setTimeSec(Math.min(duration, timeSec + 300))} className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">Next <FastForward className="w-3.5 h-3.5" /></button>
        </div>

        <div className="flex items-center gap-1 border-l border-slate-300 pl-6">
          {[1, 2, 5, 10].map(s => (
            <button 
              key={s} 
              onClick={() => setSpeed(s)}
              className={`px-3 py-1.5 border text-[10px] font-black tracking-widest ${speed === s ? 'bg-slate-800 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
            >
              {s}x
            </button>
          ))}
        </div>

        <div className="flex-1 flex items-center gap-4 ml-6">
          <div className="text-right shrink-0">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Current Time</span>
            <span className="text-xl font-black text-slate-900 font-mono tracking-tighter">{formatTime(timeSec)}</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Mission Progress</span>
              <span className="text-[10px] font-black text-slate-900">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200 relative">
              <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* MISSION TIMELINE */}
      <div className="bg-white border border-slate-300 p-4 shadow-sm relative overflow-hidden">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-6">Mission Event Timeline</span>
        <div className="relative h-16 flex items-center">
          <div className="absolute left-0 right-0 h-0.5 bg-slate-300"></div>
          
          <div className="relative z-10 w-full flex justify-between items-center text-center px-4">
            {replayData.missionEvents?.map((evt: any, i: number) => {
              const eSec = (new Date(evt.timestamp).getTime() - new Date(replayData.startTime).getTime()) / 1000;
              const posPercent = (eSec / duration) * 100;
              const isPast = eSec <= timeSec;
              
              let color = 'bg-slate-400';
              if (evt.severity === 'WARNING') color = 'bg-amber-500';
              if (evt.severity === 'CRITICAL') color = 'bg-red-500';
              if (evt.severity === 'NORMAL') color = 'bg-green-500';

              return (
                <div key={evt.id} className="absolute flex flex-col items-center -translate-x-1/2 cursor-pointer" style={{ left: `${posPercent}%` }} onClick={() => setTimeSec(eSec)}>
                  <span className="text-[9px] font-black text-slate-700 bg-white px-1 mb-2">{formatTime(eSec)}</span>
                  <div className={`w-3 h-3 ${color} border-2 border-white rounded-full ring-2 ${isPast ? 'ring-slate-400' : 'ring-transparent'}`}></div>
                  <span className="text-[9px] font-bold text-slate-600 mt-2 uppercase whitespace-nowrap">{evt.title}</span>
                </div>
              );
            })}
          </div>
          {/* Progress Overlay line */}
          <div className="absolute left-0 top-1/2 h-0.5 bg-blue-500 transition-all duration-300" style={{ width: `${progress}%`, zIndex: 5 }}></div>
          {/* Current Scrubber Head */}
          <div className="absolute top-[28px] w-0.5 h-10 bg-slate-800 transition-all duration-300 z-20 pointer-events-none" style={{ left: `${progress}%` }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-800"></div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT PANEL (70%) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* REPLAY ANALYTICS CHARTS */}
          <div className="bg-white border border-slate-300 shadow-sm flex flex-col flex-1 min-h-[300px]">
            <div className="border-b border-slate-300 px-4 py-2 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> REPLAY ANALYTICS</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">SYNCHRONIZED METRICS</span>
            </div>
            
            <div className="flex-1 grid grid-cols-2 grid-rows-2 p-4 gap-4 relative">
              {/* Row 1: RPM */}
              <div className="border border-slate-200 relative overflow-hidden flex flex-col bg-slate-50">
                <span className="text-[9px] font-black text-slate-700 bg-white px-2 py-1 absolute top-0 left-0 border-b border-r border-slate-200 z-10">RPM HISTORY</span>
                <div className="flex-1 w-full relative mt-6 h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentTelemetry}>
                      <YAxis domain={['auto', 'auto']} hide />
                      <Line type="monotone" dataKey="rpm" stroke="#1e293b" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Row 1: CHT */}
              <div className="border border-slate-200 relative overflow-hidden flex flex-col bg-slate-50">
                <span className="text-[9px] font-black text-slate-700 bg-white px-2 py-1 absolute top-0 left-0 border-b border-r border-slate-200 z-10">CHT HISTORY</span>
                <div className="flex-1 w-full relative mt-6 h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentTelemetry}>
                      <YAxis domain={['auto', 'auto']} hide />
                      <Line type="monotone" dataKey="chtAvg" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Row 2: EGT */}
              <div className="border border-slate-200 relative overflow-hidden flex flex-col bg-slate-50">
                <span className="text-[9px] font-black text-slate-700 bg-white px-2 py-1 absolute top-0 left-0 border-b border-r border-slate-200 z-10">EGT HISTORY</span>
                <div className="flex-1 w-full relative mt-6 h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentTelemetry}>
                      <YAxis domain={['auto', 'auto']} hide />
                      <Line type="monotone" dataKey="egtAvg" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Row 2: Oil Temp */}
              <div className="border border-slate-200 relative overflow-hidden flex flex-col bg-slate-50">
                <span className="text-[9px] font-black text-slate-700 bg-white px-2 py-1 absolute top-0 left-0 border-b border-r border-slate-200 z-10">OIL TEMP HISTORY</span>
                <div className="flex-1 w-full relative mt-6 h-full p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentTelemetry}>
                      <YAxis domain={['auto', 'auto']} hide />
                      <Line type="monotone" dataKey="oilTemp" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (30%) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* EVENT LOG */}
          <div className="bg-white border border-slate-300 shadow-sm flex flex-col flex-1 max-h-[300px]">
            <div className="border-b border-slate-300 px-4 py-2 bg-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><List className="w-3.5 h-3.5" /> EVENT LOG</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
              {currentEvents.length === 0 && <span className="text-slate-400">No events logged yet.</span>}
              {currentEvents.map((evt: any) => {
                const isCrit = evt.severity === 'CRITICAL';
                return (
                  <div key={evt.id} className={`flex gap-3 ${isCrit ? 'bg-red-50 p-2 -mx-2 border border-red-200 relative' : ''}`}>
                    <span className={`${isCrit ? 'text-red-800 font-bold' : 'text-slate-500'} shrink-0`}>
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="flex flex-col">
                      <span className={`font-bold ${isCrit ? 'text-red-900' : 'text-slate-800'}`}>{evt.title}</span>
                      <span className={`text-[9px] px-1 w-max mt-1 font-bold ${isCrit ? 'text-white bg-red-600' : 'text-slate-600 bg-slate-100 border border-slate-200'}`}>
                        {evt.severity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAULT & AI INVESTIGATION */}
          <div className="bg-white border border-slate-300 shadow-sm flex flex-col flex-1">
            <div className="border-b border-slate-300 px-4 py-2 bg-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> FAULT INVESTIGATION</span>
            </div>
            <div className="p-4 flex flex-col gap-4 text-xs">
              {currentFault ? (
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block border-b border-slate-200 mb-2 pb-1">Detected Fault</span>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-600">Fault:</span><span className="col-span-2 font-black text-slate-900">{currentFault.faultType}</span>
                    <span className="text-slate-600">Time:</span><span className="col-span-2 font-mono font-bold text-slate-900">{new Date(currentFault.injectedAt).toLocaleTimeString()}</span>
                    <span className="text-slate-600">Severity:</span><span className="col-span-2 font-black text-amber-600">{currentFault.severity}</span>
                  </div>
                </div>
              ) : (
                <span className="text-slate-400">No active faults.</span>
              )}

              {currentAi && (
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block border-b border-slate-200 mb-2 pb-1 flex items-center gap-1"><BrainCircuit className="w-3 h-3 text-blue-500" /> AI Response</span>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-600">Action:</span><span className="col-span-2 font-black text-slate-900">{currentAi.actionType}</span>
                    <span className="text-slate-600">Reason:</span><span className="col-span-2 text-slate-800">{currentAi.reason}</span>
                    <span className="text-slate-600">Confidence:</span><span className="col-span-2 font-mono font-bold text-blue-600">{(currentAi.confidenceScore * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        
        {/* MISSION PERFORMANCE SUMMARY */}
        <div className="bg-white border border-slate-300 shadow-sm p-4 text-xs flex flex-col">
          <div className="border-b border-slate-300 pb-2 mb-3 shrink-0">
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">MISSION PERFORMANCE SUMMARY</span>
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 flex-1 content-center">
            <div><span className="text-[9px] text-slate-500 uppercase block">Success Rate</span><span className="font-mono font-black text-green-700">{replayData.missionSuccessRate}%</span></div>
            <div><span className="text-[9px] text-slate-500 uppercase block">Fuel Consumed</span><span className="font-mono font-black text-slate-900">{replayData.fuelConsumed?.toFixed(2)} KG</span></div>
            <div><span className="text-[9px] text-slate-500 uppercase block">Distance Covered</span><span className="font-mono font-black text-slate-900">{replayData.totalDistance?.toFixed(1)} KM</span></div>
            <div><span className="text-[9px] text-slate-500 uppercase block">Max Altitude</span><span className="font-mono font-black text-slate-900">{replayData.maxAltitude?.toFixed(0)} FT</span></div>
            <div><span className="text-[9px] text-slate-500 uppercase block">Final Health</span><span className="font-mono font-black text-slate-900">{replayData.finalEngineHealth?.toFixed(1)}%</span></div>
            <div><span className="text-[9px] text-slate-500 uppercase block">Remaining RUL</span><span className="font-mono font-black text-slate-900">{replayData.finalRulHours?.toFixed(1)} H</span></div>
          </div>
        </div>

        {/* AFTER ACTION REVIEW */}
        <div className="bg-white border border-slate-300 shadow-sm p-4 flex flex-col">
          <div className="border-b border-slate-300 pb-2 mb-3 shrink-0">
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" /> AFTER ACTION REVIEW REPORT</span>
          </div>
          <div className="bg-slate-50 p-4 border border-slate-200 rounded text-[11px] font-mono text-slate-700 leading-relaxed space-y-3 flex-1 flex flex-col justify-center">
            <p>Mission replay loaded successfully from Database Record.</p>
            {replayData.missionEvents?.filter((e: any) => e.severity === 'CRITICAL' || e.severity === 'WARNING').map((evt: any) => (
              <p key={evt.id} className="border-l-2 border-red-500 pl-3 text-slate-900 font-bold bg-red-100/50 py-1 pr-2">
                [{new Date(evt.timestamp).toLocaleTimeString()}] {evt.title} - {evt.description}
              </p>
            ))}
            <div className="mt-auto pt-3 border-t border-slate-300 flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
              <span>AUTHORIZED BY: FLIGHT DATA RECORDER</span>
              <span>SYSTEM GENERATED: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
