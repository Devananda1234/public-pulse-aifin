export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  image?: string;
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved';
  createdAt: string;
  updatedAt: string;
  department?: string;
}

export interface AIAnalysis {
  category: string;
  severity: string;
  department: string;
  priorityScore: number;
  suggestedAction: string;
}
