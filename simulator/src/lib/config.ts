// Central config — all backend URLs come from here
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://final-work-1-w5a7.onrender.com';

// Clean the base URL (remove trailing slash or /stream)
const cleanApiBase = API_BASE.replace(/\/+$/, '').replace(/\/stream$/, '');

// Automatically derive secure WSS protocol from API_BASE if WS_URL is missing
const derivedWsBase = cleanApiBase.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');

// If NEXT_PUBLIC_WS_URL is provided, clean it too
const envWs = process.env.NEXT_PUBLIC_WS_URL ? process.env.NEXT_PUBLIC_WS_URL.replace(/\/+$/, '').replace(/\/stream$/, '') : null;

export const WS_BASE = envWs || derivedWsBase;

export const ENDPOINTS = {
  mission:   ${cleanApiBase}/api/mission,
  faults:    ${cleanApiBase}/api/faults,
  telemetry: ${cleanApiBase}/api/telemetry/latest,
  engine:    ${cleanApiBase}/api/engine,
  status:    ${cleanApiBase}/api/status,
  ws:        ${WS_BASE}/stream,
};
