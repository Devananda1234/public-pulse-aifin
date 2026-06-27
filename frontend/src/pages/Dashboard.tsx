import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge, getSeverityBadgeVariant, getStatusBadgeVariant } from '../components/ui/Badge';
import type { Report } from '../types';
import { AlertCircle, CheckCircle2, Clock, Activity, MapPin } from 'lucide-react';

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/reports')
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const total = reports.length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;
  const active = total - resolved;
  const critical = reports.filter(r => r.severity === 'Critical' && r.status !== 'Resolved').length;

  const recentReports = [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Civic Dashboard</h1>
          <p className="text-slate-600 mt-1">Real-time overview of community reports and resolutions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-sky-500 to-sky-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sky-100 font-medium">Total Reports</p>
                <h3 className="text-3xl font-bold mt-2">{loading ? '-' : total}</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-lg"><Activity size={24} /></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 font-medium">Active Issues</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">{loading ? '-' : active}</h3>
              </div>
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Clock size={24} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 font-medium">Resolved</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">{loading ? '-' : resolved}</h3>
              </div>
              <div className="p-2 bg-green-100 text-green-600 rounded-lg"><CheckCircle2 size={24} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 font-medium">Critical</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">{loading ? '-' : critical}</h3>
              </div>
              <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertCircle size={24} /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Civic Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 text-center text-slate-500">Loading recent activities...</div>
            ) : recentReports.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No reports submitted yet. Be the first to report an issue!</div>
            ) : (
              recentReports.map(report => (
                <div key={report.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-800">{report.title}</h4>
                      <Badge variant={getStatusBadgeVariant(report.status)}>{report.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><MapPin size={14}/> {report.location}</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityBadgeVariant(report.severity)}>{report.severity}</Badge>
                    <Badge variant="outline">{report.category}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
