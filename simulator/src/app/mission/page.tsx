"use client";
import { useMissionStore } from '@/stores/missionStore';
import { useTelemetryStore } from '@/stores/telemetryStore';
import { ENDPOINTS } from '@/lib/config';
import { useState } from 'react';

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

const PHASES = ['GROUND_IDLE', 'TAKEOFF', 'CLIMB', 'CRUISE', 'LOITER', 'DESCENT', 'LANDING'];

export default function MissionPage() {
  const tel = useTelemetryStore();
  const connected = tel.connected;
  const p = tel.packet || {};
  const mission = useMissionStore();
  const [loading, setLoading]     = useState(false);
  const [cmdResult, setCmdResult] = useState('');

  const sendCmd = async (payload: any) => {
    setLoading(true);
    setCmdResult('Sending...');
    try {
      const res  = await fetch(ENDPOINTS.mission, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setCmdResult(`OK: phase=${json.missionPhase || payload.phase} | status=${payload.status || 'OK'}`);
    } catch (e: any) {
      setCmdResult(`ERROR: ${e.message} — Is backend running on port 4000?`);
    } finally {
      setLoading(false);
    }
  };

  const handleStart  = () => { const phase = mission.phase || 'CLIMB'; mission.setMission({ phase, isActive: true,  status: 'RUNNING' }); sendCmd({ command: 'START',  phase, isActive: true,  status: 'RUNNING'  }); };
  const handlePause  = () => { mission.setMission({ phase: 'LOITER',     isActive: false, status: 'PAUSED'  }); sendCmd({ command: 'PAUSE',  phase: 'LOITER',     isActive: false, status: 'PAUSED'   }); };
  const handleResume = () => { mission.setMission({ phase: 'CRUISE',     isActive: true,  status: 'RUNNING' }); sendCmd({ command: 'RESUME', phase: 'CRUISE',     isActive: true,  status: 'RUNNING'  }); };
  const handleStop   = () => { mission.setMission({ phase: 'GROUND_IDLE',isActive: false, status: 'STOPPED' }); sendCmd({ command: 'STOP',   phase: 'GROUND_IDLE',isActive: false, status: 'STOPPED'  }); };
  const handlePhase  = (ph: string) => { mission.setMission({ phase: ph }); sendCmd({ phase: ph, isActive: mission.isActive, status: mission.isActive ? 'RUNNING' : 'STOPPED' }); };

  const livePhase  = p.mission_phase || p.missionPhase || p.mission || mission.phase || 'GROUND_IDLE';
  const liveStatus = mission.status || (p.throttle > 0 ? 'RUNNING' : 'STOPPED');

  const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
    RUNNING:   { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
    PAUSED:    { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
    STOPPED:   { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'   },
    COMPLETED: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
  };
  const sc = statusConfig[liveStatus] || { bg: 'bg-[#F1F5F9]', text: 'text-[#475569]', border: 'border-[#E2E8F0]' };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Mission Control</h1>
          <p className="text-xs text-[#64748B] mt-0.5">UAV mission phase and control panel</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 border rounded-full ${sc.bg} ${sc.text} ${sc.border}`}>
          {liveStatus} — {livePhase}
        </span>
      </div>

      {/* Backend offline banner */}
      {!connected && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-start gap-2">
          <span className="font-bold shrink-0">⚠ BACKEND OFFLINE</span>
          <span>Run: <code className="bg-red-100 px-1 rounded font-mono">python -m uvicorn app.main:app --port 4000</code> in the <code className="bg-red-100 px-1 rounded font-mono">simulator/backend</code> folder</span>
        </div>
      )}

      {/* Phase selector */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">1. Select Phase</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PHASES.map(ph => (
            <button key={ph} onClick={() => handlePhase(ph)}
              className={`p-3 border text-xs font-bold tracking-wide transition-all rounded-lg ${
                livePhase === ph
                  ? 'border-[#2563EB] text-[#2563EB] bg-blue-50 shadow-sm'
                  : 'border-[#E2E8F0] text-[#475569] hover:border-blue-300 hover:text-[#2563EB] hover:bg-[#EFF6FF] bg-white'
              }`}>
              {ph}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">2. Controls</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleStart} disabled={loading}
            className={`py-3.5 text-sm font-bold border-2 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              liveStatus === 'RUNNING'
                ? 'border-[#16A34A] text-white bg-[#16A34A] shadow-sm'
                : 'border-[#16A34A] text-[#16A34A] bg-white hover:bg-green-50'
            }`}>
            {loading ? 'SENDING...' : 'START MISSION'}
          </button>
          <button onClick={handleStop} disabled={loading}
            className={`py-3.5 text-sm font-bold border-2 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              liveStatus === 'STOPPED'
                ? 'border-[#DC2626] text-white bg-[#DC2626] shadow-sm'
                : 'border-[#DC2626] text-[#DC2626] bg-white hover:bg-red-50'
            }`}>
            STOP
          </button>
          <button onClick={handlePause} disabled={loading}
            className={`py-3.5 text-sm font-bold border-2 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              liveStatus === 'PAUSED'
                ? 'border-[#D97706] text-white bg-[#D97706] shadow-sm'
                : 'border-[#D97706] text-[#D97706] bg-white hover:bg-amber-50'
            }`}>
            PAUSE
          </button>
          <button onClick={handleResume} disabled={loading}
            className="py-3.5 text-sm font-bold border-2 border-[#2563EB] text-[#2563EB] bg-white hover:bg-blue-50 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed rounded-xl">
            RESUME
          </button>
        </div>
      </div>

      {/* Live telemetry */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">3. Live Telemetry</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <div>
            <Val l="RPM"            v={p.rpm ?? 0}                                  u="RPM"  warn={(p.rpm??0)>5500} />
            <Val l="Throttle"       v={p.throttle_pct ?? p.throttle ?? 0}           u="%"    />
            <Val l="MAP"            v={p.map_kpa ?? p.map ?? 0}                     u="kPa"  />
            <Val l="Fuel Flow"      v={p.fuel_flow_lph ?? p.fuelFlow ?? 0}          u="L/hr" warn={(p.fuel_flow_lph??0)>35} />
            <Val l="Fuel Remaining" v={p.fuel_remaining_l ?? p.fuelRemaining ?? 0}  u="L"    crit={(p.fuel_remaining_l??100)<10} />
            <Val l="EGT"            v={p.egt_c ?? p.egt ?? 0}                       u="°C"   warn={(p.egt_c??0)>800} crit={(p.egt_c??0)>900} />
          </div>
          <div>
            <Val l="Altitude"     v={p.altitude_m ?? p.altitude ?? 0}               u="m"    />
            <Val l="Airspeed"     v={p.airspeed_kmh ?? p.airspeed ?? 0}             u="km/h" />
            <Val l="Vert. Speed"  v={p.vertical_speed_ms ?? p.verticalSpeed ?? 0}   u="m/s"  />
            <Val l="CHT"          v={p.cht_c ?? p.cht ?? 0}                         u="°C"   warn={(p.cht_c??0)>200} crit={(p.cht_c??0)>230} />
            <Val l="Oil Pressure" v={p.oil_pressure_kpa ?? p.oilPressure ?? 0}      u="kPa"  crit={(p.oil_pressure_kpa??500)<150} />
            <Val l="Health Score" v={p.health_score ?? p.health ?? 100}             u="%"    warn={(p.health_score??100)<70} crit={(p.health_score??100)<40} />
          </div>
        </div>
      </div>

      {/* Last command result */}
      {cmdResult && (
        <div className={`text-xs p-3 border rounded-xl font-mono ${
          cmdResult.startsWith('ERROR')
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]'
        }`}>
          {cmdResult}
        </div>
      )}
    </div>
  );
}
