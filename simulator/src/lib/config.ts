// Central config - all backend URLs come from here
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://final-work-1-w5a7.onrender.com';

const cleanApiBase = API_BASE.replace(/\/+$/, '').replace(/\/stream$/, '');
const derivedWsBase = cleanApiBase.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://') + '/stream';

// If user provides full ws URL, use it exactly.
export const ENDPOINTS = {
  mission:   `${cleanApiBase}/api/mission`,
  faults:    `${cleanApiBase}/api/faults`,
  telemetry: `${cleanApiBase}/api/telemetry/latest`,
  engine:    `${cleanApiBase}/api/engine`,
  status:    `${cleanApiBase}/api/status`,
  ws:        process.env.NEXT_PUBLIC_WS_URL || derivedWsBase,
};
