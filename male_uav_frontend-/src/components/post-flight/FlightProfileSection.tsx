import React from 'react';
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
