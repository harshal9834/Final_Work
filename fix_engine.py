import re
import sys

file_path = r'male_uav_frontend-/src/modules/digital-twin/components/EngineModel.tsx'
with open(file_path, 'r') as f:
    content = f.read()

replacement = """        // Evaluate active faults
        const nLower = name.toLowerCase();
        let faultSeverity: string | null = null;
        let isActiveFault = false;

        activeFaults.forEach(f => {
          const fn = (f.name + ' ' + (f.description || '')).toLowerCase();
          let maps = false;
          
          if (fn.includes('turbo') && nLower.includes('overboost')) maps = true;
          else if ((fn.includes('cylinder') || fn.includes('overheat')) && nLower.includes('main engine')) maps = true;
          else if ((fn.includes('oil') || fn.includes('leak') || fn.includes('pressure')) && nLower.includes('oil tank')) maps = true;
          else if ((fn.includes('injector') || fn.includes('fuel')) && nLower.includes('magnetovalve')) maps = true;
          else if (fn.includes('ecu') && nLower.includes('ecu')) maps = true;
          else if (fn.includes('cool') && nLower.includes('intercooler')) maps = true;
          else if (fn.includes('alternator') && nLower.includes('fusebox')) maps = true;

          if (maps) {
            isActiveFault = true;
            if (f.severity === 'CRITICAL' || f.severity === 'EMERGENCY') faultSeverity = 'CRITICAL';
            else if (f.severity === 'WARNING' && faultSeverity !== 'CRITICAL') faultSeverity = 'WARNING';
            else if (!faultSeverity) faultSeverity = 'INFO';
          }
        });

        // Debug logging
        if (isActiveFault && !mesh.userData.faultLogged) {
          console.log("[FAULT ACTIVE]", activeFaults.find(f => true)?.name || 'Unknown Fault');
          console.log("[COMPONENT BLINK START]", name);
          mesh.userData.faultLogged = true;
        } else if (!isActiveFault && mesh.userData.faultLogged) {
          console.log("[COMPONENT BLINK STOP]", name);
          mesh.userData.faultLogged = false;
        }

        if (isActiveFault) {
           mat.opacity = 1.0;
           mat.transparent = origTransparent;
           mat.depthWrite = true;
           if (mat.emissive) {
              if (faultSeverity === 'CRITICAL') mat.emissive.setHex(0xff0000);
              else if (faultSeverity === 'WARNING') mat.emissive.setHex(0xff8800);
              else mat.emissive.setHex(0xffd000);
              
              // Blink 500ms -> frequency 2 Hz -> Math.sin(time * 2 * PI * 2) = Math.sin(time * 12.56)
              mat.emissiveIntensity = 0.5 + Math.sin(time * 12.566) * 2.0; 
           }"""

pattern = r'\s*// Evaluate active faults.*?(?=\s*} else if \(selectedComponent\) \{)'

new_content = re.sub(pattern, '\n' + replacement, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(new_content)
print("Done")
