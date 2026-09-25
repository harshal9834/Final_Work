import os
import re

# File Paths
FRONTEND_DIR = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src"
PRISMA_SCHEMA = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\mission-recorder\prisma\schema.prisma"
BACKEND_CONFIG = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\backend-service\app\config.py"

def modify_frontend():
    replacements = [
        ("import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'", "import.meta.env.VITE_API_URL"),
        ("'http://localhost:8000/api/system/startup-state'", "${import.meta.env.VITE_API_URL}/api/system/startup-state"),
        ("'ws://localhost:8000/stream'", "import.meta.env.VITE_WS_URL"),
        ("ws://localhost:8000/stream", ""),
        ("'http://localhost:8000/api/faults?active=true'", "${import.meta.env.VITE_API_URL}/api/faults?active=true"),
        ("'http://localhost:8000/api/faults'", "${import.meta.env.VITE_API_URL}/api/faults"),
        ("http://localhost:8000/api/faults//remove", "${import.meta.env.VITE_API_URL}/api/faults//remove"),
        ("'http://localhost:4001/api/missions/start'", "${import.meta.env.VITE_SIMULATOR_URL}/api/missions/start"),
        ("'http://localhost:4001/api/missions/' + missionSessionId + '/end'", "${import.meta.env.VITE_SIMULATOR_URL}/api/missions//end"),
        ("'http://localhost:4001/api/missions/' + missionSessionId + '/telemetry'", "${import.meta.env.VITE_SIMULATOR_URL}/api/missions//telemetry"),
        ("'http://localhost:4001/api/missions/' + missionSessionId + '/fault'", "${import.meta.env.VITE_SIMULATOR_URL}/api/missions//fault"),
        ("'http://localhost:4001/api/missions'", "import.meta.env.VITE_SIMULATOR_URL + '/api/missions'"),
        ("'http://localhost:4001/api/postflight/missions'", "${import.meta.env.VITE_SIMULATOR_URL}/api/postflight/missions"),
        ("http://localhost:4001/api/postflight/", "${import.meta.env.VITE_SIMULATOR_URL}/api/postflight/"),
        ("http://localhost:3000/?missionId=", "${import.meta.env.VITE_FRONTEND_URL || window.location.origin}/?missionId=")
    ]
    for root, _, files in os.walk(FRONTEND_DIR):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                original = content
                for old, new in replacements:
                    content = content.replace(old, new)
                if content != original:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Modified: {path}")

def modify_prisma():
    with open(PRISMA_SCHEMA, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Provider & URL
    content = re.sub(r'provider\s*=\s*"sqlite"', 'provider = "postgresql"', content, count=1)
    content = re.sub(r'url\s*=\s*"file:\./dev\.db"', 'url      = env("DATABASE_URL")', content, count=1)
    
    # Remove duplicate datasource block if it exists
    content = re.sub(r'generator client \{[\s\S]*?datasource db \{[\s\S]*?\}', 'generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}', content, count=1)
    content = re.sub(r'(generator client \{[\s\S]*?\})\s*generator client \{[\s\S]*', r'\1', content) # truncate anything after duplicate
    
    # Indexes
    if "@@index([missionSessionId])" not in content:
        content = re.sub(r'(model TelemetryHistory \{[\s\S]*?)(?=\})', r'\1\n  @@index([missionSessionId])\n', content)
        content = re.sub(r'(model MissionEvent \{[\s\S]*?)(?=\})', r'\1\n  @@index([missionSessionId])\n', content)
        content = re.sub(r'(model FaultHistory \{[\s\S]*?)(?=\})', r'\1\n  @@index([missionSessionId])\n', content)
        content = re.sub(r'(model AiIntervention \{[\s\S]*?)(?=\})', r'\1\n  @@index([missionSessionId])\n', content)
        content = re.sub(r'(model PostFlightAnalysis \{[\s\S]*?)(?=\})', r'\1\n  @@index([missionId])\n', content) # missionId instead of missionSessionId

    # Remove AntiGravity models
    content = re.sub(r'model AntiGravityExperiment \{[\s\S]*?\}', '', content)
    content = re.sub(r'model AntiGravityTelemetry \{[\s\S]*?\}', '', content)
    content = re.sub(r'model AntiGravityEvent \{[\s\S]*?\}', '', content)
    
    with open(PRISMA_SCHEMA, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Modified: {PRISMA_SCHEMA}")

def modify_backend_config():
    if os.path.exists(BACKEND_CONFIG):
        with open(BACKEND_CONFIG, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace('"postgresql://postgres:postgres@localhost:5432/main_dashboard_db"', '""')
        content = content.replace('"http://localhost:4000"', '""')
        content = content.replace('"ws://localhost:4000/stream"', '""')
        with open(BACKEND_CONFIG, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Modified: {BACKEND_CONFIG}")

modify_frontend()
modify_prisma()
modify_backend_config()
