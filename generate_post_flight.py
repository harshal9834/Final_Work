import os

FRONTEND_DIR = "MALE_UAV/male_uav_frontend-/src"

files = {
    "pages/PostFlightAnalysisPage.tsx": """import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MissionSummaryCard } from '../components/post-flight/MissionSummaryCard';
import { FlightProfileSection } from '../components/post-flight/FlightProfileSection';
import { EngineAnalysisSection } from '../components/post-flight/EngineAnalysisSection';
import { FuelAnalysisSection } from '../components/post-flight/FuelAnalysisSection';
import { KPICardsSection } from '../components/post-flight/KPICardsSection';
import { LoadingState } from '../components/post-flight/LoadingState';
import { ErrorState } from '../components/post-flight/ErrorState';

export const PostFlightAnalysisPage = () => {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/missions/post-flight-analysis/${missionId}`);
        if (!response.ok) throw new Error('Analysis not found');
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [missionId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.missionSummary.missionName}</h1>
            <p className="text-sm text-gray-500">ID: {data.missionSummary.missionId} | Date: {new Date(data.missionSummary.takeoffTime).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${data.missionSummary.missionSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {data.missionSummary.missionStatus}
            </span>
            <p className="text-sm text-gray-500 mt-2">Duration: {Math.floor(data.missionSummary.missionDuration / 60)}m {data.missionSummary.missionDuration % 60}s</p>
          </div>
        </div>

        {/* Mission Replay Integration */}
        <div className="flex gap-4">
          <button onClick={() => navigate(`/replay/${missionId}`)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow transition-colors">
            View Mission Replay
          </button>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded shadow-sm transition-colors">
            View Alerts
          </button>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded shadow-sm transition-colors">
            View Mission Timeline
          </button>
        </div>

        {/* Sections */}
        <MissionSummaryCard summary={data.missionSummary} />
        <KPICardsSection kpis={data.kpis} />
        <FlightProfileSection profile={data.flightProfile} charts={data.charts} />
        <EngineAnalysisSection engine={data.engineAnalysis} charts={data.charts} />
        <FuelAnalysisSection fuel={data.fuelAnalysis} charts={data.charts} />
      </div>
    </div>
  );
};
""",
    "components/post-flight/MissionSummaryCard.tsx": """import React from 'react';

export const MissionSummaryCard = ({ summary }: { summary: any }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Mission Summary</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div>
        <p className="text-sm text-gray-500">Takeoff Time</p>
        <p className="font-semibold">{new Date(summary.takeoffTime).toLocaleTimeString()}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Landing Time</p>
        <p className="font-semibold">{new Date(summary.landingTime).toLocaleTimeString()}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Distance Covered</p>
        <p className="font-semibold">{(summary.distanceCovered).toFixed(2)} km</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Max Altitude</p>
        <p className="font-semibold">{Math.round(summary.maximumAltitude)} ft</p>
      </div>
    </div>
  </div>
);
""",
    "components/post-flight/KPICardsSection.tsx": """import React from 'react';

export const KPICardsSection = ({ kpis }: { kpis: any }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <KPICard title="Mission Duration" value={`${Math.floor(kpis.missionDuration / 60)}m ${kpis.missionDuration % 60}s`} />
    <KPICard title="Fuel Used" value={`${kpis.fuelUsed.toFixed(2)} kg`} />
    <KPICard title="Max RPM" value={`${Math.round(kpis.maxRPM)}`} />
    <KPICard title="Engine Health" value={`${kpis.engineHealth.toFixed(1)}%`} />
  </div>
);

const KPICard = ({ title, value }: { title: string, value: string }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
    <p className="text-sm text-gray-500 text-center">{title}</p>
    <p className="text-2xl font-bold text-blue-600 mt-2">{value}</p>
  </div>
);
""",
    "components/post-flight/FlightProfileSection.tsx": """import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const FlightProfileSection = ({ profile, charts }: { profile: any, charts: any }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Flight Profile Analysis</h2>
    <div className="h-64 mb-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={charts.telemetry}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
          <YAxis />
          <Tooltip labelFormatter={(t) => new Date(t).toLocaleTimeString()} />
          <Line type="monotone" dataKey="altitude" stroke="#2563eb" name="Altitude (ft)" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <PhaseCard title="Ground Time" value={`${profile.groundTime.toFixed(1)}s`} />
      <PhaseCard title="Takeoff" value={`${profile.takeoffDuration.toFixed(1)}s`} />
      <PhaseCard title="Climb" value={`${profile.climbDuration.toFixed(1)}s`} />
      <PhaseCard title="Cruise" value={`${profile.cruiseDuration.toFixed(1)}s`} />
      <PhaseCard title="Loiter" value={`${profile.loiterDuration.toFixed(1)}s`} />
      <PhaseCard title="Descent" value={`${profile.descentDuration.toFixed(1)}s`} />
    </div>
  </div>
);

const PhaseCard = ({ title, value }: { title: string, value: string }) => (
  <div className="p-3 bg-gray-50 rounded border border-gray-100">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="font-semibold text-gray-800">{value}</p>
  </div>
);
""",
    "components/post-flight/EngineAnalysisSection.tsx": """import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const EngineAnalysisSection = ({ engine, charts }: { engine: any, charts: any }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Engine Performance Analysis</h2>
    <div className="h-64 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={charts.telemetry}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
          <YAxis />
          <Tooltip labelFormatter={(t) => new Date(t).toLocaleTimeString()} />
          <Line type="monotone" dataKey="rpm" stroke="#16a34a" name="RPM" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={charts.telemetry}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
          <YAxis />
          <Tooltip labelFormatter={(t) => new Date(t).toLocaleTimeString()} />
          <Line type="monotone" dataKey="chtAvg" stroke="#dc2626" name="CHT" dot={false} />
          <Line type="monotone" dataKey="egtAvg" stroke="#f59e0b" name="EGT" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Avg RPM" value={Math.round(engine.averageRPM)} />
      <StatCard title="Max RPM" value={Math.round(engine.maximumRPM)} />
      <StatCard title="Avg CHT" value={`${engine.averageCHT.toFixed(1)} °C`} />
      <StatCard title="Max CHT" value={`${engine.maximumCHT.toFixed(1)} °C`} />
      <StatCard title="Avg EGT" value={`${engine.averageEGT.toFixed(1)} °C`} />
      <StatCard title="Max EGT" value={`${engine.maximumEGT.toFixed(1)} °C`} />
      <StatCard title="Avg Oil Temp" value={`${engine.averageOilTemperature.toFixed(1)} °C`} />
      <StatCard title="Max Oil Temp" value={`${engine.maximumOilTemperature.toFixed(1)} °C`} />
    </div>
  </div>
);

const StatCard = ({ title, value }: { title: string, value: any }) => (
  <div className="p-3 bg-gray-50 rounded border border-gray-100">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="font-semibold text-gray-800">{value}</p>
  </div>
);
""",
    "components/post-flight/FuelAnalysisSection.tsx": """import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const FuelAnalysisSection = ({ fuel, charts }: { fuel: any, charts: any }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Fuel Analysis</h2>
    <div className="h-64 mb-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={charts.telemetry}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
          <YAxis />
          <Tooltip labelFormatter={(t) => new Date(t).toLocaleTimeString()} />
          <Area type="monotone" dataKey="fuelRemaining" stroke="#9333ea" fill="#e9d5ff" name="Fuel Remaining (kg)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Starting Fuel" value={`${fuel.startingFuel?.toFixed(2) || 0} kg`} />
      <StatCard title="Ending Fuel" value={`${fuel.endingFuel?.toFixed(2) || 0} kg`} />
      <StatCard title="Fuel Consumed" value={`${fuel.fuelConsumed?.toFixed(2) || 0} kg`} />
      <StatCard title="Avg Burn Rate" value={`${fuel.averageFuelBurnRate?.toFixed(2) || 0} kg/hr`} />
    </div>
  </div>
);

const StatCard = ({ title, value }: { title: string, value: any }) => (
  <div className="p-3 bg-gray-50 rounded border border-gray-100">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="font-semibold text-gray-800">{value}</p>
  </div>
);
""",
    "components/post-flight/LoadingState.tsx": """import React from 'react';

export const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Generating Post Flight Analysis...</p>
    </div>
  </div>
);
""",
    "components/post-flight/ErrorState.tsx": """import React from 'react';

export const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="bg-white p-8 rounded-xl shadow-sm border border-red-200 text-center max-w-md">
      <div className="text-red-500 text-4xl mb-4">⚠️</div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Analysis Failed</h2>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);
"""
}

def create_files():
    for filepath, content in files.items():
        full_path = os.path.join(FRONTEND_DIR, filepath)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Created {full_path}")

if __name__ == "__main__":
    create_files()
