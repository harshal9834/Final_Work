import React from 'react';

export const ExplainabilityPanel: React.FC<{ explanations: any[] }> = ({ explanations }) => {
  if (explanations.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Explainable AI (XAI)</h3>
      <div className="space-y-3">
        {explanations.map((exp, i) => (
          <div key={i} className="text-sm">
            <div className="font-bold text-slate-700 mb-1">Prediction: {exp.prediction}</div>
            <div className="text-slate-600 mb-2"><strong>Reason:</strong> {exp.reason}</div>
            <div className="flex gap-2 text-xs">
              <span className="text-slate-500">Parameters:</span>
              <span className="font-mono bg-slate-100 px-1 rounded">{exp.parameters.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
