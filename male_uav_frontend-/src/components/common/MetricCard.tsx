import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'warning';
  icon?: LucideIcon;
  subtext?: string;
  status?: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'HIGHLIGHT';
  onClick?: () => void;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  changeType = 'neutral',
  icon: Icon,
  subtext,
  status = 'NORMAL',
  onClick,
  badge,
}) => {
  const getStatusBorder = () => {
    switch (status) {
      case 'CRITICAL':
        return 'border-red-200 bg-red-50 hover:border-red-400';
      case 'WARNING':
        return 'border-amber-200 bg-amber-50 hover:border-amber-400';
      case 'HIGHLIGHT':
        return 'border-blue-200 bg-blue-50 hover:border-blue-400';
      default:
        return 'border-[#E2E8F0] bg-white hover:border-blue-300';
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':  return 'text-green-700';
      case 'negative':  return 'text-red-700';
      case 'warning':   return 'text-amber-700';
      default:          return 'text-[#334155]';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-2xl border transition-all duration-200 relative overflow-hidden group gcs-card ${getStatusBorder()} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="scan-line opacity-50" />
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-code font-bold text-[#1E293B] uppercase tracking-widest">
              {title}
            </span>
            {badge && (
              <span className="metric-card-badge text-[9px] font-mono-code px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {badge}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="metric-card-value font-mono-code font-bold text-2xl tracking-tight text-[#000000]">
              {typeof value === 'number' ? (Number.isInteger(value) ? value : Number(value.toFixed(2))) : value}
            </span>
            {unit && (
              <span className="text-xs font-mono-code text-[#334155] font-bold uppercase">
                {unit}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className="p-2 rounded bg-blue-50 border border-blue-200 text-blue-600 group-hover:scale-105 transition-transform">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {(change || subtext) && (
        <div className="mt-2 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] font-mono-code">
          {change && (
            <span className={`font-semibold ${getChangeColor()}`}>
              {change}
            </span>
          )}
          {subtext && (
            <span className="metric-card-subtext text-[#334155] font-medium truncate max-w-[180px]">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

