import os

path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\components\common\Navbar.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("${import.meta.env.VITE_FRONTEND_URL || window.location.origin}/?missionId=", "https://male-uav-simulator.vercel.app/?missionId=")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
