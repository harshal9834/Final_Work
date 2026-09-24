import React from 'react';
import { HealthStatus, AlertSeverity } from '../../types';

interface StatusBadgeProps {
  status: HealthStatus | AlertSeverity | 'VERIFIED' | 'DISPARITY' | 'ACTIVE' | 'STANDBY' | 'OPTIMAL' | 'ELEVATED';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', pulse = false }) => {
  const getStyles = () => {
    switch (status) {
      case 'HEALTHY':
      case 'VERIFIED':
      case 'OPTIMAL':
      case 'ACTIVE':
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          text: 'text-green-900',
          dot: 'bg-green-600',
          label: status,
        };
      case 'WARNING':
      case 'ELEVATED':
      case 'NOTICE':
        return {
          bg: 'bg-amber-100',
          border: 'border-amber-300',
          text: 'text-amber-900',
          dot: 'bg-amber-600',
          label: status,
        };
      case 'CRITICAL':
      case 'DISPARITY':
        return {
          bg: 'bg-red-100',
          border: 'border-red-300',
          text: 'text-red-900',
          dot: 'bg-red-600',
          label: status,
        };
      case 'MAINTENANCE':
        return {
          bg: 'bg-purple-100',
          border: 'border-purple-300',
          text: 'text-purple-900',
          dot: 'bg-purple-600',
          label: status,
        };
      case 'OFFLINE':
      case 'STANDBY':
      case 'INFO':
      default:
        return {
          bg: 'bg-slate-100',
          border: 'border-slate-300',
          text: 'text-slate-800',
          dot: 'bg-slate-500',
          label: status,
        };
    }
  };

  const config = getStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono-code font-bold uppercase tracking-wider rounded border ${
        config.bg
      } ${config.border} ${config.text} ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} led-glow ${
          pulse ? 'animate-ping' : ''
        }`}
      />
      {config.label}
    </span>
  );
};

