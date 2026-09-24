"use client";
import { useTelemetryStore } from '@/stores/telemetryStore';

export default function HealthPage() {
  const tel = useTelemetryStore(); const p = tel.packet || {};
  const health = p.health ?? 100;
  const healthColor = health >= 80 ? '#16A34A' : health >= 60 ? '#D97706' : '#DC2626';
  const healthBg    = health >= 80 ? 'bg-green-50 border-green-200' : health >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
  const healthLabel = health >= 80 ? 'NOMINAL' : health >= 60 ? 'DEGRADED' : 'CRITICAL';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-[#E2E8F0] pb-3">
        <h1 className="text-xl font-bold text-[#0F172A]">System Health Metrics</h1>
        <p className="text-xs text-[#64748B] mt-0.5">Overall engine health index</p>
      </div>

      <div className={`rounded-2xl border p-8 text-center ${healthBg}`}>
        <div className="text-7xl font-black mt-4" style={{ color: healthColor }}>
          {health.toFixed ? health.toFixed(1) : health}%
        </div>
        <div className="text-base font-bold mt-2 text-[#475569] uppercase tracking-widest">
          OVERALL ENGINE HEALTH
        </div>
        <span className={`inline-block mt-4 px-4 py-1.5 rounded-full text-sm font-bold border`}
          style={{ color: healthColor, borderColor: healthColor, backgroundColor: `${healthColor}18` }}>
          {healthLabel}
        </span>
      </div>
    </div>
  );
}
