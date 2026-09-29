# -*- coding: utf-8 -*-
import re

path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\contexts\GcsContext.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace /api/missions/start with /api/mission
content = content.replace("/api/missions/start", "/api/mission")

# Replace /api/missions/${missionSessionId}/end with /api/mission
content = re.sub(
    r'`\$\{import\.meta\.env\.VITE_SIMULATOR_URL\}/api/missions/\$\{missionSessionId\}/end`',
    r'`${import.meta.env.VITE_SIMULATOR_URL}/api/mission`',
    content
)

# Replace /api/missions/${missionSessionId}/telemetry with /api/telemetry
content = re.sub(
    r'`\$\{import\.meta\.env\.VITE_SIMULATOR_URL\}/api/missions/\$\{missionSessionId\}/telemetry`',
    r'`${import.meta.env.VITE_SIMULATOR_URL}/api/telemetry`',
    content
)

# Replace /api/missions/${missionSessionId}/fault with /api/faults/inject
content = re.sub(
    r'`\$\{import\.meta\.env\.VITE_SIMULATOR_URL\}/api/missions/\$\{missionSessionId\}/fault`',
    r'`${import.meta.env.VITE_SIMULATOR_URL}/api/faults/inject`',
    content
)


with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Replaced old mission/fault urls in frontend")
