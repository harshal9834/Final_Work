import React, { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';
import { DigitalTwinViewMode } from '../services/faultVisualizationEngine';
import { useGcs } from '../../../contexts/GcsContext';

interface Props {
  viewMode: DigitalTwinViewMode;
  orbitRef?: any;
}

export const EngineModel: React.FC<Props> = ({ viewMode, orbitRef }) => {
  const { scene } = useGLTF('/model/rotax915.glb');
  const { components, selectedComponent, setSelectedComponent } = useDigitalTwin();
  const groupRef = useRef<THREE.Group>(null);
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Hide baked-in floors
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
        if (Array.isArray(origMat)) origMat = origMat[0];
        if (!origMat) {
           origMat = new THREE.MeshStandardMaterial();
           mesh.material = origMat;
        }

        mesh.userData = { 
          isComponent: true, 
          name: compName, 
          originalOpacity: origMat.opacity !== undefined ? origMat.opacity : 1.0,
          originalTransparent: origMat.transparent || false,
          originalEmissive: origMat.emissive ? origMat.emissive.clone() : new THREE.Color(0x000000),
          hasEmissive: !!origMat.emissive
        };
        
        mesh.material = origMat.clone();
      }
    });
    return clone;
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    const selCompData = selectedComponent ? (components[selectedComponent] || components['Main Engine']) : null;
    const isSelectedFault = selCompData ? (selCompData.status === 'CRITICAL' || selCompData.health <= 40) : false;
    const ghostOpacity = isSelectedFault ? 0.15 : 0.20;

    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.userData.name;
        const compData = components[name] || components['Main Engine'];
        const isFault = compData.status === 'CRITICAL' || compData.health <= 40;
        
        let mat = mesh.material as any;
        if (Array.isArray(mat)) mat = mat[0];
        if (!mat) return;

        const origOpacity = mesh.userData.originalOpacity;
        const origTransparent = mesh.userData.originalTransparent;
        const origEmissive = mesh.userData.originalEmissive;

        if (selectedComponent) {
          if (name !== selectedComponent) {
             // Ghosting non-selected parts
             if (mat.opacity !== undefined) mat.opacity = THREE.MathUtils.lerp(mat.opacity, ghostOpacity, 0.1);
             mat.transparent = true;
             mat.depthWrite = false;
             if (mat.emissive) mat.emissive.copy(origEmissive);
             mat.emissiveIntensity = 1.0;
          } else {
             // Selected part glow
             if (mat.opacity !== undefined) mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.1);
             mat.transparent = origTransparent;
             mat.depthWrite = true;
             
             if (mat.emissive) {
                if (isFault) {
                   mat.emissive.setHex(0xff0000);
                   mat.emissiveIntensity = 0.5 + Math.sin(time * 15) * 0.5; // Fast red pulse
                } else {
                   mat.emissive.setHex(0x3b82f6);
                   mat.emissiveIntensity = 0.3 + Math.sin(time * Math.PI) * 0.2; // 2 second pulse (freq = PI)
                }
             }
          }
        } else {
           // Reset to normal
           if (mat.opacity !== undefined) {
              mat.opacity = THREE.MathUtils.lerp(mat.opacity, origOpacity, 0.1);
           }
           mat.transparent = origTransparent;
           mat.depthWrite = true;
           if (mat.emissive) mat.emissive.copy(origEmissive);
           mat.emissiveIntensity = 1.0;
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
  const endPoint = new THREE.Vector3(5, 1, 0); // Pointing to right panel
  const lineRef = useRef<THREE.Line>(null);
  
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
        <lineDashedMaterial attach="material" color="#3b82f6" dashSize={0.1} gapSize={0.1} linewidth={2} transparent opacity={0.6} />
      </line>
    </group>
  );
};

useGLTF.preload('/model/rotax915.glb');
