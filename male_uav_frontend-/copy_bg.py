import shutil
import os

source = r"C:\Users\Admin\.gemini\antigravity\brain\57c1c242-c0d2-4ce0-9d56-c6b756c9b8da\aerospace_blueprint_bg_1790277931344.jpg"
target_dir = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\public\assets"
target = os.path.join(target_dir, "bg-aerospace-blueprint.jpg")

os.makedirs(target_dir, exist_ok=True)
shutil.copy2(source, target)
print(f"Copied to {target}")
