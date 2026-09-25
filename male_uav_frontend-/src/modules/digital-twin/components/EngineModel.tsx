import React, { useMemo, useRef, useEffect } from 'react';
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
  const { activeFaults } = useGcs();
  const groupRef = useRef<THREE.Group>(null);
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // STEP 3: Inspect GLTF hierarchy
    console.log("=== GLTF HIERARCHY ===");
    clone.traverse((child) => {
      console.log(child.name);
    });
    
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
          originalColor: origMat.color ? origMat.color.clone() : new THREE.Color(0xffffff),
          hasEmissive: !!origMat.emissive,
          faultLogged: false,
          blinkState: false
        };
        
        // Ensure material can emit light
        const matClone = origMat.clone();
        if (matClone.emissive === undefined) {
            matClone.emissive = new THREE.Color(0x000000);
        }
        mesh.material = matClone;
      }
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    // STEP 1: Log active faults received
    console.log("ACTIVE_FAULTS", activeFaults);
  }, [activeFaults]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    const selCompData = selectedComponent ? (components[selectedComponent] || components['Main Engine']) : null;
    const isSelectedFault = selCompData ? (selCompData.status === 'CRITICAL' || selCompData.health <= 40) : false;
    const ghostOpacity = isSelectedFault ? 0.15 : 0.20;

    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.userData.name || '';
        
        let mat = mesh.material as any;
        if (Array.isArray(mat)) mat = mat[0];
        if (!mat) return;

        const origOpacity = mesh.userData.originalOpacity;
        const origTransparent = mesh.userData.originalTransparent;
        const origEmissive = mesh.userData.originalEmissive;
        const origColor = mesh.userData.originalColor;

        // Evaluate active faults
        const nLower = name.toLowerCase();
        let faultSeverity: string | null = null;
        let isActiveFault = false;
        let activeFaultName = '';

        activeFaults.forEach(f => {
          const fn = (f.name + ' ' + (f.description || '')).toLowerCase();
          let maps = false;
          
          // STEP 2 & 4: Map & Find mesh. Hard-mapped because "OilSystem", "Turbocharger", "Cylinder" etc DO NOT exist in rotax915.glb
          if (fn.includes('turbo') && nLower.includes('overboost')) { maps = true; activeFaultName = 'Turbocharger'; }
          else if ((fn.includes('cylinder') || fn.includes('overheat')) && nLower.includes('main engine')) { maps = true; activeFaultName = 'Cylinder'; }
          else if ((fn.includes('oil') || fn.includes('leak') || fn.includes('pressure')) && nLower.includes('oil tank')) { maps = true; activeFaultName = 'Oil System'; }
          else if ((fn.includes('injector') || fn.includes('fuel')) && nLower.includes('magnetovalve')) { maps = true; activeFaultName = 'Fuel Injectors'; }
          else if (fn.includes('ecu') && nLower.includes('ecu')) { maps = true; activeFaultName = 'ECU'; }
          else if (fn.includes('cool') && nLower.includes('intercooler')) { maps = true; activeFaultName = 'Cooling System'; }
          else if (fn.includes('alternator') && nLower.includes('fusebox')) { maps = true; activeFaultName = 'Alternator'; }

          if (maps) {
            isActiveFault = true;
            if (f.severity === 'CRITICAL' || f.severity === 'EMERGENCY') faultSeverity = 'CRITICAL';
            else if (f.severity === 'WARNING' && faultSeverity !== 'CRITICAL') faultSeverity = 'WARNING';
            else if (!faultSeverity) faultSeverity = 'INFO';
          }
        });

        if (isActiveFault && !mesh.userData.faultLogged) {
          console.log("MAPPED_COMPONENT", activeFaultName);
          console.log("FOUND_MESH", name);
          mesh.userData.faultLogged = true;
        } else if (!isActiveFault && mesh.userData.faultLogged) {
          mesh.userData.faultLogged = false;
          mesh.userData.blinkState = false;
        }

        // STEP 5 & 6: Blink logic and Force test
        if (isActiveFault) {
           mat.opacity = 1.0;
           mat.transparent = origTransparent;
           mat.depthWrite = true;
           
           // Blink every 500ms -> frequency 2 Hz -> Math.sin(time * 2 * PI * 2)
           const sineWave = Math.sin(time * 12.566);
           const isBlinkOn = sineWave > 0;
           
           if (isBlinkOn && !mesh.userData.blinkState) {
               console.log("BLINK_ON");
               mesh.userData.blinkState = true;
           } else if (!isBlinkOn && mesh.userData.blinkState) {
               console.log("BLINK_OFF");
               mesh.userData.blinkState = false;
           }
           
           if (mat.emissive && mat.color) {
              if (faultSeverity === 'CRITICAL') {
                  mat.emissive.setHex(0xff0000);
                  mat.color.setHex(0xff0000);
              } else if (faultSeverity === 'WARNING') {
                  mat.emissive.setHex(0xff8800);
                  mat.color.setHex(0xff8800);
              } else {
                  mat.emissive.setHex(0xffd000);
                  mat.color.setHex(0xffd000);
              }
              
              // Force test: emissiveIntensity = 5 when on
              mat.emissiveIntensity = isBlinkOn ? 5.0 : 0.0;
           }
        } else if (selectedComponent) {
          mat.color.copy(origColor);
          if (name !== selectedComponent) {
             if (mat.opacity !== undefined) mat.opacity = THREE.MathUtils.lerp(mat.opacity, ghostOpacity, 0.1);
             mat.transparent = true;
             mat.depthWrite = false;
             if (mat.emissive) mat.emissive.copy(origEmissive);
             mat.emissiveIntensity = 1.0;
          } else {
             if (mat.opacity !== undefined) mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.1);
             mat.transparent = origTransparent;
             mat.depthWrite = true;
             
             if (mat.emissive) {
                mat.emissive.setHex(0x3b82f6);
                mat.emissiveIntensity = 0.3 + Math.sin(time * Math.PI) * 0.2;
             }
          }
        } else {
           if (mat.opacity !== undefined) {
              mat.opacity = THREE.MathUtils.lerp(mat.opacity, origOpacity, 0.1);
           }
           mat.color.copy(origColor);
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

  return null;
};
