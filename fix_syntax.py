import os
import re

def fix(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # GcsContext.tsx
    content = content.replace("`${import.meta.env.VITE_SIMULATOR_URL}/api/missions//end, { method: 'POST' }`", "`${import.meta.env.VITE_SIMULATOR_URL}/api/missions/${missionSessionId}/end`, { method: 'POST' }")
    content = content.replace("`${import.meta.env.VITE_SIMULATOR_URL}/api/missions//telemetry`", "`${import.meta.env.VITE_SIMULATOR_URL}/api/missions/${missionSessionId}/telemetry`")
    content = content.replace("`${import.meta.env.VITE_SIMULATOR_URL}/api/missions//fault`", "`${import.meta.env.VITE_SIMULATOR_URL}/api/missions/${missionSessionId}/fault`")
    
    # PostFlightAnalysisPage.tsx
    content = re.sub(r'fetch\(`\$\{import\.meta\.env\.VITE_SIMULATOR_URL\}/api/postflight/missions\).*?\.then', r'fetch(`${import.meta.env.VITE_SIMULATOR_URL}/api/postflight/missions`).then', content, flags=re.DOTALL)
    content = re.sub(r'`\$\{import\.meta\.env\.VITE_SIMULATOR_URL\}/api/postflight/missions\)\s*\.then', r'(`${import.meta.env.VITE_SIMULATOR_URL}/api/postflight/missions`).then', content, flags=re.DOTALL)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix(r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\contexts\GcsContext.tsx")
fix(r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\pages\PostFlightAnalysisPage.tsx")
