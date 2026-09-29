# -*- coding: utf-8 -*-
path = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\simulator\src\lib\config.ts"
content = """// Central config - all backend URLs come from here
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://final-work-1-w5a7.onrender.com';

const cleanApiBase = API_BASE.replace(/\/+$/, '').replace(/\/stream$/, '');
const derivedWsBase = cleanApiBase.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');
const envWs = process.env.NEXT_PUBLIC_WS_URL ? process.env.NEXT_PUBLIC_WS_URL.replace(/\/+$/, '').replace(/\/stream$/, '') : null;

export const WS_BASE = envWs || derivedWsBase;

export const ENDPOINTS = {
  mission:   `${cleanApiBase}/api/mission`,
  faults:    `${cleanApiBase}/api/faults`,
  telemetry: `${cleanApiBase}/api/telemetry/latest`,
  engine:    `${cleanApiBase}/api/engine`,
  status:    `${cleanApiBase}/api/status`,
  ws:        `${WS_BASE}/stream`,
};
"""
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
