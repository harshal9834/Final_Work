import React from 'react';
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
