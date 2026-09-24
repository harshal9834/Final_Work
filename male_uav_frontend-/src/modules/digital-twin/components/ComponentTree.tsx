import React from 'react';
import { ENGINE_COMPONENTS_REGISTRY } from '../constants/engineComponents';
import { ComponentHealthStatus } from '../services/componentHealthEngine';

interface Props {
  selectedComponent: string | null;
  onSelectComponent: (name: string) => void;
  healthMap: Record<string, ComponentHealthStatus>;
}

export const ComponentTree: React.FC<Props> = ({ selectedComponent, onSelectComponent, healthMap }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-full overflow-y-auto">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Components List</h3>
      <div className="space-y-2">
        {ENGINE_COMPONENTS_REGISTRY.map((comp) => {
          const isSelected = selectedComponent === comp;
          const stat = healthMap[comp];
          const colorClass = stat?.status === 'CRITICAL' ? 'bg-red-500' : (stat?.status === 'WARNING' ? 'bg-yellow-500' : 'bg-green-500');
          
          return (
            <button
              key={comp}
              onClick={() => onSelectComponent(comp)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}
            >
              <span className={`text-sm truncate mr-2 ${isSelected ? 'text-blue-700 font-semibold' : 'text-slate-600'}`}>{comp}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-mono text-slate-400">{stat?.health.toFixed(0) || 100}%</span>
                <div className={`w-2 h-2 rounded-full ${colorClass}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
