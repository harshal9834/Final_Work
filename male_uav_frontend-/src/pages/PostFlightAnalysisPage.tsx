import React, { useEffect, useState } from 'react';
import { ClipboardList, Download, AlertTriangle, ShieldCheck, Activity, Map, Navigation, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

export const PostFlightAnalysisPage = () => {
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SIMULATOR_URL}/api/postflight/missions`)
      .then(r => r.json())
      .then(res => {
        setMissions(res);
        if (res.length > 0) setSelectedMissionId(res[0].id);
      })
      .catch(e => setError('Failed to load mission list: ' + e.message));
  }, []);

  useEffect(() => {
    if (!selectedMissionId) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_SIMULATOR_URL}/api/postflight/${selectedMissionId}`)
      .then(r => r.json())
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [selectedMissionId]);

  if (error) return <div className="p-6 text-red-500 font-bold uppercase">{error}</div>;

  const handleExport = () => {
    window.print();
  };

  const getStats = () => {
    if (!data) return null;
    const t = data.telemetryHistory || [];
    const f = data.faultHistories || [];
    const ai = data.aiInterventions || [];

    const durationHrs = data.durationSeconds ? (data.durationSeconds / 3600) : 0;
    const fuelConsumed = t.length > 0 ? (t[0].fuelRemaining - t[t.length - 1].fuelRemaining) : 0;
    const distanceCovered = data.totalDistance || (t.length * 0.1);

    const maxRpm = Math.max(...t.map((x: any) => x.rpm), 0);
    const minRpm = Math.min(...t.map((x: any) => x.rpm), 0);
    const avgRpm = t.length > 0 ? t.reduce((s: number, x: any) => s + x.rpm, 0) / t.length : 0;

    const maxCht = Math.max(...t.map((x: any) => x.chtAvg), 0);
    const maxEgt = Math.max(...t.map((x: any) => x.egtAvg), 0);
    const maxOil = Math.max(...t.map((x: any) => x.oilTemp), 0);

    const criticalFaults = f.filter((x: any) => x.severity === 'CRITICAL').length;
    const warningFaults = f.filter((x: any) => x.severity === 'WARNING').length;

    const missionSuccess = data.status === 'SUCCESS' ? 100 : (data.status === 'FAILED' ? 0 : 50);
    const engineRel = Math.max(0, 100 - (criticalFaults * 10 + warningFaults * 2));
    const aiRecoveryEff = ai.length > 0 ? 100 : 0; // simplistic for visual
    const overallGrade = ((missionSuccess + engineRel + (aiRecoveryEff || 100)) / 3).toFixed(1);

    return {
      durationHrs, fuelConsumed, distanceCovered, maxRpm, minRpm, avgRpm, maxCht, maxEgt, maxOil,
      criticalFaults, warningFaults, missionSuccess, engineRel, aiRecoveryEff, overallGrade,
      t, f, ai, e: data.missionEvents || []
    };
  };

  const stats = getStats();

  return (
    <div className="p-6 bg-slate-50 min-h-full font-sans text-slate-900 max-w-[1920px] mx-auto space-y-6">
      
      {/* HEADER & SELECTOR */}
      <div className="flex justify-between items-end border-b border-slate-300 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-indigo-600" />
            Post Flight Analysis Center
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">
            Mission Debrief, Analytics, and AAR Generation
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <select 
            className="p-2 border border-slate-300 rounded font-bold text-sm bg-white uppercase shadow-sm"
            value={selectedMissionId}
            onChange={(e) => setSelectedMissionId(e.target.value)}
          >
            {missions.map(m => (
              <option key={m.id} value={m.id}>{m.missionName} ({m.missionId}) - {new Date(m.startTime).toLocaleDateString()}</option>
            ))}
          </select>
          <button onClick={handleExport} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-xs rounded flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {loading && <div className="text-center p-12 font-bold uppercase text-slate-400">Processing Mission Data...</div>}

      {!loading && data && stats && (
        <div className="space-y-6 print:space-y-4">
          
          {/* MISSION SUMMARY CARD */}
          <div className="bg-white rounded border border-slate-200 shadow-sm p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="col-span-2">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Mission Name</div>
              <div className="font-black text-slate-800">{data.missionName}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">{data.missionId}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">UAV</div>
              <div className="font-bold text-slate-700">{data.uavId}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Duration</div>
              <div className="font-bold text-slate-700">{stats.durationHrs.toFixed(2)} Hrs</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Status</div>
              <div className={`font-black uppercase ${data.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>{data.status}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Distance</div>
              <div className="font-bold text-slate-700">{stats.distanceCovered.toFixed(1)} km</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Fuel Consumed</div>
              <div className="font-bold text-slate-700">{stats.fuelConsumed > 0 ? stats.fuelConsumed.toFixed(1) : (data.fuelConsumed || 0).toFixed(1)} kg</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Overall Grade</div>
              <div className="font-black text-indigo-600">{stats.overallGrade}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* ENGINE HEALTH ANALYSIS */}
            <div className="bg-white rounded border border-slate-200 shadow-sm flex flex-col">
              <div className="border-b border-slate-200 p-3 bg-slate-50 flex justify-between items-center">
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4 text-rose-500"/> Engine Health Analysis</span>
              </div>
              <div className="p-4 flex-1">
                <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Max RPM</div>
                    <div className="font-bold font-mono text-slate-700">{stats.maxRpm.toFixed(0)}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Max CHT</div>
                    <div className="font-bold font-mono text-slate-700">{stats.maxCht.toFixed(1)}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Max EGT</div>
                    <div className="font-bold font-mono text-slate-700">{stats.maxEgt.toFixed(1)}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Max Oil Temp</div>
                    <div className="font-bold font-mono text-slate-700">{stats.maxOil.toFixed(1)}</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.t}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString()} stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip labelFormatter={(t) => new Date(t).toLocaleTimeString()} />
                    <Line type="monotone" dataKey="rpm" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="RPM" yAxisId={0} />
                    <Line type="monotone" dataKey="chtAvg" stroke="#ef4444" strokeWidth={1.5} dot={false} name="CHT" yAxisId={0} />
                    <Line type="monotone" dataKey="egtAvg" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="EGT" yAxisId={0} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* FAULT ANALYSIS */}
            <div className="bg-white rounded border border-slate-200 shadow-sm flex flex-col">
              <div className="border-b border-slate-200 p-3 bg-slate-50 flex justify-between items-center">
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500"/> Fault Analysis</span>
                <span className="text-xs font-bold text-slate-500">Total: {stats.f.length}</span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto max-h-[300px]">
                {stats.f.length === 0 ? (
                  <div className="text-center text-slate-400 text-xs font-bold py-10 uppercase tracking-widest">No faults recorded.</div>
                ) : (
                  <div className="space-y-2">
                    {stats.f.map((f: any) => (
                      <div key={f.id} className="border border-slate-200 rounded p-3 text-xs bg-slate-50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-black text-slate-800">{f.faultType}</span>
                          <span className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${f.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{f.severity}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">Time: {new Date(f.injectedAt).toLocaleTimeString()} | System: {f.affectedSystems}</div>
                        {f.aiResponse && <div className="mt-1 text-[10px] text-indigo-600 font-bold border-t border-slate-200 pt-1">AI Action: {f.aiResponse}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* AI INTERVENTION ANALYSIS */}
            <div className="bg-slate-900 rounded border border-slate-800 shadow-sm flex flex-col text-white">
              <div className="border-b border-slate-800 p-3 bg-slate-950 flex justify-between items-center">
                <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400"/> AI Intervention Analysis</span>
                <span className="text-xs font-bold text-slate-400">Actions: {stats.ai.length}</span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto max-h-[300px]">
                {stats.ai.length === 0 ? (
                  <div className="text-center text-slate-600 text-xs font-bold py-10 uppercase tracking-widest">Autonomous Systems Inactive.</div>
                ) : (
                  <div className="space-y-3">
                    {stats.ai.map((a: any) => (
                      <div key={a.id} className="border-l-2 border-indigo-500 pl-3 py-1">
                        <div className="text-xs font-black text-indigo-300">{a.actionType}</div>
                        <div className="text-[10px] text-slate-300 my-1">{a.reason}</div>
                        <div className="text-[9px] text-slate-500 font-mono">{new Date(a.timestamp).toLocaleTimeString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* MISSION TIMELINE */}
            <div className="bg-white rounded border border-slate-200 shadow-sm flex flex-col">
              <div className="border-b border-slate-200 p-3 bg-slate-50 flex justify-between items-center">
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500"/> Mission Timeline</span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto max-h-[300px] relative">
                <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-200"></div>
                <div className="space-y-4">
                  {/* Generate an automatic timeline if none present, otherwise map e */}
                  <div className="relative pl-6 flex items-center gap-3">
                    <div className="absolute left-[-5px] w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow"></div>
                    <div className="text-[10px] font-mono text-slate-400 w-16">{new Date(data.startTime).toLocaleTimeString()}</div>
                    <div className="text-xs font-bold text-slate-700">Takeoff Initiated</div>
                  </div>
                  {stats.e.map((ev: any) => (
                    <div key={ev.id} className="relative pl-6 flex items-center gap-3">
                      <div className={`absolute left-[-5px] w-2.5 h-2.5 rounded-full border-2 border-white shadow ${ev.severity === 'CRITICAL' ? 'bg-red-500' : ev.severity === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                      <div className="text-[10px] font-mono text-slate-400 w-16">{new Date(ev.timestamp).toLocaleTimeString()}</div>
                      <div className="text-xs font-bold text-slate-700">{ev.title || ev.eventType}</div>
                    </div>
                  ))}
                  {data.endTime && (
                    <div className="relative pl-6 flex items-center gap-3">
                      <div className="absolute left-[-5px] w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-white shadow"></div>
                      <div className="text-[10px] font-mono text-slate-400 w-16">{new Date(data.endTime).toLocaleTimeString()}</div>
                      <div className="text-xs font-bold text-slate-700">Mission Terminated</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
          </div>

          {/* AFTER ACTION REPORT SECTION */}
          <div className="bg-white rounded border border-slate-200 shadow-sm p-6 print:block">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">After Action Report (AAR)</h2>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <h3 className="font-bold text-slate-700 uppercase text-[10px] tracking-widest mb-1">Mission Objective</h3>
                <p className="text-slate-600 mb-4">{data.missionName} executed via UAV platform {data.uavId}. Required complete telemetry mapping and event simulation.</p>
                
                <h3 className="font-bold text-slate-700 uppercase text-[10px] tracking-widest mb-1">Mission Outcome</h3>
                <p className="text-slate-600 mb-4">Mission concluded with status: <strong className={data.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>{data.status}</strong>. Overall performance grade calculated at {stats.overallGrade}%.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-700 uppercase text-[10px] tracking-widest mb-1">Fault Summary</h3>
                <p className="text-slate-600 mb-4">Encountered {stats.criticalFaults} critical faults and {stats.warningFaults} warnings during operation.</p>
                
                <h3 className="font-bold text-slate-700 uppercase text-[10px] tracking-widest mb-1">AI Actions</h3>
                <p className="text-slate-600 mb-4">Autonomous system intervened {stats.ai.length} times to maintain flight envelope and optimize engine parameters.</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h3 className="font-bold text-slate-700 uppercase text-[10px] tracking-widest mb-1">Recommendations</h3>
              <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
                {stats.criticalFaults > 0 ? <li>Immediate maintenance required on systems triggering CRITICAL faults.</li> : <li>Routine maintenance procedures apply.</li>}
                {stats.maxCht > 130 && <li>Investigate cooling system efficiency; CHT exceeded 130°C.</li>}
                <li>Review AI throttle corrections for potential mapping improvements.</li>
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
