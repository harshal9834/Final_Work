import React from 'react';

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
