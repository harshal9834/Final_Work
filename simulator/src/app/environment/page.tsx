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

export default function EnvPage() {
  const tel = useTelemetryStore(); const p = tel.packet || {};
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-[#E2E8F0] pb-3">
        <h1 className="text-xl font-bold text-[#0F172A]">Environment &amp; Flight Envelope</h1>
        <p className="text-xs text-[#64748B] mt-0.5">Atmospheric and navigation parameters</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">Navigation</h2>
          <Val l="Altitude"    v={p.altitude||0}         u="m"    />
          <Val l="Airspeed"    v={p.airspeed||0}         u="km/h" />
          <Val l="Vert. Speed" v={p.verticalSpeed||0}    u="m/s"  />
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">Atmosphere</h2>
          <Val l="OAT"          v={p.oat||0}              u="°C"  />
          <Val l="Pressure"     v={p.pressure||0}         u="kPa" />
          <Val l="Humidity"     v={p.humidity||0}         u="%"   />
          <Val l="Density Alt"  v={p.densityAltitude||0}  u="m"   />
        </div>
      </div>
    </div>
  );
}
