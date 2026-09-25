import React from 'react';

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
