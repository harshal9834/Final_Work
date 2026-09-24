import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Grid } from '@react-three/drei';

export const AerospaceEnvironment = () => {
  return (
    <group>
      {/* Background Color & Fog */}
      <color attach="background" args={['#f8fafc']} />
      <fog attach="fog" args={['#f8fafc', 5, 40]} />

      {/* Lightweight Digital Grid Floor */}
      <Grid 
        position={[0, -3, 0]} 
        args={[100, 100]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#e2e8f0" 
        sectionSize={5} 
        sectionThickness={1} 
        sectionColor="#cbd5e1" 
        fadeDistance={40} 
      />

      {/* Dynamic Telemetry Particles & Airflow Streams */}
      <TelemetryStreams />

      {/* Network Topology Nodes */}
      <NetworkTopology />
    </group>
  );
};

const TelemetryStreams = () => {
  const count = 1000;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 40 - 10;
      const speed = 0.02 + Math.random() * 0.05;
      temp.push({ x, y, z, speed });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;
    particles.forEach((particle, i) => {
      // Simulate aerodynamic airflow from front to back (Z-axis motion)
      particle.z -= particle.speed;
      if (particle.z < -30) particle.z = 20;
      
      dummy.position.set(particle.x, particle.y, particle.z);
      // Stretch particles along Z to look like data streams / airflow lines
      dummy.scale.set(0.05, 0.05, 0.5); 
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
    </instancedMesh>
  );
};

const NetworkTopology = () => {
  const lineRef = useRef<THREE.LineSegments>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, lines } = useMemo(() => {
    const pts = [];
    const numNodes = 50;
    for (let i = 0; i < numNodes; i++) {
      // Keep nodes primarily in the background
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.2) * 15;
      const z = -10 - Math.random() * 20;
      pts.push(new THREE.Vector3(x, y, z));
    }

    const linePoints = [];
    // Connect close nodes
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        if (pts[i].distanceTo(pts[j]) < 8) {
          linePoints.push(pts[i], pts[j]);
        }
      }
    }

    const posArray = new Float32Array(numNodes * 3);
    pts.forEach((p, i) => {
      posArray[i * 3] = p.x;
      posArray[i * 3 + 1] = p.y;
      posArray[i * 3 + 2] = p.z;
    });

    const lineArray = new Float32Array(linePoints.length * 3);
    linePoints.forEach((p, i) => {
      lineArray[i * 3] = p.x;
      lineArray[i * 3 + 1] = p.y;
      lineArray[i * 3 + 2] = p.z;
    });

    return { positions: posArray, lines: lineArray };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (lineRef.current && lineRef.current.material) {
       (lineRef.current.material as THREE.LineBasicMaterial).opacity = 0.1 + Math.sin(time * 0.5) * 0.05;
    }
    if (pointsRef.current && pointsRef.current.material) {
       (pointsRef.current.material as THREE.PointsMaterial).opacity = 0.3 + Math.sin(time) * 0.1;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#06b6d4" size={0.15} transparent opacity={0.4} sizeAttenuation />
      </points>

      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={lines.length / 3} array={lines} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#94a3b8" transparent opacity={0.15} linewidth={1} />
      </lineSegments>
    </group>
  );
};
