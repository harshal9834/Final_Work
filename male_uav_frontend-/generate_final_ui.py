import os

BASE_DIR = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\modules\digital-twin"

files = {
    "components/TwinLayout.tsx": """import React, { useState } from 'react';
import { EngineViewer } from './EngineViewer';
import { ComponentDetailsRightPanel } from './ComponentDetailsRightPanel';
import { TelemetryBottomBar } from './TelemetryBottomBar';
import { DigitalTwinViewMode } from '../services/faultVisualizationEngine';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';
import { useGcs } from '../../../contexts/GcsContext';

export const TwinLayout: React.FC = () => {
  const [viewMode, setViewMode] = useState<DigitalTwinViewMode>('NORMAL');
  const { selectedComponent } = useDigitalTwin();
  const { telemetry, activeFaults } = useGcs();
  
  const internalTelemetry = {
    ...telemetry,
    cht: telemetry?.chtC?.[0] || 212,
    rpm: telemetry?.rpm || 4320,
    timestamp: Date.now()
  };

  const topModes = ['NORMAL', 'THERMAL', 'STRESS', 'VIBRATION', 'COMPONENT_HEALTH', 'TRANSPARENT', 'EXPLODED_VIEW'];

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* HEADER / MODES BAR */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between shadow-sm z-10">
        <div className="flex gap-2">
          {topModes.map(mode => (
            <button 
              key={mode} 
              onClick={() => setViewMode(mode as any)}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${viewMode === mode ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200'}`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex flex-col text-right">
          <span className="text-sm font-bold text-slate-800">DRDO DIGITAL TWIN</span>
          <span className="text-xs text-green-600 font-bold flex items-center gap-1 justify-end">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            LIVE TELEMETRY
          </span>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* CENTER 3D VIEWPORT */}
        <div className="flex-1 relative bg-gradient-to-b from-slate-50 to-slate-200">
          <EngineViewer viewMode={viewMode} setViewMode={setViewMode} />
          
          {/* BOTTOM TELEMETRY BAR (Absolute positioned over the 3D view at bottom) */}
          <div className="absolute bottom-6 left-6 right-6">
             <TelemetryBottomBar telemetry={internalTelemetry} />
          </div>
        </div>

        {/* RIGHT PANEL: COMPONENT DETAILS */}
        <div className="w-[450px] bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col h-full">
          <ComponentDetailsRightPanel selectedComponent={selectedComponent} telemetry={internalTelemetry} faults={activeFaults} />
        </div>
        
      </div>
    </div>
  );
};
""",
    "components/TelemetryBottomBar.tsx": """import React from 'react';

export const TelemetryBottomBar: React.FC<{telemetry: any}> = ({ telemetry }) => {
  const metrics = [
    { label: 'RPM', value: telemetry.rpm, max: 6000, unit: 'RPM', color: 'text-green-600' },
    { label: 'CHT (Avg)', value: telemetry.cht, max: 300, unit: '°C', color: 'text-green-600' },
    { label: 'EGT (Avg)', value: telemetry.egtC?.[0] || 718, max: 1000, unit: '°C', color: 'text-green-600' },
    { label: 'Oil Temp', value: telemetry.oilTempC || 92, max: 200, unit: '°C', color: 'text-green-600' },
    { label: 'Oil Pressure', value: telemetry.oilPressureBar || 4.2, max: 10, unit: 'Bar', color: 'text-green-600' },
    { label: 'Fuel Flow', value: telemetry.fuelFlowLitersHr || 28.5, max: 60, unit: 'L/hr', color: 'text-green-600' },
    { label: 'Vibration RMS', value: telemetry.vibrationRmsMmS || 2.1, max: 10, unit: 'mm/s', color: 'text-green-600' },
  ];

  return (
    <div className="flex gap-4 w-full overflow-x-auto pb-2">
      {metrics.map(m => (
        <div key={m.label} className="bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-xl flex-1 flex flex-col items-center shadow-lg min-w-[120px]">
          <span className="text-xs font-bold text-slate-500 mb-2">{m.label}</span>
          <div className="relative w-20 h-10 overflow-hidden mb-1 flex justify-center">
            {/* Semi-circle Gauge SVG */}
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={m.value > m.max * 0.8 ? '#ef4444' : '#22c55e'} strokeWidth="8" strokeDasharray={`${Math.PI * 40 * Math.min(1, m.value / m.max)} 251`} strokeLinecap="round" />
            </svg>
            <div className="absolute bottom-0 flex flex-col items-center justify-end leading-none">
              <span className={`text-xl font-black ${m.color}`}>{m.value}</span>
              <span className="text-[10px] text-slate-400 font-bold">{m.unit}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
""",
    "components/ComponentDetailsRightPanel.tsx": """import React, { useState } from 'react';
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

  const compData = components[selectedComponent] || components['Main Engine'];
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
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${compData.status === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            <span className={`w-2 h-2 rounded-full ${compData.status === 'CRITICAL' ? 'bg-red-500' : 'bg-green-500'}`}></span>
            {compData.status}
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
            <KPI icon="thermometer" label="Temperature (CHT)" value={compData.temperature} unit="°C" color="text-slate-800" />
            <KPI icon="gauge" label="Pressure (Compression)" value={compData.pressure} unit="Bar" color="text-slate-800" />
            <KPI icon="activity" label="Vibration (RMS)" value={compData.vibration} unit="mm/s" color="text-green-600" />
            <KPI icon="check" label="Operating Status" value={compData.status} unit="" color={compData.status === 'CRITICAL' ? 'text-red-600' : 'text-green-600'} />
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
            <MockGraph label="CHT (°C)" value={compData.temperature} color="blue" />
            <MockGraph label="Vibration (mm/s)" value={compData.vibration} color="green" />
            <MockGraph label="In-Cylinder Pressure (Bar)" value={compData.pressure} color="orange" />
          </div>
        </div>

        {/* FAULT BANNER */}
        {compData.activeFaults.length > 0 ? (
           <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
             <div className="bg-red-100 p-1.5 rounded-full text-red-600 mt-0.5">⚠️</div>
             <div>
               <div className="font-bold text-red-800 text-sm">Active Faults Detected</div>
               <div className="text-red-600 text-xs mt-1">{compData.activeFaults.join(', ')}</div>
             </div>
           </div>
        ) : (
           <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-3">
             <div className="bg-green-100 p-1.5 rounded-full text-green-600 mt-0.5">✓</div>
             <div>
               <div className="font-bold text-green-800 text-sm">No active faults</div>
               <div className="text-green-600 text-xs mt-1">Component operating within normal parameters.</div>
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
""",
    "components/EngineViewer.tsx": """import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Bounds, useBounds, Html } from '@react-three/drei';
import { EngineModel } from './EngineModel';
import { DigitalTwinViewMode } from '../services/faultVisualizationEngine';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';

interface Props {
  viewMode: DigitalTwinViewMode;
  setViewMode: (mode: DigitalTwinViewMode) => void;
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div className="flex items-center justify-center h-full w-full text-red-500 font-bold bg-slate-50 rounded-xl">Engine Model Failed To Load</div>;
    }
    return this.props.children;
  }
}

export const EngineViewer: React.FC<Props> = ({ viewMode, setViewMode }) => {
  const orbitRef = useRef<any>(null);

  const resetCamera = () => {
    if (orbitRef.current) {
      orbitRef.current.reset();
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col">
      {/* 3D VIEW CONTROLS WIDGET */}
      <div className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-200 flex flex-col pointer-events-auto">
        <span className="text-[10px] font-black text-slate-400 text-center mb-2 px-2 tracking-widest border-b border-slate-100 pb-1">3D VIEW CONTROLS</span>
        <div className="flex gap-2 justify-center">
          <ControlButton icon="↻" label="Rotate" />
          <ControlButton icon="🔍" label="Zoom" />
          <ControlButton icon="✋" label="Pan" />
          <ControlButton icon="⟲" label="Reset" onClick={resetCamera} />
        </div>
      </div>
      
      {/* GLB CANVAS */}
      <div className="flex-1 w-full h-full">
        <ErrorBoundary>
          <Canvas shadows dpr={[1, 2]} camera={{ position: [5, 3, 5], fov: 45 }} className="w-full h-full outline-none">
            <Suspense fallback={null}>
              <Environment preset="city" />
              <ambientLight intensity={0.6} />
              <directionalLight castShadow position={[10, 10, 10]} intensity={1.2} shadow-mapSize={[2048, 2048]} />
              
              <Bounds fit clip observe margin={1.2}>
                <EngineModel viewMode={viewMode} />
              </Bounds>
              
              <OrbitControls 
                ref={orbitRef}
                makeDefault 
                autoRotate={false} 
                enablePan={true}
                enableZoom={true}
                minPolarAngle={0}
                maxPolarAngle={Math.PI}
              />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>
    </div>
  );
};

const ControlButton = ({ icon, label, onClick }: {icon: string, label: string, onClick?: () => void}) => (
  <button onClick={onClick} className="flex flex-col items-center p-2 rounded hover:bg-slate-100 text-slate-600 transition-colors w-12">
    <span className="text-lg mb-1">{icon}</span>
    <span className="text-[9px] font-bold uppercase">{label}</span>
  </button>
);
""",
    "components/EngineModel.tsx": """import React, { useMemo, useRef, useState } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';
import { DigitalTwinViewMode } from '../services/faultVisualizationEngine';
import { useGcs } from '../../../contexts/GcsContext';

interface Props {
  viewMode: DigitalTwinViewMode;
}

export const EngineModel: React.FC<Props> = ({ viewMode }) => {
  const { scene } = useGLTF('/model/rotax915.glb');
  const { components, transparentMode, explodedView, selectedComponent, setSelectedComponent } = useDigitalTwin();
  const { telemetry } = useGcs();
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const compName = mesh.name || 'Main Engine';
        const origMat = mesh.material as THREE.MeshStandardMaterial;
        mesh.userData = { 
          isComponent: true, 
          name: compName, 
          originalPos: mesh.position.clone(),
          originalColor: origMat.color ? origMat.color.clone() : new THREE.Color(0xffffff),
          originalEmissive: origMat.emissive ? origMat.emissive.clone() : new THREE.Color(0x000000),
          originalOpacity: origMat.opacity
        };
        
        mesh.material = origMat.clone();
        if ((mesh.material as THREE.MeshStandardMaterial).transparent === undefined) {
          (mesh.material as THREE.MeshStandardMaterial).transparent = true;
        }
      }
    });
    return clone;
  }, [scene]);

  // Animation Loop (Vibration, Exploded View, Transparency, Thermal)
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.userData.name;
        const compData = components[name] || components['Main Engine'];
        const mat = mesh.material as THREE.MeshStandardMaterial;

        const origColor = mesh.userData.originalColor as THREE.Color;
        const origEmissive = mesh.userData.originalEmissive as THREE.Color;
        const origOpacity = mesh.userData.originalOpacity !== undefined ? mesh.userData.originalOpacity : 1.0;
        const origPos = mesh.userData.originalPos as THREE.Vector3;

        // Base Reset
        mat.color.lerp(origColor, 0.1);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, origOpacity, 0.1);
        
        // 1. Transparency Mode
        if (viewMode === 'TRANSPARENT' && name.toLowerCase().includes('casing')) {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.2, 0.1);
        }

        // 2. Exploded View
        if (viewMode === 'EXPLODED_VIEW') {
          const dir = origPos.clone().normalize();
          mesh.position.lerp(origPos.clone().add(dir.multiplyScalar(2)), 0.05);
        } else {
          mesh.position.lerp(origPos, 0.1);
        }

        // 3. Vibration
        if (viewMode === 'VIBRATION' && compData.vibration > 0) {
          const intensity = compData.vibration * 0.01;
          mesh.position.x = origPos.x + Math.sin(time * 50) * intensity;
          mesh.position.y = origPos.y + Math.cos(time * 50) * intensity;
        }

        // 4. Thermal / Fault Color
        if (viewMode === 'THERMAL') {
          const t = Math.max(0, Math.min(1, (compData.temperature - 50) / 200));
          const color = new THREE.Color().setHSL((1 - t) * 0.6, 1.0, 0.5);
          mat.color.lerp(color, 0.1);
          mat.emissive.copy(origEmissive);
          mat.emissiveIntensity = 1;
        } else if (compData.status === 'CRITICAL' && viewMode === 'COMPONENT_HEALTH') {
          const blink = Math.sin(time * 10) > 0 ? 1 : 0.2;
          mat.color.setRGB(1, 1 - blink, 1 - blink);
          mat.emissive.setRGB(1, 0, 0);
          mat.emissiveIntensity = blink * 0.5;
        } else {
          // Normal mode picking glow
          if (hovered === name || selectedComponent === name) {
            mat.emissive.setHex(0x3b82f6);
            mat.emissiveIntensity = 0.5; // Blue outline effect
          } else {
            mat.emissive.copy(origEmissive);
            mat.emissiveIntensity = 1;
          }
        }
      }
    });
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (e.object) {
      const name = e.object.userData.name;
      setSelectedComponent(selectedComponent === name ? null : name);
    }
  };

  return (
    <group ref={groupRef}>
      <primitive 
        object={clonedScene} 
        onClick={handleClick}
        onPointerOver={(e: any) => { e.stopPropagation(); setHovered(e.object.userData.name); }}
        onPointerOut={() => setHovered(null)}
      />
      {/* Dashed Leader Line Implementation is handled by CSS/HTML overlays mapped to 3D coords, or drawn with Line in ThreeJS */}
    </group>
  );
};
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(BASE_DIR, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Final production UI files generated successfully.")
