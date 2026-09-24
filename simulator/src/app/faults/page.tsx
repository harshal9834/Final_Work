"use client";
import { useState, useEffect } from 'react';
import { useFaultStore } from '@/stores/faultStore';
import { faultRegistry } from '@/stores/faultRegistry';
import { ENDPOINTS } from '@/lib/config';

export default function FaultsPage() {
  const [fType, setFType] = useState(faultRegistry[0].id);
  const [fSev, setFSev]   = useState('MEDIUM');
  const faultStore = useFaultStore();

  useEffect(() => {
    console.log("FAULT REGISTRY SIZE", faultRegistry.length);
    console.log("FAULT NAMES", faultRegistry.map(f => f.name));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-[#E2E8F0] pb-3">
        <h1 className="text-xl font-bold text-[#0F172A]">Fault Injection System</h1>
        <p className="text-xs text-[#64748B] mt-0.5">Inject and clear engine fault conditions</p>
      </div>

      {/* Inject form */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">Inject Fault</p>
        <div className="flex flex-wrap gap-2">
          <select
            value={fType}
            onChange={e => setFType(e.target.value)}
            className="flex-1 min-w-[200px] bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          >
            {faultRegistry.map(fault => (
              <option key={fault.id} value={fault.id}>{fault.name}</option>
            ))}
          </select>
          <select
            value={fSev}
            onChange={e => setFSev(e.target.value)}
            className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          >
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
            <option>CRITICAL</option>
          </select>
          <button
            onClick={async () => {
              const newFault = { id: Math.random().toString(), type: fType, severity: fSev, intensity: 0.01, timeAlive: 0 };
              faultStore.addFault(newFault);
              try {
                await fetch(ENDPOINTS.faults, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: fType, severity: fSev, active: true }),
                });
              } catch (e) {}
            }}
            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            INJECT FAULT
          </button>
        </div>
      </div>

      {/* Active faults list */}
      {faultStore.activeFaults.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Active Faults ({faultStore.activeFaults.length})</p>
          {faultStore.activeFaults.map((f: any) => (
            <div
              key={f.id}
              className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-sm text-[#DC2626]">{f.type}</span>
                <span className="ml-2 text-xs text-red-400 font-medium bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                  {f.severity}
                </span>
              </div>
              <button
                onClick={async () => {
                  faultStore.removeFault(f.id);
                  try {
                    await fetch(ENDPOINTS.faults, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ type: f.type, active: false }),
                    });
                  } catch (e) {}
                }}
                className="text-xs font-bold text-[#475569] hover:text-[#DC2626] border border-[#E2E8F0] hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                REMOVE
              </button>
            </div>
          ))}
        </div>
      )}

      {faultStore.activeFaults.length === 0 && (
        <div className="text-center py-8 text-[#94A3B8] text-sm">
          No active faults — system nominal
        </div>
      )}
    </div>
  );
}
