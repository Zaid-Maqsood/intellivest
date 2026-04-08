import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, change, changeLabel, icon: Icon, iconColor = 'brand', index = 0, suffix = '' }) {
  const isPositive = change >= 0;

  const colorMap = {
    brand:   { bg: 'rgba(58,172,202,0.1)',  text: '#3AACCA' },
    emerald: { bg: 'rgba(16,185,129,0.1)',  text: '#10b981' },
    amber:   { bg: 'rgba(245,158,11,0.1)',  text: '#f59e0b' },
    rose:    { bg: 'rgba(244,63,94,0.1)',   text: '#f43f5e' },
    blue:    { bg: 'rgba(59,130,246,0.1)',  text: '#3b82f6' },
    coral:   { bg: 'rgba(232,108,74,0.1)', text: '#E86C4A' },
  };
  const col = colorMap[iconColor] || colorMap.brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="glass-card p-5 hover:shadow-card-hover transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        {Icon && (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: col.bg }}>
            <Icon size={18} style={{ color: col.text }} />
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-navy-800 mb-2">
        {value}{suffix}
      </p>

      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          {isPositive
            ? <TrendingUp size={13} className="text-emerald-500" />
            : <TrendingDown size={13} className="text-rose-500" />
          }
          <span className={`text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
          {changeLabel && <span className="text-xs text-slate-400">{changeLabel}</span>}
        </div>
      )}
    </motion.div>
  );
}
