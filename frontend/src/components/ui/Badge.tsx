import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'critical' | 'high' | 'medium' | 'resolved' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    critical: 'bg-red-100 text-red-800 border border-red-200',
    high: 'bg-orange-100 text-orange-800 border border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    resolved: 'bg-green-100 text-green-800 border border-green-200',
    outline: 'border border-slate-300 text-slate-700 bg-white',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const getSeverityBadgeVariant = (severity: string): BadgeProps['variant'] => {
  switch (severity.toLowerCase()) {
    case 'critical': return 'critical';
    case 'high': return 'high';
    case 'medium': return 'medium';
    default: return 'default';
  }
};

export const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
  switch (status.toLowerCase()) {
    case 'resolved': return 'resolved';
    case 'in progress': return 'high';
    case 'assigned': return 'medium';
    case 'submitted': return 'default';
    default: return 'outline';
  }
};
