import Report from '../models/Report';

export const getDashboardStats = () => {
  const reports = Report.find();
  
  const total = reports.length;
  const resolved = reports.filter((r: any) => r.status === 'Resolved').length;
  const active = total - resolved;
  const critical = reports.filter((r: any) => r.severity === 'Critical' && r.status !== 'Resolved').length;
  
  return { total, active, resolved, critical };
};
