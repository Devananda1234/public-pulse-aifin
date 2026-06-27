import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge, getSeverityBadgeVariant, getStatusBadgeVariant } from '../components/ui/Badge';
import { Search, CheckCircle2, Circle, Clock, MapPin } from 'lucide-react';
import type { Report } from '../types';

export default function TrackIssue() {
  const [trackingId, setTrackingId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;
    
    setIsSearching(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/api/reports');
      const reports: Report[] = await response.json();
      const found = reports.find(r => r.id === trackingId);
      
      if (found) {
        setReport(found);
      } else {
        setReport(null);
        setError('No report found with this Tracking ID.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch report.');
    } finally {
      setIsSearching(false);
    }
  };

  const steps = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
  
  const getStepIndex = (status: string) => {
    return steps.indexOf(status);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Track Issue Status</h1>
        <p className="text-slate-600">Enter your Tracking ID to see real-time updates.</p>
      </div>

      <Card className="max-w-xl mx-auto border-sky-100 shadow-md">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <Input 
                placeholder="e.g., PPAI-2026-1234" 
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                error={error}
              />
            </div>
            <Button type="submit" disabled={isSearching || !trackingId} className="gap-2 shrink-0 h-10 mt-[2px]">
              <Search size={18} />
              {isSearching ? 'Searching...' : 'Track'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {report && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-xl mb-1">{report.title}</CardTitle>
                <div className="text-sm text-slate-500 font-medium">Tracking ID: {report.id}</div>
              </div>
              <Badge variant={getStatusBadgeVariant(report.status)} className="text-sm px-3 py-1">
                {report.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Category</div>
                  <div className="font-medium text-slate-800">{report.category}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Severity</div>
                  <Badge variant={getSeverityBadgeVariant(report.severity)}>{report.severity}</Badge>
                </div>
                <div className="col-span-2 md:col-span-2">
                  <div className="text-sm text-slate-500 mb-1">Location</div>
                  <div className="font-medium text-slate-800 flex items-start gap-1">
                    <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">{report.location}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500 mb-1">Description</div>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {report.description}
                </p>
              </div>

              {/* Timeline Tracker */}
              <div className="pt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Progress Tracker</h4>
                <div className="relative">
                  {/* Line connecting steps */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200" />
                  
                  <div className="relative flex justify-between">
                    {steps.map((step, idx) => {
                      const currentStepIdx = getStepIndex(report.status);
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      
                      return (
                        <div key={step} className="flex flex-col items-center gap-2 z-10 w-24 text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 transition-colors ${
                            isCompleted ? 'border-sky-500 text-sky-500' : 'border-slate-300 text-slate-300'
                          }`}>
                            {isCompleted ? <CheckCircle2 size={20} className={isCurrent ? 'animate-pulse' : ''} /> : <Circle size={12} fill="currentColor" />}
                          </div>
                          <span className={`text-xs font-medium ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 justify-end pt-4 border-t border-slate-100">
                <Clock size={14} />
                Last updated: {new Date(report.updatedAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
