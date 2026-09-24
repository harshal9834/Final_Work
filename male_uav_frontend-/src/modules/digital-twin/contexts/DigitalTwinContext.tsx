import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useGcs } from '../../../contexts/GcsContext';

export interface ComponentState {
  id: string;
  name: string;
  health: number;
  temperature: number;
  pressure: number;
  vibration: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  activeFaults: string[];
}

interface DigitalTwinState {
  components: Record<string, ComponentState>;
  twinSync: number;
  transparentMode: boolean;
  explodedView: boolean;
  setTransparentMode: (v: boolean) => void;
  setExplodedView: (v: boolean) => void;
  selectedComponent: string | null;
  setSelectedComponent: (id: string | null) => void;
}

const DigitalTwinContext = createContext<DigitalTwinState | undefined>(undefined);

export const DigitalTwinProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { telemetry, activeFaults } = useGcs();
  const [transparentMode, setTransparentMode] = useState(false);
  const [explodedView, setExplodedView] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const state = useMemo(() => {
    // Generate component states based on telemetry
    const components: Record<string, ComponentState> = {};
    const faultNames = activeFaults.map(f => f.name);
    
    // Helper to generate state
    const gen = (name: string, baseTemp: number, baseVib: number): ComponentState => {
      const compFaults = faultNames.filter(f => f.includes(name) || (name === 'Main Engine' && f.includes('Misfire')));
      const health = compFaults.length > 0 ? 40 : 100;
      return {
        id: name,
        name,
        health,
        temperature: baseTemp + (compFaults.includes('Overheating') ? 50 : 0),
        pressure: telemetry?.oilPressureBar || 4.2,
        vibration: baseVib + (compFaults.length > 0 ? 2 : 0),
        status: health > 80 ? 'HEALTHY' : health > 50 ? 'WARNING' : 'CRITICAL',
        activeFaults: compFaults
      };
    };

    components['Main Engine'] = gen('Main Engine', telemetry?.chtC?.[0] || 212, telemetry?.vibrationRmsMmS || 3.1);
    components['Intercooler'] = gen('Intercooler', telemetry?.ambientTempC || 25, 1.0);
    components['Turbocharger'] = gen('Turbocharger', telemetry?.egtC?.[0] || 720, 4.5);
    components['Gearbox'] = gen('Gearbox', telemetry?.oilTempC || 90, telemetry?.vibrationRmsMmS || 3.1);
    
    return {
      components,
      twinSync: 99.8,
      transparentMode,
      setTransparentMode,
      explodedView,
      setExplodedView,
      selectedComponent,
      setSelectedComponent
    };
  }, [telemetry, activeFaults, transparentMode, explodedView, selectedComponent]);

  return <DigitalTwinContext.Provider value={state}>{children}</DigitalTwinContext.Provider>;
};

export const useDigitalTwin = () => {
  const ctx = useContext(DigitalTwinContext);
  if (!ctx) throw new Error("useDigitalTwin must be used within DigitalTwinProvider");
  return ctx;
};
