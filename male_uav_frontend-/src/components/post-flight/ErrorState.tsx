import React from 'react';

export const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="bg-white p-8 rounded-xl shadow-sm border border-red-200 text-center max-w-md">
      <div className="text-red-500 text-4xl mb-4">⚠️</div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Analysis Failed</h2>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);
