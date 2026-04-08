import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'text-white shadow-glow-sm hover:shadow-glow hover:opacity-90',
  secondary: 'bg-white border border-surface-lighter text-navy-700 hover:bg-sky-50',
  ghost:     'text-slate-500 hover:text-navy-700 hover:bg-sky-50',
  danger:    'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200',
  success:   'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200',
};

const sizes = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-sm px-5 py-2.5 gap-2',
};

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false,
  icon: Icon, className = '', onClick, type = 'button',
}) {
  const primaryStyle = variant === 'primary'
    ? { background: 'linear-gradient(135deg,#E86C4A,#c85535)' }
    : {};

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={primaryStyle}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : Icon ? (
        <Icon size={14} />
      ) : null}
      {children}
    </button>
  );
}
