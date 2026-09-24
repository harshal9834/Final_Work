import os

BASE_DIR = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\modules\digital-twin"

files = {
    "components/EngineModel.tsx": """import React, { useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
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
  // Suspension handles loading state. Error boundary handles failure.
  const { scene } = useGLTF('/models/rotax915.glb');
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Auto-center and fit
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    
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
      onClick={handleClick}
    />
  );
};

useGLTF.preload('/models/rotax915.glb');
""",
    "components/EngineViewer.tsx": """import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stage, Bounds } from '@react-three/drei';
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

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <div className="flex items-center justify-center h-full w-full text-red-500 font-bold bg-slate-50 rounded-xl">Engine Model Failed To Load</div>;
    }
    return this.props.children;
  }
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
      
      <ErrorBoundary>
        <Canvas shadows dpr={[1, 2]} camera={{ position: [5, 3, 5], fov: 45 }} className="flex-1">
          <Suspense fallback={null}>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <directionalLight castShadow position={[10, 10, 10]} intensity={1} shadow-mapSize={[1024, 1024]} />
            
            <Bounds fit clip observe margin={1.2}>
              <EngineModel 
                selectedComponent={selectedComponent} 
                onSelectComponent={onSelectComponent} 
                viewMode={viewMode}
                telemetry={telemetry}
                activeFaults={activeFaults}
                componentHealthMap={componentHealthMap}
              />
            </Bounds>
            
            <OrbitControls 
              makeDefault 
              autoRotate={!selectedComponent} 
              autoRotateSpeed={0.5} 
              enablePan={true}
              enableZoom={true}
              minPolarAngle={0}
              maxPolarAngle={Math.PI}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded text-xs font-semibold text-slate-600 shadow-sm border border-slate-200">
        3D ORBIT CONTROLS ACTIVE
      </div>
    </div>
  );
};
""",
    "components/AIPredictionPanel.tsx": """import React from 'react';

export const AIPredictionPanel: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        AI Analysis Status
      </h3>
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center text-center">
        <span className="text-slate-500 font-medium mb-2">Waiting for AI Analytics Engine</span>
        <div className="grid grid-cols-2 gap-4 w-full text-xs mt-2 text-left">
          <div className="bg-white p-2 rounded border border-slate-200">
            <span className="text-slate-400 block mb-1">Status</span>
            <span className="font-bold text-slate-700">Connected</span>
          </div>
          <div className="bg-white p-2 rounded border border-slate-200">
            <span className="text-slate-400 block mb-1">Source</span>
            <span className="font-bold text-slate-700">Telemetry Stream</span>
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

print("Phase 2 Refinements generated.")
