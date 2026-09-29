# -*- coding: utf-8 -*-
import os

path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\pages\MissionReplayPage.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import for DigitalTwinProvider
import_str = "import { EngineModel } from '../modules/digital-twin/components/EngineModel';"
new_import = "import { EngineModel } from '../modules/digital-twin/components/EngineModel';\nimport { DigitalTwinProvider } from '../modules/digital-twin/contexts/DigitalTwinContext';"

if new_import not in content:
    content = content.replace(import_str, new_import)

# 2. Wrap Canvas in DigitalTwinProvider
canvas_start = "<Canvas camera={{ position: [2.5, 1.5, 3], fov: 35 }}>"
canvas_end = "</Canvas>"

if "<DigitalTwinProvider>" not in content:
    content = content.replace(canvas_start, f"<DigitalTwinProvider>\n            {canvas_start}")
    content = content.replace(canvas_end, f"{canvas_end}\n            </DigitalTwinProvider>")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
