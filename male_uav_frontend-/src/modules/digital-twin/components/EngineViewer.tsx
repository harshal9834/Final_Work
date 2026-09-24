import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EngineModel } from './EngineModel';
import { DigitalTwinViewMode } from '../services/faultVisualizationEngine';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';
import { AerospaceEnvironment } from './AerospaceEnvironment';

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
    <div className="w-full h-full relative flex flex-col bg-[#f8fafc]">
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
      <div className="flex-1 w-full h-full" onDoubleClick={resetCamera}>
        <ErrorBoundary>
          <Canvas 
             shadows 
             dpr={[1, 2]} 
             camera={{ position: [2.5, 1.5, 3], fov: 35, near: 0.1, far: 1000 }} 
             className="w-full h-full outline-none"
             onPointerMissed={() => resetCamera()}
          >
            <Suspense fallback={null}>
              <AerospaceEnvironment />
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
