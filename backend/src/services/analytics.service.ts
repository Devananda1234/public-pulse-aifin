import Report from '../models/Report';

export const getDashboardStats = async () => {
  const total = await Report.countDocuments();
  const resolved = await Report.countDocuments({ status: 'Resolved' });
  const active = total - resolved;
  const critical = await Report.countDocuments({ severity: 'Critical', status: { $ne: 'Resolved' } });
  
  return { total, active, resolved, critical };
};
