// Central config - all backend URLs come from here
let rawApi = process.env.NEXT_PUBLIC_API_URL || 'https://final-work-1-w5a7.onrender.com';
let rawWs = process.env.NEXT_PUBLIC_WS_URL || '';

// Completely strip any accidental trailing paths the user might have added in Vercel
const cleanApiBase = rawApi.replace(/\/ws\/stream\/?$/, '').replace(/\/stream\/?$/, '').replace(/\/ws\/?$/, '').replace(/\/+$/, '');

// If WS URL is explicitly provided, clean it too. Otherwise derive it.
let finalWs = '';
if (rawWs) {
  finalWs = rawWs.replace(/\/ws\/stream\/?$/, '/ws').replace(/\/stream\/?$/, '/ws').replace(/\/+$/, '');
  // ensure it ends with /ws
  if (!finalWs.endsWith('/ws')) {
    finalWs += '/ws';
  }
} else {
  finalWs = cleanApiBase.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://') + '/ws';
}

export const API_BASE = cleanApiBase;

export const ENDPOINTS = {
  mission:   `${cleanApiBase}/api/mission`,
  faults:    `${cleanApiBase}/api/faults`,
  telemetry: `${cleanApiBase}/api/telemetry/latest`,
  engine:    `${cleanApiBase}/api/engine`,
  status:    `${cleanApiBase}/api/status`,
  ws:        finalWs,
};
