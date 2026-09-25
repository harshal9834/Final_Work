import os

path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\simulator\backend\app\database\connection.py"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Finding the block to replace
start_idx = content.find("if not os.path.exists(ENV_PATH):")
end_idx = content.find("# Mask password safely for logging")

if start_idx != -1 and end_idx != -1:
    replacement = '''if os.path.exists(ENV_PATH):
    load_dotenv(dotenv_path=ENV_PATH, override=True)
    print("[Config] Loaded local .env")
else:
    print("[Config] Running with Render environment variables")

TIMESCALE_DATABASE_URL = (
    os.getenv("TIMESCALE_DATABASE_URL")
    or os.getenv("DATABASE_URL")
)

if not TIMESCALE_DATABASE_URL:
    raise ValueError("CRITICAL CONFIGURATION ERROR: TIMESCALE_DATABASE_URL and DATABASE_URL environment variables are missing!")

# STRICT CHECK: Raise exception immediately if localhost or 127.0.0.1 is found
if "localhost" in TIMESCALE_DATABASE_URL.lower() or "127.0.0.1" in TIMESCALE_DATABASE_URL:
    raise ValueError("CRITICAL INTEGRATION ERROR: Localhost database URL detected! Backend is strictly configured to connect to a cloud database.")

'''
    new_content = content[:start_idx] + replacement + content[end_idx:]
    
    # Also clean up line 37 which was printing ENV_PATH unconditionally
    new_content = new_content.replace('print(f"[Timescale Cloud Integration] Loaded backend environment strictly from: {ENV_PATH}")\n', '')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
