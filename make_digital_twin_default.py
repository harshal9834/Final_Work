import os

# 1. Update NAV_ITEMS order in constants
constants_path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\constants\index.ts"
with open(constants_path, "r", encoding="utf-8") as f:
    constants_content = f.read()

# Remove the digital-twin line
dt_line = "  { id: 'digital-twin', label: '3D Digital Twin', path: '/digital-twin', icon: 'Cpu', badge: '3D/HEAT' },\n"
if dt_line in constants_content:
    constants_content = constants_content.replace(dt_line, "")
    # Insert it right after the array starts
    search_str = "export const NAV_ITEMS = [\n"
    if search_str in constants_content:
        constants_content = constants_content.replace(search_str, search_str + dt_line)

with open(constants_path, "w", encoding="utf-8") as f:
    f.write(constants_content)

# 2. Update default activeTab in GcsContext
gcs_path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\contexts\GcsContext.tsx"
with open(gcs_path, "r", encoding="utf-8") as f:
    gcs_content = f.read()

gcs_content = gcs_content.replace("useState<string>('dashboard')", "useState<string>('digital-twin')")

with open(gcs_path, "w", encoding="utf-8") as f:
    f.write(gcs_content)

print("Done")
