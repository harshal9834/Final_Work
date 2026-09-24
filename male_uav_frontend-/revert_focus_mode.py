import os

BASE_DIR = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\modules\digital-twin"

file_content = """import React, { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';
import { DigitalTwinViewMode } from '../services/faultVisualizationEngine';

interface Props {
  viewMode: DigitalTwinViewMode;
  orbitRef?: any;
}

export const EngineModel: React.FC<Props> = ({ viewMode, orbitRef }) => {
  const { scene } = useGLTF('/model/rotax915.glb');
  const { setSelectedComponent } = useDigitalTwin();
  const groupRef = useRef<THREE.Group>(null);

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
        mesh.userData = { 
          isComponent: true, 
          name: mesh.name || 'Main Engine'
        };
      }
    });
    return clone;
  }, [scene]);

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
      />
    </group>
  );
};

useGLTF.preload('/model/rotax915.glb');
"""

full_path = os.path.join(BASE_DIR, "components", "EngineModel.tsx")
os.makedirs(os.path.dirname(full_path), exist_ok=True)
with open(full_path, "w", encoding="utf-8") as f:
    f.write(file_content)

print("Reverted EngineModel.tsx completely.")
