import os

BASE_DIR = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\modules\digital-twin"

files = {
    "components/EngineViewer.tsx": """import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
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
  const [isInteracting, setIsInteracting] = React.useState(false);
  const [autoRotate, setAutoRotate] = React.useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { setSelectedComponent } = useDigitalTwin();

  const handleInteractionStart = () => {
    setIsInteracting(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleInteractionEnd = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 5000);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const resetCamera = () => {
    setSelectedComponent(null);
    if (orbitRef.current) {
      orbitRef.current.reset();
      orbitRef.current.target.set(0, 0, 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col bg-gradient-to-b from-[#e8e9eb] to-[#f4f5f7]">
      {/* VIEWER CONTROLS PANEL */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 pointer-events-auto">
        <button 
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors border ${autoRotate ? 'bg-blue-600 text-white border-blue-700 shadow' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
        >
          Auto Rotate: {autoRotate ? 'ON' : 'OFF'}
        </button>
        <button onClick={resetCamera} className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          Reset View
        </button>
        <button onClick={resetCamera} className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          Fit Engine
        </button>
        <button onClick={toggleFullscreen} className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-700 transition-colors shadow-sm">
          Full Screen
        </button>
      </div>

      {/* GLB CANVAS */}
      <div className="flex-1 w-full h-full" onPointerMissed={() => resetCamera()}>
        <ErrorBoundary>
          <Canvas 
             shadows 
             dpr={[1, 2]} 
             camera={{ position: [2.5, 1.5, 3], fov: 35, near: 0.1, far: 1000 }} 
             className="w-full h-full outline-none"
          >
            <Suspense fallback={null}>
              <Environment preset="studio" />
              <ambientLight intensity={1.2} />
              <directionalLight castShadow position={[10, 10, 10]} intensity={3} shadow-mapSize={[2048, 2048]} />
              
              <EngineModel viewMode={viewMode} orbitRef={orbitRef} />
              
              <OrbitControls 
                ref={orbitRef}
                makeDefault 
                autoRotate={autoRotate && !isInteracting} 
                autoRotateSpeed={0.5}
                enablePan={true}
                enableZoom={true}
                minPolarAngle={0}
                maxPolarAngle={Math.PI}
                onStart={handleInteractionStart}
                onEnd={handleInteractionEnd}
              />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>
    </div>
  );
};
""",
    "components/EngineModel.tsx": """import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';
import { DigitalTwinViewMode } from '../services/faultVisualizationEngine';
import { useGcs } from '../../../contexts/GcsContext';

interface Props {
  viewMode: DigitalTwinViewMode;
  orbitRef?: any;
}

export const EngineModel: React.FC<Props> = ({ viewMode, orbitRef }) => {
  const { scene } = useGLTF('/model/rotax915.glb');
  const { components, transparentMode, explodedView, selectedComponent, setSelectedComponent } = useDigitalTwin();
  const { telemetry } = useGcs();
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  
  const { camera } = useThree();
  const focusTarget = useRef<{ pos: THREE.Vector3, target: THREE.Vector3 } | null>(null);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Hide baked-in floors or showroom planes if they exist in the GLB
    clone.traverse((child) => {
      const compName = child.name || 'Main Engine';
      const lowerName = compName.toLowerCase();
      if (lowerName.includes('floor') || lowerName.includes('ground') || lowerName.includes('plane') || lowerName.includes('shadow')) {
         child.visible = false;
      }
    });

    let box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    const scaleFactor = 2 / (maxDim || 1);
    clone.scale.setScalar(scaleFactor);
    
    box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!mesh.geometry) return; 
        
        const compName = mesh.name || 'Main Engine';
        
        let origMat = mesh.material as any;
        if (Array.isArray(origMat)) {
          origMat = origMat[0];
        }
        if (!origMat) {
           origMat = new THREE.MeshStandardMaterial();
           mesh.material = origMat;
        }

        mesh.userData = { 
          isComponent: true, 
          name: compName, 
          originalPos: mesh.position.clone(),
          originalColor: origMat.color ? origMat.color.clone() : undefined,
          originalEmissive: origMat.emissive ? origMat.emissive.clone() : undefined,
          originalOpacity: origMat.opacity !== undefined ? origMat.opacity : 1.0,
          hasColor: !!origMat.color,
          hasEmissive: !!origMat.emissive
        };
        
        mesh.material = origMat.clone();
        if (mesh.material.transparent === undefined) {
          mesh.material.transparent = true;
        }
      }
    });
    return clone;
  }, [scene]);

  // Compute camera target when selectedComponent changes
  useEffect(() => {
    if (selectedComponent && groupRef.current) {
      let targetMesh: THREE.Mesh | null = null;
      groupRef.current.traverse((c: any) => {
        if (c.userData.name === selectedComponent) targetMesh = c;
      });
      if (targetMesh) {
        const box = new THREE.Box3().setFromObject(targetMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Calculate offset position for camera
        const offset = new THREE.Vector3(1, 0.5, 1).normalize().multiplyScalar(maxDim * 3 + 1);
        const camPos = center.clone().add(offset);
        
        focusTarget.current = { pos: camPos, target: center };
      }
    } else {
      focusTarget.current = null;
    }
  }, [selectedComponent]);

  // Animation Loop (Vibration, Exploded View, Transparency, Thermal, Focus)
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Smooth Camera Focus Interpolation
    if (focusTarget.current && orbitRef?.current) {
      camera.position.lerp(focusTarget.current.pos, 0.05);
      orbitRef.current.target.lerp(focusTarget.current.target, 0.05);
    }

    if (!groupRef.current) return;
    
    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.userData.name;
        const compData = components[name] || components['Main Engine'];
        
        let mat = mesh.material as any;
        if (Array.isArray(mat)) mat = mat[0];
        if (!mat) return;

        const origColor = mesh.userData.originalColor;
        const origEmissive = mesh.userData.originalEmissive;
        const origOpacity = mesh.userData.originalOpacity !== undefined ? mesh.userData.originalOpacity : 1.0;
        const origPos = mesh.userData.originalPos as THREE.Vector3;
        const hasColor = mesh.userData.hasColor;
        const hasEmissive = mesh.userData.hasEmissive;

        // RPM Rotation Logic (shaft, fan, turbo)
        const lowerName = name.toLowerCase();
        if (lowerName.includes('turbo') || lowerName.includes('fan') || lowerName.includes('shaft') || lowerName.includes('prop')) {
           const rpm = telemetry?.rpm || 0;
           mesh.rotation.z = time * (rpm / 60) * Math.PI; // basic rotation scaled by RPM
        }

        // Base Reset
        if (hasColor && mat.color && origColor) {
           mat.color.lerp(origColor, 0.1);
        }
        if (mat.opacity !== undefined) {
           mat.opacity = THREE.MathUtils.lerp(mat.opacity, origOpacity, 0.1);
        }
        
        // Focus Mode Logic: Ghost non-selected components
        if (selectedComponent) {
          if (name !== selectedComponent) {
             if (mat.opacity !== undefined) mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.08, 0.1);
             mat.transparent = true;
          } else {
             // Selected part glow & pulse
             if (mat.opacity !== undefined) mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.1);
             if (hasEmissive && mat.emissive) {
                if (compData.status === 'CRITICAL' || compData.health <= 40) {
                   // Fast Red Pulse
                   mat.emissive.setHex(0xff0000);
                   mat.emissiveIntensity = 0.5 + Math.sin(time * 15) * 1.5;
                } else if (compData.health < 90) {
                   // Slow Orange Pulse
                   mat.emissive.setHex(0xffa500);
                   mat.emissiveIntensity = 0.5 + Math.sin(time * 5) * 1.0;
                } else {
                   // Healthy Blue Glow
                   mat.emissive.setHex(0x3b82f6);
                   mat.emissiveIntensity = 1.5;
                }
             }
          }
          return; // Skip normal view mode overrides when focusing
        }

        // View Modes Handling (Normal, Thermal, etc) if NOT focusing
        
        // 1. Transparency Mode
        if (viewMode === 'TRANSPARENT' && lowerName.includes('casing') && mat.opacity !== undefined) {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.2, 0.1);
        }

        // 2. Exploded View
        if (viewMode === 'EXPLODED_VIEW' && origPos) {
          const dir = origPos.clone().normalize();
          mesh.position.lerp(origPos.clone().add(dir.multiplyScalar(2)), 0.05);
        } else if (origPos) {
          mesh.position.lerp(origPos, 0.1);
        }

        // 3. Vibration & Pressure
        if (origPos) {
          let offsetX = 0;
          let offsetY = 0;
          
          if (viewMode === 'VIBRATION' && compData.vibration > 0) {
            const intensity = compData.vibration * 0.01;
            offsetX += Math.sin(time * 50) * intensity;
            offsetY += Math.cos(time * 50) * intensity;
          }
          
          if (lowerName.includes('cylinder') || lowerName.includes('injector')) {
             const pressPulse = Math.sin(time * 20) * 0.02 * (compData.pressure / 10);
             mesh.scale.setScalar(1 + pressPulse);
          } else {
             mesh.scale.setScalar(1);
          }

          mesh.position.x = origPos.x + offsetX;
          mesh.position.y = origPos.y + offsetY;
        }

        // 4. Thermal / Component Health Visualizations
        if (viewMode === 'THERMAL' && hasColor && mat.color) {
          const t = Math.max(0, Math.min(1, (compData.temperature - 50) / 200));
          const color = new THREE.Color().setHSL((1 - t) * 0.6, 1.0, 0.5);
          mat.color.lerp(color, 0.1);
          if (hasEmissive && mat.emissive && origEmissive) {
             mat.emissive.copy(origEmissive);
             mat.emissiveIntensity = 1;
          }
        } else if (viewMode === 'COMPONENT_HEALTH') {
           if (hasColor && mat.color) {
             let targetColor = new THREE.Color(0x22c55e); // Green
             if (compData.health < 40 || compData.status === 'CRITICAL') targetColor.setHex(0xef4444); // Red
             else if (compData.health < 70) targetColor.setHex(0xf97316); // Orange
             else if (compData.health < 90) targetColor.setHex(0xeab308); // Yellow
             mat.color.lerp(targetColor, 0.1);
           }
           if (hasEmissive && mat.emissive && origEmissive) {
             mat.emissive.copy(origEmissive);
             mat.emissiveIntensity = 1;
           }
        } else {
          // Normal mode picking glow
          if (hovered === name) {
            if (hasEmissive && mat.emissive) {
               mat.emissive.setHex(0x3b82f6);
               mat.emissiveIntensity = 0.5;
            }
          } else {
            if (hasEmissive && mat.emissive && origEmissive) {
               mat.emissive.copy(origEmissive);
               mat.emissiveIntensity = 1;
            }
          }
        }
      }
    });
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (e.object) {
      const name = e.object.userData.name;
      setSelectedComponent(name);
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
      {selectedComponent && <InspectionLeader name={selectedComponent} scene={clonedScene} />}
    </group>
  );
};

const InspectionLeader = ({ name, scene }: any) => {
  const targetMesh = useMemo(() => {
    let found: THREE.Mesh | null = null;
    scene.traverse((c: any) => {
      if (c.userData.name === name) found = c;
    });
    return found;
  }, [name, scene]);

  const pos = targetMesh ? new THREE.Vector3().setFromMatrixPosition(targetMesh.matrixWorld) : new THREE.Vector3();
  const endPoint = new THREE.Vector3(5, 2, 0);
  const lineRef = useRef<THREE.Line>(null);
  
  // Animate dots along line
  useFrame((state) => {
    if (lineRef.current?.material) {
      const mat = lineRef.current.material as THREE.LineDashedMaterial;
      mat.dashOffset -= 0.05; // Moving dashes effect
    }
  });
  
  React.useLayoutEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    if (!line.geometry) return;
    if (!line.geometry.attributes?.position) return;
    if (!line.geometry.index && line.geometry.attributes.position.count === 0) return;
    try {
      line.computeLineDistances();
    } catch (e) {
      console.warn("Could not compute line distances:", e);
    }
  }, [pos, endPoint]);

  return (
    <group>
      <line ref={lineRef}>
        <bufferGeometry attach="geometry" setFromPoints={[pos, endPoint]} />
        <lineDashedMaterial attach="material" color="#3b82f6" dashSize={0.1} gapSize={0.1} linewidth={2} transparent opacity={0.8} />
      </line>
      <mesh position={pos}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      <mesh position={endPoint}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
    </group>
  );
};
useGLTF.preload('/model/rotax915.glb');
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(BASE_DIR, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Focus mode generated successfully.")
