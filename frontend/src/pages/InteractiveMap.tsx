import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import { Card, CardContent } from '../components/ui/Card';
import { Badge, getSeverityBadgeVariant } from '../components/ui/Badge';
import type { Report } from '../types';

export default function InteractiveMap() {
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

  // Default center (mock)
  const defaultCenter: [number, number] = [40.7128, -74.0060]; // NYC

  // Generate random coords around default center for mock data since we don't have real geocoding in MVP
  const getMockCoords = (id: string): [number, number] => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const latOffset = (hash % 100) / 1000 - 0.05;
    const lngOffset = ((hash * 2) % 100) / 1000 - 0.05;
    return [defaultCenter[0] + latOffset, defaultCenter[1] + lngOffset];
  };

  const getMarkerColor = (severity: string) => {
    switch(severity) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Civic Heatmap & Locator</h1>
          <p className="text-slate-600 mt-1">Visualize reports geographically and identify hotspots.</p>
        </div>
      </div>

      <Card className="flex-1 min-h-[500px] flex flex-col overflow-hidden border-none shadow-md">
        <CardContent className="p-0 flex-1 relative z-0">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
              <div className="text-slate-500">Loading map data...</div>
            </div>
          ) : (
            <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom={true} className="w-full h-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {reports.map((report) => {
                const coords = getMockCoords(report.id);
                const color = getMarkerColor(report.severity);
                
                return (
                  <CircleMarker 
                    key={report.id} 
                    center={coords} 
                    pathOptions={{ fillColor: color, color: color, fillOpacity: 0.7, weight: 2 }}
                    radius={8}
                  >
                    <Popup className="rounded-lg">
                      <div className="p-1 min-w-[200px]">
                        <h3 className="font-bold text-slate-800 mb-1">{report.title}</h3>
                        <div className="flex gap-2 mb-2">
                          <Badge variant={getSeverityBadgeVariant(report.severity)}>{report.severity}</Badge>
                          <Badge variant="outline">{report.category}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{report.location}</p>
                        <div className="text-xs text-slate-400">ID: {report.id}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-center gap-6 pt-2">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-sm font-medium text-slate-600">Critical</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span><span className="text-sm font-medium text-slate-600">High</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span><span className="text-sm font-medium text-slate-600">Medium</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-sm font-medium text-slate-600">Low</span></div>
      </div>
    </div>
  );
}
