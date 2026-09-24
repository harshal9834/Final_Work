"use client";
import { useTelemetryStore } from '@/stores/telemetryStore';

export const Val = ({ l, v, u, warn=false, crit=false }: any) => (
  <div className="flex justify-between items-center text-sm py-2 border-b border-[#E2E8F0] last:border-0">
    <span className="text-[#475569] font-medium">{l}</span>
    <span className={`font-bold tabular-nums ${
      crit ? 'text-[#DC2626]' : warn ? 'text-[#D97706]' : 'text-[#0F172A]'
    }`}>
      {typeof v === 'number' ? v.toFixed(1) : v}
      {u && <span className="text-[#94A3B8] font-normal ml-1 text-xs">{u}</span>}
    </span>
  </div>
);

export default function AnalyticsPage() {
  const tel = useTelemetryStore(); const p = tel.packet || {};
  const isAnomaly = p.aiStatus === 'ANOMALY DETECTED';
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-[#E2E8F0] pb-3">
        <h1 className="text-xl font-bold text-[#0F172A]">AI Diagnostics Engine</h1>
        <p className="text-xs text-[#64748B] mt-0.5">Machine learning prognostics and anomaly detection</p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-1">
        <Val l="AI Model Status"         v={p.aiStatus || 'NORMAL'} u="" crit={isAnomaly} />
        <Val l="Prediction Confidence"   v={(p.aiConfidence||1)*100} u="%" />

        <div className="pt-3 mt-2 border-t border-[#E2E8F0]">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest">RECOMMENDATION</span>
          <p className={`mt-1.5 text-sm font-semibold ${isAnomaly ? 'text-[#DC2626]' : 'text-[#0F172A]'}`}>
            {p.aiRec || 'Standby — all systems nominal'}
          </p>
        </div>
      </div>
    </div>
  );
}
