import os

BASE_DIR = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\modules\digital-twin"

files = {
    "contexts/DigitalTwinContext.tsx": """import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useGcs } from '../../../contexts/GcsContext';

export interface ComponentState {
  id: string;
  name: string;
  health: number;
  temperature: number;
  pressure: number;
  vibration: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  activeFaults: string[];
}

interface DigitalTwinState {
  components: Record<string, ComponentState>;
  twinSync: number;
  transparentMode: boolean;
  explodedView: boolean;
  setTransparentMode: (v: boolean) => void;
  setExplodedView: (v: boolean) => void;
  selectedComponent: string | null;
  setSelectedComponent: (id: string | null) => void;
}

const DigitalTwinContext = createContext<DigitalTwinState | undefined>(undefined);

export const DigitalTwinProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { telemetry, activeFaults } = useGcs();
  const [transparentMode, setTransparentMode] = useState(false);
  const [explodedView, setExplodedView] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const state = useMemo(() => {
    // Generate component states based on telemetry
    const components: Record<string, ComponentState> = {};
    const faultNames = activeFaults.map(f => f.name);
    
    // Helper to generate state
    const gen = (name: string, baseTemp: number, baseVib: number): ComponentState => {
      const compFaults = faultNames.filter(f => f.includes(name) || (name === 'Main Engine' && f.includes('Misfire')));
      const health = compFaults.length > 0 ? 40 : 100;
      return {
        id: name,
        name,
        health,
        temperature: baseTemp + (compFaults.includes('Overheating') ? 50 : 0),
        pressure: telemetry?.oilPressureBar || 4.2,
        vibration: baseVib + (compFaults.length > 0 ? 2 : 0),
        status: health > 80 ? 'HEALTHY' : health > 50 ? 'WARNING' : 'CRITICAL',
        activeFaults: compFaults
      };
    };

    components['Main Engine'] = gen('Main Engine', telemetry?.chtC?.[0] || 212, telemetry?.vibrationRmsMmS || 3.1);
    components['Intercooler'] = gen('Intercooler', telemetry?.ambientTempC || 25, 1.0);
    components['Turbocharger'] = gen('Turbocharger', telemetry?.egtC?.[0] || 720, 4.5);
    components['Gearbox'] = gen('Gearbox', telemetry?.oilTempC || 90, telemetry?.vibrationRmsMmS || 3.1);
    
    return {
      components,
      twinSync: 99.8,
      transparentMode,
      setTransparentMode,
      explodedView,
      setExplodedView,
      selectedComponent,
      setSelectedComponent
    };
  }, [telemetry, activeFaults, transparentMode, explodedView, selectedComponent]);

  return <DigitalTwinContext.Provider value={state}>{children}</DigitalTwinContext.Provider>;
};

export const useDigitalTwin = () => {
  const ctx = useContext(DigitalTwinContext);
  if (!ctx) throw new Error("useDigitalTwin must be used within DigitalTwinProvider");
  return ctx;
};
""",
    "components/EngineModel.tsx": """import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useGLTF, Html, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';
import { DigitalTwinViewMode } from '../services/faultVisualizationEngine';
import { useGcs } from '../../../contexts/GcsContext';

interface Props {
  viewMode: DigitalTwinViewMode;
}

export const EngineModel: React.FC<Props> = ({ viewMode }) => {
  console.log('Loading GLB');
  const { scene } = useGLTF('/model/rotax915.glb');
  const { components, transparentMode, explodedView, selectedComponent, setSelectedComponent } = useDigitalTwin();
  const { telemetry } = useGcs();
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    clone.position.sub(center);
    
    let meshCount = 0;
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshCount++;
        const mesh = child as THREE.Mesh;
        const compName = mesh.name || 'Main Engine';
        mesh.userData = { 
          isComponent: true, 
          name: compName, 
          originalPos: mesh.position.clone(),
          originalMat: mesh.material
        };
        
        // Clone material so we can animate it
        mesh.material = (mesh.material as THREE.Material).clone();
        if ((mesh.material as THREE.MeshStandardMaterial).transparent === undefined) {
          (mesh.material as THREE.MeshStandardMaterial).transparent = true;
        }
      }
    });

    console.log('[GLB Debug] GLB Loaded');
    console.log(`[GLB Debug] Mesh count: ${meshCount}`);
    console.log(`[GLB Debug] Bounding box size: [${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)}]`);
    
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

        // 1. Transparency Mode
        if (transparentMode && name.toLowerCase().includes('casing')) {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.2, 0.1);
        } else {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.1);
        }

        // 2. Exploded View
        const origPos = mesh.userData.originalPos as THREE.Vector3;
        if (explodedView) {
          const dir = origPos.clone().normalize();
          mesh.position.lerp(origPos.clone().add(dir.multiplyScalar(2)), 0.05);
        } else {
          mesh.position.lerp(origPos, 0.1);
        }

        // 3. Vibration
        if (viewMode === 'VIBRATION' && compData.vibration > 0) {
          const intensity = compData.vibration * 0.01;
          mesh.position.x = mesh.position.x + Math.sin(time * 50) * intensity;
          mesh.position.y = mesh.position.y + Math.cos(time * 50) * intensity;
        }

        // 4. Thermal / Fault Color
        if (viewMode === 'THERMAL') {
          const t = Math.max(0, Math.min(1, (compData.temperature - 50) / 200));
          const color = new THREE.Color().setHSL((1 - t) * 0.6, 1.0, 0.5);
          mat.color.lerp(color, 0.1);
        } else if (compData.status === 'CRITICAL') {
          // Fault Blinking
          const blink = Math.sin(time * 10) > 0 ? 1 : 0.2;
          mat.color.setRGB(1, 1 - blink, 1 - blink);
          mat.emissive.setRGB(1, 0, 0);
          mat.emissiveIntensity = blink * 0.5;
        } else {
          // Normal
          if (hovered === name || selectedComponent === name) {
            mat.emissive.setHex(0x3366ff);
            mat.emissiveIntensity = 0.3;
          } else {
            mat.color.setHex(0xffffff);
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
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
      {selectedComponent && <InspectionLeader name={selectedComponent} scene={clonedScene} components={components} />}
    </group>
  );
};

const InspectionLeader = ({ name, scene, components }: any) => {
  const compData = components[name] || components['Main Engine'];
  
  // Find mesh center for leader line
  const targetMesh = useMemo(() => {
    let found: THREE.Mesh | null = null;
    scene.traverse((c: any) => {
      if (c.userData.name === name) found = c;
    });
    return found;
  }, [name, scene]);

  const pos = targetMesh ? new THREE.Vector3().setFromMatrixPosition(targetMesh.matrixWorld) : new THREE.Vector3();

  return (
    <group position={pos}>
      <Html position={[2, 2, 0]} center>
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-lg p-4 w-64 text-sm pointer-events-auto">
          <div className="font-bold border-b pb-2 mb-2 flex justify-between items-center text-slate-800">
            {name}
            <span className={`px-2 py-0.5 rounded text-xs text-white ${compData.status === 'CRITICAL' ? 'bg-red-500' : compData.status === 'WARNING' ? 'bg-amber-500' : 'bg-green-500'}`}>
              {compData.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <div className="text-slate-500">Health</div><div className="font-mono font-bold">{compData.health}%</div>
            <div className="text-slate-500">Temp</div><div className="font-mono font-bold">{compData.temperature}°C</div>
            <div className="text-slate-500">Vibration</div><div className="font-mono font-bold">{compData.vibration} mm/s</div>
          </div>
          {compData.activeFaults.length > 0 && (
            <div className="mt-3 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-100 font-bold">
              FAULTS: {compData.activeFaults.join(', ')}
            </div>
          )}
        </div>
      </Html>
      
      {/* Dashed Leader Line */}
      <line>
        <bufferGeometry attach="geometry" setFromPoints={[new THREE.Vector3(0,0,0), new THREE.Vector3(2,2,0)]} />
        <lineDashedMaterial attach="material" color="#3366ff" dashSize={0.2} gapSize={0.1} />
      </line>
    </group>
  );
};

useGLTF.preload('/model/rotax915.glb');
""",
    "components/EngineViewer.tsx": """import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Bounds } from '@react-three/drei';
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
  const modes: DigitalTwinViewMode[] = ['NORMAL', 'THERMAL', 'STRESS', 'VIBRATION', 'COMPONENT_HEALTH'];
  const { transparentMode, setTransparentMode, explodedView, setExplodedView } = useDigitalTwin();
  
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
        <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>
        <button 
          onClick={() => setTransparentMode(!transparentMode)}
          className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${transparentMode ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
        >
          X-RAY
        </button>
        <button 
          onClick={() => setExplodedView(!explodedView)}
          className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${explodedView ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
        >
          EXPLODE
        </button>
      </div>
      
      <ErrorBoundary>
        <Canvas shadows dpr={[1, 2]} camera={{ position: [5, 3, 5], fov: 45 }} className="flex-1">
          <Suspense fallback={null}>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <directionalLight castShadow position={[10, 10, 10]} intensity={1} shadow-mapSize={[1024, 1024]} />
            
            <Bounds fit clip observe margin={1.2}>
              <EngineModel viewMode={viewMode} />
            </Bounds>
            
            <OrbitControls 
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
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded text-xs font-semibold text-slate-600 shadow-sm border border-slate-200">
        DEFENCE GRADE TWIN ONLINE
      </div>
    </div>
  );
};
""",
    "components/TwinLayout.tsx": """import React, { useState } from 'react';
import { EngineViewer } from './EngineViewer';
import { TwinStatusBar } from './TwinStatusBar';
import { AIPredictionPanel } from './AIPredictionPanel';
import { SystemAlerts } from './SystemAlerts';
import { MissionStatusPanel } from './MissionStatusPanel';
import { DigitalTwinViewMode } from '../services/faultVisualizationEngine';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';
import { useGcs } from '../../../contexts/GcsContext';
import { useEngineHealth } from '../hooks/useEngineHealth';

export const TwinLayout: React.FC = () => {
  const [viewMode, setViewMode] = useState<DigitalTwinViewMode>('NORMAL');
  const { twinSync, components, selectedComponent } = useDigitalTwin();
  const { telemetry, activeFaults } = useGcs();
  
  const internalTelemetry = {
    ...telemetry,
    cht: telemetry?.chtC?.[0] || 212,
    rpm: telemetry?.rpm || 4320,
    timestamp: Date.now()
  };
  const health = useEngineHealth(internalTelemetry);
  
  let missionStatus = "GROUND_IDLE";
  if (internalTelemetry.rpm > 5000) missionStatus = "TAKEOFF";
  else if (internalTelemetry.rpm > 4500) missionStatus = "CRUISE";

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <TwinStatusBar 
          health={health} 
          telemetryTimestamp={internalTelemetry.timestamp} 
          activeFaultsCount={activeFaults.length}
          missionStatus={missionStatus}
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 relative h-[700px]">
              <EngineViewer viewMode={viewMode} setViewMode={setViewMode} />
            </div>
          </div>
          <div className="lg:col-span-3 space-y-6 h-[700px] overflow-y-auto pr-2">
            {selectedComponent && (
              <div className="bg-indigo-900 text-white p-4 rounded-xl shadow-lg border border-indigo-800">
                <h3 className="font-bold tracking-widest text-xs opacity-70 mb-2">INSPECTION FOCUS</h3>
                <div className="text-xl font-bold">{selectedComponent}</div>
                <div className="mt-2 text-sm">Health: {components[selectedComponent]?.health}%</div>
              </div>
            )}
            <AIPredictionPanel />
            <MissionStatusPanel telemetry={internalTelemetry} />
            <SystemAlerts activeFaults={activeFaults.map(f => f.name)} />
          </div>
        </div>
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

print("Phase 3 advanced files generated successfully.")
