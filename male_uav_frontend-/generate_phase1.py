import os

BASE_DIR = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\modules\digital-twin"

files = {
    "types/engine.ts": """export interface EngineComponent {
  id: string;
  name: string;
  health: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  temperature?: number;
  pressure?: number;
  telemetryValues?: Record<string, any>;
}

export interface EngineHealth {
  overallHealth: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}
""",
    "types/telemetry.ts": """export interface TelemetryData {
  rpm: number;
  cht: number;
  egt: number;
  oilTemp: number;
  oilPressure: number;
  fuelFlow: number;
  battery: number;
  vibration: number;
  timestamp: number;
}
""",
    "constants/engineComponents.ts": """export const ENGINE_COMPONENTS_REGISTRY = [
  "Main Engine",
  "ECU",
  "Intercooler",
  "Oil Tank",
  "Magnetovalve",
  "Overboost Valve",
  "Ambient Sensor",
  "Transmission",
  "Air Baffles",
  "Fusebox"
];
""",
    "services/healthEngine.ts": """import { TelemetryData } from '../types/telemetry';
import { EngineHealth } from '../types/engine';

export function calculateEngineHealth(telemetry: TelemetryData): EngineHealth {
  // Simple heuristic for phase 1 demo
  let penalty = 0;
  if (telemetry.rpm > 5500) penalty += 5;
  if (telemetry.cht > 250) penalty += 10;
  if (telemetry.oilTemp > 110) penalty += 10;
  
  const health = Math.max(0, 100 - penalty);
  
  return {
    overallHealth: health,
    status: health > 90 ? 'HEALTHY' : health > 75 ? 'WARNING' : 'CRITICAL'
  };
}
""",
    "services/twinSyncService.ts": """export function calculateTwinSync(telemetryTimestamp: number, twinUpdateTimestamp: number): number {
  const diff = Math.abs(telemetryTimestamp - twinUpdateTimestamp);
  // Assume perfectly in sync if diff < 50ms. 
  // For Phase 1 demo, we simulate a 98-100% sync rate
  const sync = 100 - (diff / 100);
  return Math.max(95, Math.min(100, sync)); // Keep it realistic between 95 and 100 for the demo
}
""",
    "hooks/useTelemetry.ts": """import { useState, useEffect } from 'react';
import { TelemetryData } from '../types/telemetry';

// Mock live telemetry generation for Phase 1
export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    rpm: 4320,
    cht: 212,
    egt: 728,
    oilTemp: 88,
    oilPressure: 4.2,
    fuelFlow: 18.6,
    battery: 95,
    vibration: 3.1,
    timestamp: Date.now()
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        rpm: 4320 + Math.random() * 50 - 25,
        cht: 212 + Math.random() * 2 - 1,
        egt: 728 + Math.random() * 10 - 5,
        oilTemp: 88 + Math.random() * 1 - 0.5,
        oilPressure: 4.2 + Math.random() * 0.1 - 0.05,
        fuelFlow: 18.6 + Math.random() * 0.5 - 0.25,
        battery: 95 - Math.random() * 0.01,
        vibration: 3.1 + Math.random() * 0.2 - 0.1,
        timestamp: Date.now()
      }));
    }, 100); // 10Hz

    return () => clearInterval(interval);
  }, []);

  return telemetry;
}
""",
    "hooks/useEngineHealth.ts": """import { useState, useEffect } from 'react';
import { TelemetryData } from '../types/telemetry';
import { calculateEngineHealth } from '../services/healthEngine';
import { EngineHealth } from '../types/engine';

export function useEngineHealth(telemetry: TelemetryData) {
  const [health, setHealth] = useState<EngineHealth>({ overallHealth: 100, status: 'HEALTHY' });

  useEffect(() => {
    setHealth(calculateEngineHealth(telemetry));
  }, [telemetry]);

  return health;
}
""",
    "components/TwinStatusBar.tsx": """import React, { useEffect, useState } from 'react';
import { EngineHealth } from '../types/engine';
import { calculateTwinSync } from '../services/twinSyncService';

interface Props {
  health: EngineHealth;
  telemetryTimestamp: number;
}

export const TwinStatusBar: React.FC<Props> = ({ health, telemetryTimestamp }) => {
  const [sync, setSync] = useState(100);

  useEffect(() => {
    setSync(calculateTwinSync(telemetryTimestamp, Date.now()));
  }, [telemetryTimestamp]);

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 w-full">
      <StatusCard label="Engine Health" value={`${health.overallHealth.toFixed(1)}%`} color={health.status === 'HEALTHY' ? 'text-green-600' : 'text-amber-500'} />
      <StatusCard label="Mission Reliability" value="96%" color="text-green-600" />
      <StatusCard label="Twin Sync" value={`${sync.toFixed(1)}%`} color="text-blue-600" />
      <StatusCard label="Active Faults" value="0" color="text-slate-600" />
      <StatusCard label="Engine Status" value={health.status} color={health.status === 'HEALTHY' ? 'text-green-600' : 'text-amber-500'} />
    </div>
  );
};

const StatusCard = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="flex flex-col items-center justify-center px-6 border-r border-slate-100 last:border-0 flex-1">
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</span>
    <span className={`text-2xl font-bold ${color}`}>{value}</span>
  </div>
);
""",
    "components/SystemStatus.tsx": """import React from 'react';

export const SystemStatus: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">System Status</h3>
      <div className="space-y-2">
        <StatusItem label="Telemetry Connected" active />
        <StatusItem label="Twin Active" active />
        <StatusItem label="Data Stream Healthy" active />
        <StatusItem label="Component Registry Loaded" active />
        <StatusItem label="3D Model Loaded" active />
      </div>
    </div>
  );
};

const StatusItem = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-600">{label}</span>
    <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
  </div>
);
""",
    "components/TelemetryPanel.tsx": """import React from 'react';
import { TelemetryData } from '../types/telemetry';

export const TelemetryPanel: React.FC<{ data: TelemetryData }> = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Live Telemetry</h3>
      <div className="grid grid-cols-2 gap-4">
        <TelemetryItem label="RPM" value={data.rpm.toFixed(0)} unit="RPM" />
        <TelemetryItem label="CHT" value={data.cht.toFixed(1)} unit="°C" />
        <TelemetryItem label="EGT" value={data.egt.toFixed(1)} unit="°C" />
        <TelemetryItem label="Oil Temp" value={data.oilTemp.toFixed(1)} unit="°C" />
        <TelemetryItem label="Oil Pressure" value={data.oilPressure.toFixed(2)} unit="Bar" />
        <TelemetryItem label="Fuel Flow" value={data.fuelFlow.toFixed(1)} unit="L/h" />
        <TelemetryItem label="Battery" value={data.battery.toFixed(1)} unit="%" />
        <TelemetryItem label="Vibration" value={data.vibration.toFixed(2)} unit="mm/s" />
      </div>
    </div>
  );
};

const TelemetryItem = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col">
    <span className="text-xs text-slate-500 mb-1">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-lg font-bold text-slate-800 font-mono">{value}</span>
      <span className="text-xs text-slate-400">{unit}</span>
    </div>
  </div>
);
""",
    "components/ComponentTree.tsx": """import React from 'react';
import { ENGINE_COMPONENTS_REGISTRY } from '../constants/engineComponents';

interface Props {
  selectedComponent: string | null;
  onSelectComponent: (name: string) => void;
}

export const ComponentTree: React.FC<Props> = ({ selectedComponent, onSelectComponent }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-full overflow-y-auto">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Components List</h3>
      <div className="space-y-2">
        {ENGINE_COMPONENTS_REGISTRY.map((comp) => {
          const isSelected = selectedComponent === comp;
          return (
            <button
              key={comp}
              onClick={() => onSelectComponent(comp)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}
            >
              <span className={`text-sm ${isSelected ? 'text-blue-700 font-semibold' : 'text-slate-600'}`}>{comp}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">96%</span>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
""",
    "components/ComponentDetails.tsx": """import React from 'react';

interface Props {
  componentName: string | null;
}

export const ComponentDetails: React.FC<Props> = ({ componentName }) => {
  if (!componentName) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center h-48 text-slate-400 text-sm">
        Select a component to view details
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4">{componentName}</h3>
      <div className="space-y-4">
        <DetailRow label="Health" value="96%" valueColor="text-green-600" />
        <DetailRow label="Status" value="HEALTHY" valueColor="text-green-600" />
        <DetailRow label="Temperature" value="43°C" />
        <DetailRow label="Communication" value="OK" />
        {componentName === 'ECU' && <DetailRow label="Injection Timing" value="14.2°" />}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, valueColor = "text-slate-700" }: { label: string, value: string, valueColor?: string }) => (
  <div className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className={`text-sm font-semibold font-mono ${valueColor}`}>{value}</span>
  </div>
);
""",
    "components/EngineModel.tsx": """import React, { useRef } from 'react';
import { useGLTF, Outlines } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  selectedComponent: string | null;
  onSelectComponent: (name: string) => void;
}

export const EngineModel: React.FC<Props> = ({ selectedComponent, onSelectComponent }) => {
  // Try loading from public/models/rotax915.glb, with a fallback to a box if not found
  try {
    const { scene } = useGLTF('/models/rotax915.glb');
    
    // Traverse and attach click handlers
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.userData = { isComponent: true };
      }
    });

    const handleClick = (e: any) => {
      e.stopPropagation();
      if (e.object) {
        onSelectComponent(e.object.name || 'Main Engine');
      }
    };

    return (
      <primitive 
        object={scene} 
        scale={2} 
        position={[0, -1, 0]} 
        onClick={handleClick}
      />
    );
  } catch (err) {
    // Fallback if model doesn't exist yet
    return (
      <mesh onClick={(e) => { e.stopPropagation(); onSelectComponent('Main Engine'); }}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#475569" />
        {selectedComponent === 'Main Engine' && <Outlines thickness={0.05} color="blue" />}
      </mesh>
    );
  }
};

useGLTF.preload('/models/rotax915.glb');
""",
    "components/EngineViewer.tsx": """import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stage } from '@react-three/drei';
import { EngineModel } from './EngineModel';

interface Props {
  selectedComponent: string | null;
  onSelectComponent: (name: string) => void;
}

export const EngineViewer: React.FC<Props> = ({ selectedComponent, onSelectComponent }) => {
  return (
    <div className="w-full h-[600px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative shadow-inner">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [5, 3, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <directionalLight castShadow position={[10, 10, 10]} intensity={1} shadow-mapSize={[1024, 1024]} />
          
          <Stage environment="city" intensity={0.5}>
            <EngineModel 
              selectedComponent={selectedComponent} 
              onSelectComponent={onSelectComponent} 
            />
          </Stage>
          
          <OrbitControls 
            makeDefault 
            autoRotate={!selectedComponent} 
            autoRotateSpeed={0.5} 
            enablePan={true}
            enableZoom={true}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded text-xs font-semibold text-slate-600 shadow-sm border border-slate-200">
        3D ORBIT CONTROLS ACTIVE
      </div>
    </div>
  );
};
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(BASE_DIR, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Files generated successfully.")
