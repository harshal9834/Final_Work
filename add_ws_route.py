# -*- coding: utf-8 -*-
import re

path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\backend-service\app\main.py"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Add /ws/stream to the decorators
if '@app.websocket("/ws/stream")' not in content:
    content = content.replace(
        '@app.websocket("/ws")\n@app.websocket("/stream")',
        '@app.websocket("/ws")\n@app.websocket("/stream")\n@app.websocket("/ws/stream")'
    )
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Added /ws/stream to backend routes")
else:
    print("Already present")
