export function generateMaintenanceActions(rulData: any[], anomalies: any[]) {
  const actions = [];
  rulData.forEach(item => {
    if (item.rulHours < 500) {
      actions.push({
        priority: item.rulHours < 200 ? 'HIGH' : 'MEDIUM',
        component: item.component,
        action: `Inspect and service ${item.component}`,
        window: `${Math.round(item.rulHours * 0.8)} Flight Hours`,
        risk: item.rulHours < 200 ? 'CRITICAL' : 'ELEVATED'
      });
    }
  });
  return actions;
}
