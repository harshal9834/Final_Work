# -*- coding: utf-8 -*-
path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\simulator\src\lib\config.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

import re

# We will just fix how envWs is handled.
new_content = """// Central config - all backend URLs come from here
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://final-work-1-w5a7.onrender.com';

const cleanApiBase = API_BASE.replace(/\\/+$/, '').replace(/\\/stream$/, '');
const derivedWsBase = cleanApiBase.replace(/^http:\\/\\//i, 'ws://').replace(/^https:\\/\\//i, 'wss://') + '/stream';

// If user provides full ws URL (e.g. wss://.../ws or wss://.../stream), use it exactly.
export const ENDPOINTS = {
  mission:   `${cleanApiBase}/api/mission`,
  faults:    `${cleanApiBase}/api/faults`,
  telemetry: `${cleanApiBase}/api/telemetry/latest`,
  engine:    `${cleanApiBase}/api/engine`,
  status:    `${cleanApiBase}/api/status`,
  ws:        process.env.NEXT_PUBLIC_WS_URL || derivedWsBase,
};
"""
# Need to correct the slash escaping for JS regex
new_content = """// Central config - all backend URLs come from here
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://final-work-1-w5a7.onrender.com';

const cleanApiBase = API_BASE.replace(/\\/+$/, '').replace(/\\/stream$/, '');
const derivedWsBase = cleanApiBase.replace(/^http:\\/\\//i, 'ws://').replace(/^https:\\/\\//i, 'wss://') + '/stream';

// If user provides full ws URL, use it exactly.
export const ENDPOINTS = {
  mission:   `${cleanApiBase}/api/mission`,
  faults:    `${cleanApiBase}/api/faults`,
  telemetry: `${cleanApiBase}/api/telemetry/latest`,
  engine:    `${cleanApiBase}/api/engine`,
  status:    `${cleanApiBase}/api/status`,
  ws:        process.env.NEXT_PUBLIC_WS_URL || derivedWsBase,
};
"""

with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)
print("Updated config.ts")
