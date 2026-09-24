"use client";
import { useEffect } from 'react';
import { simulation } from '@/simulation/SimulationLoop';
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

export default function EnginePage() {
  const tel = useTelemetryStore(); const p = tel.packet || {};
  useEffect(() => { simulation.start(); }, []);
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-[#E2E8F0] pb-3">
        <h1 className="text-xl font-bold text-[#0F172A]">Primary Engine Telemetry</h1>
        <p className="text-xs text-[#64748B] mt-0.5">Live FADEC engine parameter stream</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">Fuel &amp; Power</h2>
          <Val l="RPM"           v={p.rpm||0}             u="RPM" warn={(p.rpm||0)>5500} crit={(p.rpm||0)>6000} />
          <Val l="Throttle"      v={p.throttle||0}        u="%"   />
          <Val l="MAP"           v={p.map||0}             u="kPa" />
          <Val l="Fuel Flow"     v={p.fuelFlow||0}        u="L/hr" warn={(p.fuelFlow||0)>35} />
          <Val l="Fuel Rem."     v={p.fuelRemaining||0}   u="L"   crit={(p.fuelRemaining||100)<10} />
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">Thermal &amp; Electrical</h2>
          <Val l="EGT"       v={p.egt||0}             u="°C" warn={(p.egt||0)>800} crit={(p.egt||0)>900} />
          <Val l="CHT"       v={p.cht||0}             u="°C" warn={(p.cht||0)>200} crit={(p.cht||0)>230} />
          <Val l="Oil Temp"  v={p.oilTemp||0}         u="°C" warn={(p.oilTemp||0)>115} />
          <Val l="Oil Press" v={p.oilPressure||0}     u="kPa" crit={(p.oilPressure||500)<150} />
          <Val l="Battery"   v={p.batteryVoltage||0}  u="V"  warn={(p.batteryVoltage||14)<12} />
        </div>
      </div>
    </div>
  );
}
