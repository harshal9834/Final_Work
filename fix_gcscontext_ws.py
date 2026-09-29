path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\contexts\GcsContext.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

import re

# Find WebSocket instantiation
search_str = "ws = new WebSocket(import.meta.env.VITE_WS_URL);"
replace_str = """
          // Automatically upgrade http to ws / https to wss if VITE_WS_URL is omitted or incorrect
          const apiUrl = import.meta.env.VITE_API_URL || "https://final-work-1-w5a7.onrender.com";
          let wsUrl = import.meta.env.VITE_WS_URL;
          
          if (!wsUrl || wsUrl.includes("localhost") && !apiUrl.includes("localhost")) {
              wsUrl = apiUrl.replace(/^http:\\/\\//i, 'ws://').replace(/^https:\\/\\//i, 'wss://') + "/stream";
          }
          ws = new WebSocket(wsUrl);
"""
# Python regex to escape correctly:
replace_str = """
          // Automatically upgrade http to ws / https to wss if VITE_WS_URL is omitted or incorrect
          const apiUrl = import.meta.env.VITE_API_URL || "https://final-work-1-w5a7.onrender.com";
          let wsUrl = import.meta.env.VITE_WS_URL;
          
          if (!wsUrl || (wsUrl.includes("localhost") && !apiUrl.includes("localhost"))) {
              wsUrl = apiUrl.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://') + "/stream";
          }
          ws = new WebSocket(wsUrl);
"""

if search_str in content:
    content = content.replace(search_str, replace_str)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
