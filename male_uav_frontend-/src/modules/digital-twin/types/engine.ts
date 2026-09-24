export interface EngineComponent {
  id: string;
  name: string;
  health: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  temperature?: number;
  pressure?: number;
  telemetryValues?: Record<string, any>;
}

export interface EngineHealth {
  overallHealth: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}
