import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Sparkles, MapPin, Upload } from 'lucide-react';
import type { AIAnalysis } from '../types';

export default function ReportIssue() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'Low',
    location: '',
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AIAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAiAnalyze = async () => {
    if (!formData.description) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:3000/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: formData.description }),
      });
      const data: AIAnalysis = await response.json();
      setAiSuggestion(data);
      setFormData(prev => ({
        ...prev,
        category: data.category,
        severity: data.severity,
      }));
    } catch (error) {
      console.error('Failed to analyze', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const newReport = await response.json();
      alert(`Report submitted successfully! Your Tracking ID is: ${newReport.id}`);
      navigate('/track');
    } catch (error) {
      console.error('Failed to submit', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Report an Issue</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="report-form" onSubmit={handleSubmit} className="space-y-4">
                <Input 
                  label="Title" 
                  placeholder="e.g., Large pothole on Main St" 
                  required 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
                
                <div className="space-y-2">
                  <Textarea 
                    label="Description" 
                    placeholder="Describe the issue in detail..." 
                    required 
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="sm" 
                      onClick={handleAiAnalyze}
                      disabled={isAnalyzing || !formData.description}
                      className="gap-2"
                    >
                      <Sparkles size={16} />
                      {isAnalyzing ? 'Analyzing...' : 'Auto-Categorize with AI'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select 
                    label="Category" 
                    required 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    options={[
                      { value: 'Roads', label: 'Roads' },
                      { value: 'Water Supply', label: 'Water Supply' },
                      { value: 'Electricity', label: 'Electricity' },
                      { value: 'Waste Management', label: 'Waste Management' },
                      { value: 'Public Safety', label: 'Public Safety' },
                      { value: 'Others', label: 'Others' }
                    ]}
                  />
                  <Select 
                    label="Severity" 
                    required 
                    value={formData.severity}
                    onChange={e => setFormData({ ...formData, severity: e.target.value })}
                    options={[
                      { value: 'Low', label: 'Low' },
                      { value: 'Medium', label: 'Medium' },
                      { value: 'High', label: 'High' },
                      { value: 'Critical', label: 'Critical' }
                    ]}
                  />
                </div>

                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input 
                      label="Location" 
                      placeholder="Enter address or landmark" 
                      required 
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <Button type="button" variant="outline" className="gap-2" onClick={() => {
                    // Mock getting current location
                    setFormData({ ...formData, location: 'Current GPS Location' })
                  }}>
                    <MapPin size={16} />
                    Locate
                  </Button>
                </div>
                
                <div className="pt-2">
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Photo Evidence (Optional)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-sky-400 transition-colors cursor-pointer">
                    <Upload size={24} className="mb-2" />
                    <span className="text-sm">Click to upload or drag and drop</span>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" form="report-form" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {aiSuggestion ? (
            <Card className="border-sky-200 shadow-sky-100">
              <CardHeader className="bg-sky-50 pb-3">
                <CardTitle className="flex items-center gap-2 text-sky-800">
                  <Sparkles size={18} /> AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Suggested Department</span>
                  <span className="font-medium text-slate-800">{aiSuggestion.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Priority Score</span>
                  <Badge variant={aiSuggestion.priorityScore > 80 ? 'critical' : aiSuggestion.priorityScore > 50 ? 'high' : 'medium'}>
                    {aiSuggestion.priorityScore}/100
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Recommended Action</span>
                  <p className="text-slate-700 italic bg-slate-50 p-2 rounded border border-slate-100">
                    "{aiSuggestion.suggestedAction}"
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-slate-500 flex flex-col items-center gap-3">
                <Sparkles size={32} className="text-slate-300" />
                <p className="text-sm">Describe the issue and click Auto-Categorize to see AI suggestions.</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2">
              <p>• Provide a clear and concise description of the issue.</p>
              <p>• Include specific landmarks in the location if GPS is not accurate.</p>
              <p>• Photos help authorities assess the severity quickly.</p>
              <p>• False reporting may lead to a ban from the platform.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
