# -*- coding: utf-8 -*-
path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\pages\MissionReplayPage.tsx"

content = """import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, Rewind, FastForward, Activity, 
  Settings, Zap, TrendingUp, AlertTriangle, Cpu, List, MapPin, Search
} from 'lucide-react';
import { useGcs } from '../contexts/GcsContext';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stage } from '@react-three/drei';
import { EngineModel } from '../modules/digital-twin/components/EngineModel';

// Fix leaflet default icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_BASE_URL = import.meta.env.VITE_SIMULATOR_URL + '/api/missions';

export const MissionReplayPage: React.FC = () => {
  const { selectedUav } = useGcs();
  
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
        if (Array.isArray(data)) setMissions(data);
      })
      .catch(err => console.error("Failed to fetch missions", err));
  }, []);

  // Fetch Replay Data
  useEffect(() => {
    if (selectedMissionId) {
      fetch(`${API_BASE_URL}/${selectedMissionId}/replay`)
        .then(res => res.json())
        .then(data => {
          setReplayData(data);
          setDuration(data.durationSeconds || 14400); // default to 4h if missing
          setTimeSec(0);
          setIsPlaying(false);
        })
        .catch(err => console.error("Failed to fetch replay data", err));
    } else {
      // Mock Data for demonstration if no API
      const mockDur = 3600 * 2.5; // 2.5 hrs
      setReplayData({
        missionName: 'Onyx Delta',
        durationSeconds: mockDur,
        telemetryHistory: Array.from({length: 50}).map((_, i) => ({
          timestamp: new Date(Date.now() - (50-i)*60000).toISOString(),
          rpm: 4800 + Math.random()*200,
          chtAvg: 110 + Math.random()*10,
          egtAvg: 750 + Math.random()*20,
          oilTemp: 105 + Math.random()*5,
          map: 34 + Math.random()*2
        })),
        missionEvents: [
          { timestamp: new Date(Date.now() - 140*60000).toISOString(), title: 'Engine Start', severity: 'NORMAL' },
          { timestamp: new Date(Date.now() - 120*60000).toISOString(), title: 'Takeoff', severity: 'NORMAL' },
          { timestamp: new Date(Date.now() - 60*60000).toISOString(), title: 'Turbocharger Warning', severity: 'WARNING' },
          { timestamp: new Date(Date.now() - 40*60000).toISOString(), title: 'Oil Temp High', severity: 'CRITICAL' },
        ],
        faultHistories: [],
        aiInterventions: []
      });
      setDuration(mockDur);
      setTimeSec(0);
      setIsPlaying(false);
    }
  }, [selectedMissionId]);

  // Playback Engine
  useEffect(() => {
    let interval: any;
    if (isPlaying && duration > 0) {
      interval = setInterval(() => {
        setTimeSec(prev => {
          if (prev >= duration) { setIsPlaying(false); return duration; }
          return prev + (5 * speed); // jump 5s for smooth replay feeling
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, duration]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const progress = duration > 0 ? (timeSec / duration) * 100 : 0;

  // Mock Flight Path for Leaflet
  const flightPath: [number, number][] = [
    [20.59, 78.96],
    [20.70, 78.85],
    [20.85, 79.10],
    [20.65, 79.35],
    [20.50, 79.20],
    [20.59, 78.96]
  ];

  if (!replayData) {
    return (
      <div className="p-12 text-center h-full flex flex-col items-center justify-center bg-slate-50">
         <Activity className="w-12 h-12 mb-4 text-slate-300" />
         <h2 className="text-xl font-black mb-6">SELECT A MISSION TO REPLAY</h2>
         <div className="flex flex-col gap-2 items-center w-full max-w-md">
           {missions.map(m => (
             <button key={m.id} onClick={() => setSelectedMissionId(m.id)} className="px-6 py-3 border border-slate-300 hover:bg-slate-100 bg-white shadow-sm w-full text-left rounded">
               <div className="font-bold">{m.missionName}</div>
               <div className="text-xs text-slate-500">{m.missionId} | {new Date(m.startTime).toLocaleString()}</div>
             </button>
           ))}
           <button onClick={() => setSelectedMissionId('MOCK')} className="px-6 py-3 border border-blue-300 hover:bg-blue-50 bg-white shadow-sm w-full text-left rounded">
             <div className="font-bold text-blue-700">Load Demo Replay</div>
             <div className="text-xs text-slate-500">View UI layout with mock data</div>
           </button>
         </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#F1F5F9] min-h-full font-sans text-slate-900 space-y-4">
      
      {/* TOP ROW: TIMELINE & CONTROLS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Timeline */}
        <div className="xl:col-span-9 bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Mission Timeline</h3>
            <div className="flex gap-4 text-[10px] font-bold text-slate-600">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Normal Flight</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Warning</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Critical Event</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Current Position</span>
            </div>
          </div>
          
          <div className="relative pt-6 pb-2">
            {/* Phase bars */}
            <div className="h-3 w-full flex rounded-full overflow-hidden">
              <div className="bg-sky-400 h-full" style={{width: '15%'}}></div>
              <div className="bg-green-500 h-full" style={{width: '25%'}}></div>
              <div className="bg-blue-600 h-full" style={{width: '35%'}}></div>
              <div className="bg-purple-500 h-full" style={{width: '10%'}}></div>
              <div className="bg-amber-500 h-full" style={{width: '10%'}}></div>
              <div className="bg-red-500 h-full" style={{width: '5%'}}></div>
            </div>
            
            {/* Scrubber */}
            <div className="absolute top-4 bottom-0 w-0.5 bg-blue-600 z-10" style={{ left: `${progress}%` }}>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-700 whitespace-nowrap">{formatTime(timeSec)}</div>
            </div>

            {/* Labels */}
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-2">
              <span>00:00</span>
              <span>01:12</span>
              <span>05:45</span>
              <span>10:21</span>
              <span>13:05</span>
              <span>14:22</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 -mt-9 px-4">
              <span className="ml-4">Takeoff</span>
              <span className="ml-10">Climb</span>
              <span className="ml-24">Cruise</span>
              <span className="ml-20">Loiter</span>
              <span className="ml-4">Descent</span>
              <span className="mr-2">Landing</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="xl:col-span-3 bg-white rounded-lg shadow-sm p-4 border border-slate-200 flex flex-col justify-center gap-4">
          <div className="flex justify-center items-center gap-4">
            <button onClick={() => setTimeSec(Math.max(0, timeSec - 300))} className="p-2 text-slate-600 hover:text-slate-900"><Rewind className="w-5 h-5" /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md">
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
            <button onClick={() => setTimeSec(Math.min(duration, timeSec + 300))} className="p-2 text-slate-600 hover:text-slate-900"><FastForward className="w-5 h-5" /></button>
            <select className="text-xs border border-slate-200 rounded p-1 font-bold text-slate-600 ml-2 outline-none" value={speed} onChange={e => setSpeed(Number(e.target.value))}>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={5}>5x</option>
              <option value={10}>10x</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">{formatTime(timeSec)} / {formatTime(duration)}</span>
            <input type="range" min="0" max={duration} value={timeSec} onChange={e => setTimeSec(Number(e.target.value))} className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Map */}
        <div className="xl:col-span-4 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden h-[350px]">
          <div className="px-4 py-2 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">Mission Flight Path</h3>
            <select className="text-[10px] border border-slate-200 rounded p-1 bg-white outline-none">
              <option>Satellite</option>
              <option>Terrain</option>
            </select>
          </div>
          <div className="flex-1 w-full h-full relative z-0">
             <MapContainer center={[20.65, 79.1]} zoom={10} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              <Polyline positions={flightPath} color="#3b82f6" weight={3} />
              <Marker position={flightPath[0]}><Popup>Takeoff</Popup></Marker>
              <Marker position={flightPath[flightPath.length-1]}><Popup>Current Position</Popup></Marker>
            </MapContainer>
            
            {/* Overlay Info */}
            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white p-3 rounded-lg border border-slate-700 z-[1000] text-[10px] space-y-1">
              <div className="flex items-center gap-1 text-blue-400 font-bold mb-1"><MapPin className="w-3 h-3" /> Current Position</div>
              <div className="grid grid-cols-2 gap-x-4">
                <span className="text-slate-400">Lat</span><span>: 20.5931&deg; N</span>
                <span className="text-slate-400">Lon</span><span>: 78.9629&deg; E</span>
                <span className="text-slate-400">Alt</span><span>: 8,250 m</span>
                <span className="text-slate-400">Speed</span><span>: 165 km/h</span>
                <span className="text-slate-400">Heading</span><span>: 235&deg;</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Twin */}
        <div className="xl:col-span-5 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-[350px]">
          <div className="px-4 py-2 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">3D Digital Twin (Replay Mode)</h3>
            <div className="flex gap-2">
              <button className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded font-bold">Auto Rotate: ON</button>
              <button className="text-[10px] border border-slate-200 bg-white px-2 py-1 rounded font-bold">Reset View</button>
              <button className="text-[10px] border border-slate-200 bg-white px-2 py-1 rounded font-bold">Full Screen</button>
            </div>
          </div>
          <div className="flex-1 w-full relative bg-slate-50/50 cursor-move">
            <Canvas camera={{ position: [2.5, 1.5, 3], fov: 35 }}>
              <Environment preset="studio" />
              <ambientLight intensity={1.2} />
              <directionalLight castShadow position={[10, 10, 10]} intensity={3} />
              <OrbitControls autoRotate={isPlaying} autoRotateSpeed={2} enableDamping />
              <EngineModel viewMode="SOLID" orbitRef={null} />
            </Canvas>
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Time: {formatTime(timeSec)}</span>
              <input type="range" min="0" max={duration} value={timeSec} onChange={e => setTimeSec(Number(e.target.value))} className="w-full accent-blue-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Events Log */}
        <div className="xl:col-span-3 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-[350px]">
          <div className="px-4 py-2 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><List className="w-4 h-4" /> Mission Events Log</h3>
            <select className="text-[10px] border border-slate-200 rounded p-1 bg-white outline-none">
              <option>All Events</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto p-2 text-xs font-mono space-y-1">
            {replayData.missionEvents?.map((evt: any, i: number) => {
              const isCrit = evt.severity === 'CRITICAL';
              const isWarn = evt.severity === 'WARNING';
              const eSec = (new Date(evt.timestamp).getTime() - new Date(replayData.startTime || Date.now()).getTime()) / 1000;
              const isPast = eSec <= timeSec;
              
              return (
                <div key={i} className={`flex items-center gap-3 p-2 rounded ${isPast ? (isCrit ? 'bg-red-50 text-red-900' : isWarn ? 'bg-amber-50 text-amber-900' : 'text-slate-700 hover:bg-slate-50') : 'text-slate-300'} cursor-pointer`} onClick={() => setTimeSec(Math.max(0, eSec))}>
                  <Activity className="w-3.5 h-3.5 shrink-0" />
                  <span className="w-16 shrink-0">{formatTime(Math.max(0, eSec))}</span>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isCrit ? 'bg-red-500' : isWarn ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                  <span className="truncate">{evt.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Engine Params */}
        <div className="xl:col-span-5 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-blue-600" /> Engine Parameters (Replay)</h3>
          </div>
          <div className="flex gap-2 mb-4 border-b border-slate-200 pb-2 overflow-x-auto">
            {['ENGINE', 'THERMAL', 'FUEL', 'ELECTRICAL', 'VIBRATION', 'TURBO'].map(tab => (
              <button key={tab} className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider ${tab === 'ENGINE' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{tab}</button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {/* Gauges (Mocked values for layout) */}
            <div className="flex flex-col items-center border border-slate-100 p-2 rounded">
              <span className="text-[9px] font-bold text-slate-500 mb-1">ENGINE RPM</span>
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center font-bold text-xs">5200</div>
              <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 rounded mt-1">NORM</span>
            </div>
            <div className="flex flex-col items-center border border-slate-100 p-2 rounded">
              <span className="text-[9px] font-bold text-slate-500 mb-1">MANIFOLD</span>
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center font-bold text-xs">35.8</div>
              <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 rounded mt-1">NORM</span>
            </div>
            <div className="flex flex-col items-center border border-red-100 p-2 rounded bg-red-50">
              <span className="text-[9px] font-bold text-slate-500 mb-1">OIL PRESS</span>
              <div className="w-12 h-12 rounded-full border-4 border-red-500 flex items-center justify-center font-bold text-xs text-red-600">4.35</div>
              <span className="text-[8px] bg-red-100 text-red-700 px-1 rounded mt-1">CRIT</span>
            </div>
            <div className="flex flex-col items-center border border-slate-100 p-2 rounded">
              <span className="text-[9px] font-bold text-slate-500 mb-1">OIL TEMP</span>
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center font-bold text-xs">106.2</div>
              <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 rounded mt-1">NORM</span>
            </div>
            <div className="flex flex-col items-center border border-slate-100 p-2 rounded">
              <span className="text-[9px] font-bold text-slate-500 mb-1">TURBO BST</span>
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center font-bold text-xs">0.88</div>
              <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 rounded mt-1">NORM</span>
            </div>
          </div>
          
          <h4 className="text-[10px] font-bold text-slate-500 mb-2">Engine Parameter Trends</h4>
          <div className="flex-1 min-h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={replayData.telemetryHistory}>
                <YAxis hide domain={['auto', 'auto']} />
                <Line type="monotone" dataKey="rpm" stroke="#3b82f6" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="chtAvg" stroke="#ef4444" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="egtAvg" stroke="#f59e0b" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fault & AI */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4"><AlertTriangle className="w-4 h-4 text-blue-600" /> Fault Analysis (Replay)</h3>
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg relative">
              <div className="absolute top-3 right-3 bg-red-100 text-red-600 font-bold text-[9px] px-2 py-0.5 rounded">HIGH</div>
              <h4 className="text-red-700 font-bold text-sm mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Turbo Failure</h4>
              <div className="grid grid-cols-3 text-xs gap-y-1">
                <span className="text-slate-500">Detected:</span><span className="col-span-2 font-bold text-slate-800">10:18:12</span>
                <span className="text-slate-500">Duration:</span><span className="col-span-2 font-bold text-slate-800">04m 22s</span>
                <span className="text-slate-500">Effect:</span><span className="col-span-2 font-bold text-slate-800">Reduced boost, high EGT</span>
              </div>
              <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1.5 px-3 rounded flex items-center gap-1 w-max ml-auto">
                <Play className="w-3 h-3 fill-current" /> Replay Fault
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Cpu className="w-4 h-4 text-blue-600" /> AI Prediction History</h3>
              <select className="text-[10px] border border-slate-200 rounded p-1">
                <option>Turbo Failure</option>
              </select>
            </div>
            <div className="flex gap-4 text-[10px] font-bold text-slate-500 justify-center mb-2">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Predicted Probability</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Confidence</span>
            </div>
            <div className="flex-1 w-full min-h-[100px]">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={replayData.telemetryHistory}>
                    <YAxis hide />
                    <Line type="stepAfter" dataKey={() => Math.random() * 100} stroke="#ef4444" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey={() => 80 + Math.random() * 20} stroke="#3b82f6" dot={false} strokeWidth={2} />
                 </LineChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RUL & Cylinders */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600" /> RUL Trend (Replay)</h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Current: 350 hrs</span>
            </div>
            <div className="flex-1 min-h-[100px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={replayData.telemetryHistory}>
                  <defs>
                    <linearGradient id="colorRul" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis hide />
                  <Area type="monotone" dataKey={() => 350 - Math.random()*20} stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRul)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-3"><Activity className="w-4 h-4 text-blue-600" /> Cylinder Temperatures</h3>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(cyl => (
                <div key={cyl} className="border border-slate-100 p-2 flex flex-col items-center rounded bg-slate-50">
                  <div className="flex justify-between w-full mb-1 text-[9px] font-bold text-slate-500">
                    <span>CYL #{cyl}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  </div>
                  <span className="font-black text-xs text-slate-800 mb-1">{112 + Math.random()*3}&deg;C</span>
                  <span className="text-[8px] text-slate-400">EGT</span>
                  <span className="font-bold text-[10px] text-slate-600">{760 + Math.random()*15}&deg;C</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
"""

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("MissionReplayPage written successfully.")
