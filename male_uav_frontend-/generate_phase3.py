import os

BASE_DIR = r"C:\Users\Admin\Downloads\DIGITAL_TWIN_SIH\MALE_UAV\male_uav_frontend-\src\modules\digital-twin"

files = {
    "services/aiAnalyticsEngine.ts": """export function analyzeTrends(telemetryHistory: any[]) {
  return { trend: "STABLE", confidence: 95 };
}
""",
    "services/anomalyDetectionEngine.ts": """export function detectAnomalies(telemetry: any, activeFaults: string[]) {
  const anomalies = [];
  if (telemetry.cht > 230 || activeFaults.includes('Overheating')) {
    anomalies.push({
      fault: "Cooling Degradation",
      probability: 87,
      severity: "HIGH",
      confidence: 94
    });
  }
  if (telemetry.rpm > 5000 && telemetry.vibration > 4.0) {
    anomalies.push({
      fault: "Rotor Imbalance",
      probability: 65,
      severity: "MEDIUM",
      confidence: 82
    });
  }
  return anomalies;
}
""",
    "services/rulEngine.ts": """export function calculateRUL(component: string, telemetry: any, activeFaults: string[], health: number) {
  let baseRUL = 2000; // base 2000 hours
  if (component === 'Transmission') baseRUL = 1000;
  if (component === 'Intercooler') baseRUL = 1500;
  
  // Degrade based on health
  const rul = (health / 100) * baseRUL;
  const confidence = Math.max(60, health - (activeFaults.length * 10));
  
  return {
    component,
    rulHours: Math.max(0, Math.round(rul)),
    confidence: Math.round(confidence),
    status: rul < 200 ? 'CRITICAL' : rul < 500 ? 'WARNING' : 'HEALTHY'
  };
}
""",
    "services/maintenanceAdvisor.ts": """export function generateMaintenanceActions(rulData: any[], anomalies: any[]) {
  const actions = [];
  rulData.forEach(item => {
    if (item.rulHours < 500) {
      actions.push({
        priority: item.rulHours < 200 ? 'HIGH' : 'MEDIUM',
        component: item.component,
        action: `Inspect and service ${item.component}`,
        window: `${Math.round(item.rulHours * 0.8)} Flight Hours`,
        risk: item.rulHours < 200 ? 'CRITICAL' : 'ELEVATED'
      });
    }
  });
  return actions;
}
""",
    "services/explainabilityEngine.ts": """export function explainAnomaly(anomaly: any, telemetry: any) {
  if (anomaly.fault === 'Cooling Degradation') {
    return {
      prediction: "Overheating Risk",
      reason: "Sustained high CHT beyond nominal limits combined with degraded thermal dissipation.",
      parameters: ["CHT", "EGT", "Cooling Efficiency"],
      confidence: anomaly.confidence
    };
  }
  return {
    prediction: anomaly.fault,
    reason: "Pattern matches historical degradation signatures.",
    parameters: ["Vibration", "RPM"],
    confidence: anomaly.confidence
  };
}
""",
    "hooks/useRUL.ts": """import { useState, useEffect } from 'react';
import { calculateRUL } from '../services/rulEngine';
import { ENGINE_COMPONENTS_REGISTRY } from '../constants/engineComponents';

export function useRUL(telemetry: any, activeFaults: string[], healthMap: any) {
  const [rulData, setRulData] = useState<any[]>([]);

  useEffect(() => {
    const data = ENGINE_COMPONENTS_REGISTRY.map(comp => 
      calculateRUL(comp, telemetry, activeFaults, healthMap[comp]?.health || 100)
    );
    setRulData(data);
  }, [telemetry, activeFaults, healthMap]);

  return rulData;
}
""",
    "hooks/usePredictions.ts": """import { useState, useEffect } from 'react';
import { detectAnomalies } from '../services/anomalyDetectionEngine';
import { explainAnomaly } from '../services/explainabilityEngine';

export function usePredictions(telemetry: any, activeFaults: string[]) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [explanations, setExplanations] = useState<any[]>([]);

  useEffect(() => {
    const anomalies = detectAnomalies(telemetry, activeFaults);
    setPredictions(anomalies);
    setExplanations(anomalies.map(a => explainAnomaly(a, telemetry)));
  }, [telemetry, activeFaults]);

  return { predictions, explanations };
}
""",
    "hooks/useMaintenance.ts": """import { useState, useEffect } from 'react';
import { generateMaintenanceActions } from '../services/maintenanceAdvisor';

export function useMaintenance(rulData: any[], predictions: any[]) {
  const [actions, setActions] = useState<any[]>([]);

  useEffect(() => {
    setActions(generateMaintenanceActions(rulData, predictions));
  }, [rulData, predictions]);

  return actions;
}
""",
    "components/AIPredictionPanel.tsx": """import React from 'react';

export const AIPredictionPanel: React.FC<{ predictions: any[] }> = ({ predictions }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
        AI Fault Prediction
      </h3>
      {predictions.length === 0 ? (
        <div className="text-sm text-slate-500">No anomalies detected. System nominal.</div>
      ) : (
        <div className="space-y-4">
          {predictions.map((p, i) => (
            <div key={i} className="bg-purple-50 p-3 rounded-lg border border-purple-100">
              <div className="font-bold text-purple-900 mb-2">{p.fault}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">Probability:</span> <span className="font-bold">{p.probability}%</span></div>
                <div><span className="text-slate-500">Confidence:</span> <span className="font-bold">{p.confidence}%</span></div>
                <div><span className="text-slate-500">Severity:</span> <span className="font-bold text-red-600">{p.severity}</span></div>
                <div><span className="text-slate-500">Est. Failure:</span> <span className="font-bold">12 Hrs</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
""",
    "components/RULPanel.tsx": """import React from 'react';

export const RULPanel: React.FC<{ rulData: any[] }> = ({ rulData }) => {
  const critical = rulData.filter(r => r.status !== 'HEALTHY');
  const displayData = critical.length > 0 ? critical : rulData.slice(0, 3); // Show top 3 or critical

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Remaining Useful Life (RUL)</h3>
      <div className="space-y-3">
        {displayData.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
            <div className="flex flex-col">
              <span className="font-semibold text-slate-700">{item.component}</span>
              <span className="text-xs text-slate-400">Confidence: {item.confidence}%</span>
            </div>
            <div className="flex flex-col items-end">
              <span className={`font-mono font-bold ${item.status === 'CRITICAL' ? 'text-red-600' : item.status === 'WARNING' ? 'text-yellow-600' : 'text-green-600'}`}>
                {item.rulHours} Hrs
              </span>
              <span className="text-xs text-slate-500">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
""",
    "components/ExplainabilityPanel.tsx": """import React from 'react';

export const ExplainabilityPanel: React.FC<{ explanations: any[] }> = ({ explanations }) => {
  if (explanations.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Explainable AI (XAI)</h3>
      <div className="space-y-3">
        {explanations.map((exp, i) => (
          <div key={i} className="text-sm">
            <div className="font-bold text-slate-700 mb-1">Prediction: {exp.prediction}</div>
            <div className="text-slate-600 mb-2"><strong>Reason:</strong> {exp.reason}</div>
            <div className="flex gap-2 text-xs">
              <span className="text-slate-500">Parameters:</span>
              <span className="font-mono bg-slate-100 px-1 rounded">{exp.parameters.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
""",
    "components/MaintenancePanel.tsx": """import React from 'react';

export const MaintenancePanel: React.FC<{ actions: any[] }> = ({ actions }) => {
  if (actions.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Maintenance Advisory</h3>
      <div className="space-y-3">
        {actions.map((act, i) => (
          <div key={i} className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-amber-900">{act.action}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${act.priority === 'HIGH' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}`}>
                {act.priority}
              </span>
            </div>
            <div className="text-amber-800 text-xs">Window: {act.window} | Risk: {act.risk}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
""",
    "components/MissionReplay.tsx": """import React, { useState } from 'react';

export const MissionReplay: React.FC = () => {
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Mission Replay</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setIsPlaying(!isPlaying)} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold shadow-sm hover:bg-indigo-700">
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
        <div className="flex gap-1 bg-slate-100 p-1 rounded">
          {[1, 2, 4, 8].map(s => (
            <button key={s} onClick={() => setSpeed(s)} className={`px-2 py-1 rounded text-xs font-bold ${speed === s ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
              {s}x
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative pt-4 pb-2">
        <div className="h-2 bg-slate-200 rounded-full w-full overflow-hidden">
          <div className="h-full bg-indigo-500" style={{ width: isPlaying ? '45%' : '0%' }}></div>
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
          <span>T-00:00</span>
          <span>T+45:00</span>
          <span>T+1:30:00</span>
        </div>
      </div>
    </div>
  );
};
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(BASE_DIR, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Phase 3 internal files generated successfully.")
