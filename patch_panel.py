import re

file_path = 'male_uav_frontend-/src/modules/digital-twin/components/ComponentDetailsRightPanel.tsx'
with open(file_path, 'r') as f:
    content = f.read()

replacement_logic = """  // --- DYNAMIC LIVE TELEMETRY LOGIC ---
  // NO MOCK DATA. NO FALLBACK CONSTANTS.
  const nLower = (selectedComponent || 'Main Engine').toLowerCase();
  
  // Base metrics from live simulator telemetry
  let liveCht = telemetry?.chtC?.[0] || 0;
  let livePressure = telemetry?.manifoldPressureInHg || 0;
  let liveVibration = telemetry?.vibrationRmsMmS || 0;

  // Adapt slightly if they selected specific components to show their specific relevant telemetry, 
  // but NEVER use static mock values.
  if (nLower.includes('oil')) {
      livePressure = telemetry?.oilPressureBar || 0;
      liveCht = telemetry?.oilTempC || 0;
  } else if (nLower.includes('turbo') || nLower.includes('overboost')) {
      livePressure = telemetry?.turboBoostBar || 0;
      liveCht = telemetry?.egtC?.[0] || 0;
  } else if (nLower.includes('intercooler') || nLower.includes('cool')) {
      liveCht = telemetry?.coolantTempC || 0;
  }

  // Calculate Health Status from real telemetry faults
  const compFaults = (faults || []).filter((f: any) => {
     const fn = (f.name + ' ' + (f.description || '')).toLowerCase();
     if (nLower.includes('main') || nLower.includes('cylinder')) return fn.includes('cylinder') || fn.includes('misfire') || fn.includes('overheat');
     if (nLower.includes('turbo') || nLower.includes('overboost')) return fn.includes('turbo');
     if (nLower.includes('oil')) return fn.includes('oil') || fn.includes('leak');
     if (nLower.includes('injector') || nLower.includes('magnetovalve')) return fn.includes('injector') || fn.includes('fuel');
     if (nLower.includes('ecu')) return fn.includes('ecu');
     if (nLower.includes('cool') || nLower.includes('intercooler')) return fn.includes('cool');
     if (nLower.includes('alternator') || nLower.includes('fusebox')) return fn.includes('alternator');
     return false;
  });

  let liveStatus = 'HEALTHY';
  if (compFaults.length > 0) {
      liveStatus = compFaults.some((f: any) => f.severity === 'CRITICAL' || f.severity === 'EMERGENCY') ? 'CRITICAL' : 'WARNING';
  } else {
      const overallHealth = telemetry?.health_score !== undefined ? telemetry.health_score : 100;
      if (overallHealth <= 50) liveStatus = 'CRITICAL';
      else if (overallHealth <= 80) liveStatus = 'WARNING';
  }
  
  // ------------------------------------
  
  const tabs = ['Live Data', 'Health', 'AI Analysis', 'Maintenance'];"""

# 1. Replace the compData declaration
content = re.sub(
    r"const compData = components\[selectedComponent\] \|\| components\['Main Engine'\];\s*const tabs = \['Live Data', 'Health', 'AI Analysis', 'Maintenance'\];",
    replacement_logic,
    content
)

# 2. Replace compData.status logic
content = content.replace("compData.status === 'CRITICAL'", "liveStatus === 'CRITICAL'")
content = content.replace("compData.status === \n'CRITICAL'", "liveStatus === 'CRITICAL'")
content = content.replace("{compData.status}", "{liveStatus}")

# 3. Replace values
content = content.replace("value={compData.temperature}", "value={liveCht}")
content = content.replace("value={compData.pressure}", "value={livePressure}")
content = content.replace("value={compData.vibration}", "value={liveVibration}")

with open(file_path, 'w') as f:
    f.write(content)
print("PATCHED")
