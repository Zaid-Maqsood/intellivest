import React from 'react';

const variants = {
  default: 'bg-slate-100 text-slate-500 border-slate-200',
  brand:   'bg-sky-50 text-brand-600 border-brand-200',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  amber:   'bg-amber-50 text-amber-600 border-amber-200',
  rose:    'bg-rose-50 text-rose-600 border-rose-200',
  blue:    'bg-blue-50 text-blue-600 border-blue-200',
  coral:   'bg-orange-50 text-coral-500 border-orange-200',
};

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}

export const PriorityBadge = ({ priority }) => {
  const map = { critical: 'rose', high: 'amber', medium: 'blue', low: 'default' };
  return <Badge variant={map[priority] || 'default'}>{priority}</Badge>;
};

export const SeverityBadge = ({ severity }) => {
  const map = { critical: 'rose', error: 'rose', warning: 'amber', info: 'brand' };
  return <Badge variant={map[severity] || 'default'}>{severity}</Badge>;
};

export const RiskBadge = ({ risk }) => {
  const map = { conservative: 'emerald', moderate: 'amber', aggressive: 'rose' };
  return <Badge variant={map[risk] || 'default'}>{risk}</Badge>;
};

export const StatusBadge = ({ status }) => {
  const map = { active: 'emerald', inactive: 'default', prospect: 'brand', completed: 'emerald', draft: 'amber', archived: 'default' };
  return <Badge variant={map[status] || 'default'}>{status}</Badge>;
};
