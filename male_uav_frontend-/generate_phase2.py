import os

BASE_DIR = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\modules\digital-twin"

files = {
    "services/componentHealthEngine.ts": """import { TelemetryData } from '../types/telemetry';

export interface ComponentHealthStatus {
  health: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  temperature: number;
  pressure: number;
  vibration: number;
}

export function calculateComponentHealth(componentId: string, telemetry: TelemetryData, activeFaults: string[]): ComponentHealthStatus {
  let health = 100;
  let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
  
  // Base logic for each component
  let temp = 40;
  let pres = 1.0;
  let vib = telemetry.vibration;
  
  if (componentId === 'Main Engine') {
    temp = telemetry.cht;
    pres = telemetry.oilPressure;
    health = 100 - (telemetry.cht > 230 ? (telemetry.cht - 230) * 2 : 0);
  } else if (componentId === 'ECU') {
    temp = 45;
  } else if (componentId === 'Intercooler') {
    temp = telemetry.egt > 700 ? 80 : 50;
    if (activeFaults.includes('Cooling Degradation') || activeFaults.includes('Overheating')) health -= 30;
  } else if (componentId === 'Oil Tank') {
    temp = telemetry.oilTemp;
    pres = telemetry.oilPressure;
    if (activeFaults.includes('Lubrication Failure')) health -= 40;
  } else if (componentId === 'Ambient Sensor') {
    if (activeFaults.includes('Sensor Drift')) health -= 20;
  }
  
  if (activeFaults.includes('Misfire') && componentId === 'Main Engine') health -= 50;
  if (activeFaults.includes('Overheating') && componentId === 'Main Engine') health -= 40;

  health = Math.max(0, Math.min(100, health));
  
  if (health < 75) status = 'CRITICAL';
  else if (health < 90) status = 'WARNING';
  
  return { health, status, temperature: temp, pressure: pres, vibration: vib };
}
""",
    "services/faultVisualizationEngine.ts": """import { Color } from 'three';

export type DigitalTwinViewMode = 'NORMAL' | 'THERMAL' | 'STRESS' | 'VIBRATION' | 'COMPONENT_HEALTH';

export function getComponentColor(componentName: string, mode: DigitalTwinViewMode, telemetry: any, activeFaults: string[], componentHealth: number): string | null {
  // Fault overrides (highest priority)
  if (mode === 'NORMAL' || mode === 'COMPONENT_HEALTH') {
    if (activeFaults.includes('Misfire') && componentName === 'Main Engine') return '#ef4444'; // Red
    if (activeFaults.includes('Overheating') && (componentName === 'Main Engine' || componentName === 'Intercooler')) return '#f97316'; // Orange
    if (activeFaults.includes('Lubrication Failure') && componentName === 'Oil Tank') return '#ef4444';
    if (activeFaults.includes('Sensor Drift') && componentName === 'Ambient Sensor') return '#eab308'; // Yellow
    if (activeFaults.includes('Cooling Degradation') && componentName === 'Intercooler') return '#f97316';
  }

  // View modes
  if (mode === 'THERMAL') {
    const temp = componentName === 'Main Engine' ? telemetry.cht : (componentName === 'Oil Tank' ? telemetry.oilTemp : 50);
    if (temp > 220) return '#ef4444';
    if (temp > 180) return '#f97316';
    if (temp > 120) return '#eab308';
    if (temp > 70) return '#22c55e';
    return '#3b82f6';
  }

  if (mode === 'STRESS') {
    const stress = telemetry.rpm > 5500 ? 'high' : (telemetry.rpm > 4500 ? 'elevated' : 'safe');
    if (stress === 'high') return '#ef4444';
    if (stress === 'elevated') return '#eab308';
    return '#22c55e';
  }

  if (mode === 'VIBRATION') {
    const vib = telemetry.vibration;
    if (vib > 4.5) return '#ef4444';
    if (vib > 3.0) return '#eab308';
    return '#8b5cf6';
  }

  if (mode === 'COMPONENT_HEALTH') {
    if (componentHealth < 75) return '#ef4444';
    if (componentHealth < 90) return '#eab308';
    return '#22c55e';
  }

  return null; // Original material color
}
""",
    "hooks/useComponentHealth.ts": """import { useState, useEffect } from 'react';
import { TelemetryData } from '../types/telemetry';
import { calculateComponentHealth, ComponentHealthStatus } from '../services/componentHealthEngine';
import { ENGINE_COMPONENTS_REGISTRY } from '../constants/engineComponents';

export function useComponentHealth(telemetry: TelemetryData, activeFaults: string[]) {
  const [registry, setRegistry] = useState<Record<string, ComponentHealthStatus>>({});

  useEffect(() => {
    const newRegistry: Record<string, ComponentHealthStatus> = {};
    ENGINE_COMPONENTS_REGISTRY.forEach(comp => {
      newRegistry[comp] = calculateComponentHealth(comp, telemetry, activeFaults);
    });
    setRegistry(newRegistry);
  }, [telemetry, activeFaults]);

  return registry;
}
""",
    "components/EngineModel.tsx": """import React, { useRef, useMemo } from 'react';
import { useGLTF, Outlines } from '@react-three/drei';
import * as THREE from 'three';
import { getComponentColor, DigitalTwinViewMode } from '../services/faultVisualizationEngine';

interface Props {
  selectedComponent: string | null;
  onSelectComponent: (name: string) => void;
  viewMode: DigitalTwinViewMode;
  telemetry: any;
  activeFaults: string[];
  componentHealthMap: Record<string, any>;
}

export const EngineModel: React.FC<Props> = ({ selectedComponent, onSelectComponent, viewMode, telemetry, activeFaults, componentHealthMap }) => {
  try {
    const { scene, materials } = useGLTF('/models/rotax915.glb');
    
    const clonedScene = useMemo(() => {
      const clone = scene.clone();
      
      clone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const compName = mesh.name || 'Main Engine';
          mesh.userData = { isComponent: true, name: compName };
          
          // Apply visualization colors
          const health = componentHealthMap[compName]?.health || 100;
          const targetColor = getComponentColor(compName, viewMode, telemetry, activeFaults, health);
          
          if (targetColor) {
            // Create a unique material instance so we can change color
            mesh.material = (mesh.material as THREE.Material).clone();
            (mesh.material as THREE.MeshStandardMaterial).color.set(targetColor);
            (mesh.material as THREE.MeshStandardMaterial).emissive.set(targetColor);
            (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
          }
        }
      });
      return clone;
    }, [scene, viewMode, telemetry.timestamp, activeFaults, componentHealthMap]);

    const handleClick = (e: any) => {
      e.stopPropagation();
      if (e.object) {
        onSelectComponent(e.object.userData.name || 'Main Engine');
      }
    };

    return (
      <primitive 
        object={clonedScene} 
        scale={2} 
        position={[0, -1, 0]} 
        onClick={handleClick}
      />
    );
  } catch (err) {
    const compName = 'Main Engine';
    const health = componentHealthMap[compName]?.health || 100;
    const color = getComponentColor(compName, viewMode, telemetry, activeFaults, health) || '#475569';
    return (
      <mesh onClick={(e) => { e.stopPropagation(); onSelectComponent('Main Engine'); }}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={color} />
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
import { DigitalTwinViewMode } from '../services/faultVisualizationEngine';

interface Props {
  selectedComponent: string | null;
  onSelectComponent: (name: string) => void;
  viewMode: DigitalTwinViewMode;
  setViewMode: (mode: DigitalTwinViewMode) => void;
  telemetry: any;
  activeFaults: string[];
  componentHealthMap: Record<string, any>;
}

export const EngineViewer: React.FC<Props> = ({ selectedComponent, onSelectComponent, viewMode, setViewMode, telemetry, activeFaults, componentHealthMap }) => {
  const modes: DigitalTwinViewMode[] = ['NORMAL', 'THERMAL', 'STRESS', 'VIBRATION', 'COMPONENT_HEALTH'];
  
  return (
    <div className="w-full h-full bg-slate-100 rounded-xl overflow-hidden relative shadow-inner flex flex-col">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 p-1.5 rounded-lg shadow-sm border border-slate-200 flex gap-1">
        {modes.map(mode => (
          <button 
            key={mode} 
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${viewMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            {mode.replace('_', ' ')}
          </button>
        ))}
      </div>
      
      <Canvas shadows dpr={[1, 2]} camera={{ position: [5, 3, 5], fov: 45 }} className="flex-1">
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <directionalLight castShadow position={[10, 10, 10]} intensity={1} shadow-mapSize={[1024, 1024]} />
          
          <Stage environment="city" intensity={0.5}>
            <EngineModel 
              selectedComponent={selectedComponent} 
              onSelectComponent={onSelectComponent} 
              viewMode={viewMode}
              telemetry={telemetry}
              activeFaults={activeFaults}
              componentHealthMap={componentHealthMap}
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
    </div>
  );
};
""",
    "components/PhysicsDiagnostics.tsx": """import React from 'react';

export const PhysicsDiagnostics: React.FC<{ telemetry: any }> = ({ telemetry }) => {
  const combustionEfficiency = Math.max(50, 94 - (telemetry.cht > 230 ? 10 : 0));
  const thermalEfficiency = Math.max(50, 91 - (telemetry.oilTemp > 105 ? 5 : 0));
  const cooling = Math.max(0, 100 - (telemetry.cht > 200 ? telemetry.cht - 200 : 0));
  
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Physics Diagnostics</h3>
      <div className="space-y-3">
        <DiagnosticRow label="Combustion Efficiency" value={`${combustionEfficiency.toFixed(1)}%`} />
        <DiagnosticRow label="Thermal Efficiency" value={`${thermalEfficiency.toFixed(1)}%`} />
        <DiagnosticRow label="Cooling Effectiveness" value={`${cooling.toFixed(1)}%`} />
        <DiagnosticRow label="Mechanical Load" value={`${((telemetry.rpm / 5800) * 100).toFixed(1)}%`} />
      </div>
    </div>
  );
};

const DiagnosticRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-slate-600">{label}</span>
    <span className="font-mono font-semibold text-slate-800">{value}</span>
  </div>
);
""",
    "components/SystemAlerts.tsx": """import React from 'react';

export const SystemAlerts: React.FC<{ activeFaults: string[] }> = ({ activeFaults }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6 h-48 overflow-y-auto">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">System Alerts</h3>
      {activeFaults.length === 0 ? (
        <div className="text-sm text-slate-500">No active alerts. System operating normally.</div>
      ) : (
        <div className="space-y-2">
          {activeFaults.map((fault, i) => (
            <div key={i} className="bg-red-50 border-l-4 border-red-500 p-2 text-sm text-red-700">
              <strong>WARNING:</strong> {fault} detected!
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
""",
    "components/MissionStatusPanel.tsx": """import React from 'react';

export const MissionStatusPanel: React.FC<{ telemetry: any }> = ({ telemetry }) => {
  const rpm = telemetry.rpm;
  let mission = "GROUND_IDLE";
  if (rpm > 5000) mission = "TAKEOFF";
  else if (rpm > 4500) mission = "CRUISE";
  
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Mission Status</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-500">Mission Phase</div>
          <div className="font-bold text-slate-800">{mission}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Engine Load</div>
          <div className="font-bold text-slate-800">{((rpm / 5800) * 100).toFixed(0)}%</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Altitude</div>
          <div className="font-bold text-slate-800">5200 m</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Environment</div>
          <div className="font-bold text-slate-800">Moderate</div>
        </div>
      </div>
    </div>
  );
};
""",
    "components/ComponentTree.tsx": """import React from 'react';
import { ENGINE_COMPONENTS_REGISTRY } from '../constants/engineComponents';
import { ComponentHealthStatus } from '../services/componentHealthEngine';

interface Props {
  selectedComponent: string | null;
  onSelectComponent: (name: string) => void;
  healthMap: Record<string, ComponentHealthStatus>;
}

export const ComponentTree: React.FC<Props> = ({ selectedComponent, onSelectComponent, healthMap }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-full overflow-y-auto">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Components List</h3>
      <div className="space-y-2">
        {ENGINE_COMPONENTS_REGISTRY.map((comp) => {
          const isSelected = selectedComponent === comp;
          const stat = healthMap[comp];
          const colorClass = stat?.status === 'CRITICAL' ? 'bg-red-500' : (stat?.status === 'WARNING' ? 'bg-yellow-500' : 'bg-green-500');
          
          return (
            <button
              key={comp}
              onClick={() => onSelectComponent(comp)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}
            >
              <span className={`text-sm truncate mr-2 ${isSelected ? 'text-blue-700 font-semibold' : 'text-slate-600'}`}>{comp}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-mono text-slate-400">{stat?.health.toFixed(0) || 100}%</span>
                <div className={`w-2 h-2 rounded-full ${colorClass}`} />
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
import { ComponentHealthStatus } from '../services/componentHealthEngine';

interface Props {
  componentName: string | null;
  healthMap: Record<string, ComponentHealthStatus>;
}

export const ComponentDetails: React.FC<Props> = ({ componentName, healthMap }) => {
  if (!componentName) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center h-48 text-slate-400 text-sm">
        Select a component to view details
      </div>
    );
  }

  const stat = healthMap[componentName];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4">{componentName}</h3>
      <div className="space-y-4">
        <DetailRow label="Health" value={`${stat?.health.toFixed(1) || 100}%`} valueColor={stat?.status === 'CRITICAL' ? 'text-red-600' : stat?.status === 'WARNING' ? 'text-yellow-600' : 'text-green-600'} />
        <DetailRow label="Status" value={stat?.status || 'HEALTHY'} valueColor={stat?.status === 'CRITICAL' ? 'text-red-600' : stat?.status === 'WARNING' ? 'text-yellow-600' : 'text-green-600'} />
        <DetailRow label="Temperature" value={`${stat?.temperature.toFixed(1) || 40}°C`} />
        <DetailRow label="Pressure" value={`${stat?.pressure.toFixed(1) || 1.0} Bar`} />
        <DetailRow label="Vibration" value={`${stat?.vibration.toFixed(2) || 0} mm/s`} />
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
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(BASE_DIR, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Phase 2 internal files generated successfully.")
