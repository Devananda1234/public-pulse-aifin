import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge, getSeverityBadgeVariant } from '../components/ui/Badge';
import { Select } from '../components/ui/Input';
import type { Report } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminPanel() {
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/reports');
      const data = await res.json();
      setReports(data.sort((a: Report, b: Report) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await fetch(`http://localhost:3000/api/admin/reports/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchReports();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const chartData = [
    { name: 'Roads', count: reports.filter(r => r.category === 'Roads').length },
    { name: 'Water', count: reports.filter(r => r.category === 'Water Supply').length },
    { name: 'Power', count: reports.filter(r => r.category === 'Electricity').length },
    { name: 'Waste', count: reports.filter(r => r.category === 'Waste Management').length },
    { name: 'Safety', count: reports.filter(r => r.category === 'Public Safety').length },
    { name: 'Others', count: reports.filter(r => r.category === 'Others').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Panel</h1>
          <p className="text-slate-600 mt-1">Manage and resolve civic issues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Issue Management</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-medium">Tracking ID / Title</th>
                      <th className="px-6 py-3 font-medium">Category / Severity</th>
                      <th className="px-6 py-3 font-medium">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan={3} className="px-6 py-4 text-center">Loading...</td></tr>
                    ) : reports.map(report => (
                      <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{report.id}</div>
                          <div className="text-slate-500 truncate max-w-[200px]">{report.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <Badge variant="outline">{report.category}</Badge>
                            <Badge variant={getSeverityBadgeVariant(report.severity)}>{report.severity}</Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Select 
                              value={report.status} 
                              disabled={updatingId === report.id}
                              onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
                              options={[
                                { value: 'Submitted', label: 'Submitted' },
                                { value: 'Under Review', label: 'Under Review' },
                                { value: 'Assigned', label: 'Assigned' },
                                { value: 'In Progress', label: 'In Progress' },
                                { value: 'Resolved', label: 'Resolved' },
                              ]}
                              className="w-[160px] py-1.5 h-auto text-sm"
                            />
                            {updatingId === report.id && <span className="text-xs text-slate-400">Saving...</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
