import { useState, useEffect } from 'react';
import { generateMaintenanceActions } from '../services/maintenanceAdvisor';

export function useMaintenance(rulData: any[], predictions: any[]) {
  const [actions, setActions] = useState<any[]>([]);

  useEffect(() => {
    setActions(generateMaintenanceActions(rulData, predictions));
  }, [rulData, predictions]);

  return actions;
}
