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

export default function TelemetryPage() {
  const tel = useTelemetryStore();
  return (
    <div className="p-6 max-w-6xl mx-auto h-full flex flex-col gap-4">
      <div className="border-b border-[#E2E8F0] pb-3 shrink-0">
        <h1 className="text-xl font-bold text-[#0F172A]">Live FADEC JSON Stream</h1>
        <p className="text-xs text-[#64748B] mt-0.5">Raw telemetry packet from the simulator backend</p>
      </div>
      <pre className="flex-1 mt-0 p-4 bg-white text-[#0F172A] text-xs overflow-auto border border-[#E2E8F0] rounded-xl shadow-sm font-mono leading-relaxed">
        {tel.packet ? JSON.stringify(tel.packet, null, 2) : 'AWAITING CONNECTION...'}
      </pre>
    </div>
  );
}
