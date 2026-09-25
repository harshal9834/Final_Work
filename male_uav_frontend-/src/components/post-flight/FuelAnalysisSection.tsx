import React from 'react';
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
