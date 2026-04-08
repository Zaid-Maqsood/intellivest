import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Users, DollarSign, TrendingUp, AlertTriangle, Sparkles,
  ChevronRight, Clock, CheckCircle2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { analyticsAPI, complianceAPI } from '../services/api';
import StatCard from '../components/ui/StatCard';
import { PriorityBadge, SeverityBadge } from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/LoadingSpinner';
import { formatCurrency, formatPercent, formatRelativeTime } from '../utils/formatters';

const generateAumData = () => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let val = 380;
  return months.map((month) => {
    val = val + (Math.random() - 0.3) * 15;
    return { month, aum: Math.round(val * 10) / 10 };
  });
};

const MOCK_ACTIONS = [
  { id: 1, client_name: 'Alexandra Thornton', type: 'tax', priority: 'high', title: 'Q4 Tax-Loss Harvesting', estimated_impact: '$12,400 tax savings', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 2, client_name: 'Robert & Margaret Chen', type: 'portfolio', priority: 'high', title: 'Rebalance — Equity Drift 13%', estimated_impact: '0.4% risk improvement', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 3, client_name: 'Patricia Worthington', type: 'planning', priority: 'medium', title: 'ILIT Review Due', estimated_impact: 'Estate tax savings', created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: 4, client_name: 'David & Susan Kowalski', type: 'compliance', priority: 'critical', title: 'Suitability Review Overdue', estimated_impact: 'Regulatory compliance', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 5, client_name: 'Michael Torres', type: 'communication', priority: 'low', title: 'Q4 Report Ready to Send', estimated_impact: 'Client engagement', created_at: new Date(Date.now() - 7200000).toISOString() },
];

const ACTION_COLORS = {
  tax:           'text-amber-600 bg-amber-50 border border-amber-200',
  portfolio:     'text-brand-600 bg-sky-50 border border-sky-200',
  planning:      'text-emerald-600 bg-emerald-50 border border-emerald-200',
  compliance:    'text-rose-600 bg-rose-50 border border-rose-200',
  communication: 'text-blue-600 bg-blue-50 border border-blue-200',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-lg p-3 shadow-card" style={{ borderColor: '#C5E4EF' }}>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-semibold" style={{ color: '#3AACCA' }}>${payload[0]?.value}M AUM</p>
    </div>
  );
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [compliance, setCompliance] = useState([]);
  const [loading, setLoading] = useState(true);
  const aumData = generateAumData();

  useEffect(() => {
    Promise.all([
      analyticsAPI.summary().catch(() => ({ data: {} })),
      complianceAPI.logs({ resolved: 'false', limit: 4 }).catch(() => ({ data: { logs: [] } })),
    ]).then(([sumRes, compRes]) => {
      setSummary(sumRes.data.summary);
      setCompliance(compRes.data.logs || []);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { title: 'Total AUM', value: formatCurrency(summary?.total_aum || 487200000), change: 8.4, changeLabel: 'YTD', icon: DollarSign, iconColor: 'brand' },
    { title: 'Active Clients', value: summary?.active_clients || '—', change: 2.1, changeLabel: 'this month', icon: Users, iconColor: 'emerald' },
    { title: 'Avg. YTD Return', value: formatPercent(summary?.avg_ytd_return || 18.4), change: 3.2, changeLabel: 'vs benchmark', icon: TrendingUp, iconColor: 'amber' },
    { title: 'Open Alerts', value: compliance.length || summary?.pending_actions || '—', icon: AlertTriangle, iconColor: 'rose' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((s, i) => <StatCard key={s.title} {...s} index={i} />)
        }
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* AUM Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-navy-800">AUM Growth</h2>
              <p className="text-xs text-slate-400">Assets Under Management — 2024</p>
            </div>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              +8.4% YTD
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={aumData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3AACCA" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3AACCA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8EEF5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} width={52} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="aum" stroke="#3AACCA" strokeWidth={2} fill="url(#aumGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Compliance Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-navy-800">Compliance Alerts</h2>
            <Link to="/compliance" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1 transition-colors">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {compliance.length === 0 && (
              <div className="flex flex-col items-center py-6 text-slate-400">
                <CheckCircle2 size={24} className="mb-2 text-emerald-400" />
                <p className="text-sm">All clear</p>
              </div>
            )}
            {compliance.slice(0, 4).map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: '#F4FBFD', border: '1px solid #D8EEF5' }}
              >
                <AlertTriangle size={14} className={`mt-0.5 shrink-0 ${log.severity === 'critical' ? 'text-rose-500' : log.severity === 'warning' ? 'text-amber-500' : 'text-brand-500'}`} />
                <div className="min-w-0">
                  <p className="text-sm text-navy-700 font-medium truncate">{log.title}</p>
                  <p className="text-xs text-slate-400">{log.client_name} · {formatRelativeTime(log.created_at)}</p>
                </div>
                <SeverityBadge severity={log.severity} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Next-Best Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(232,108,74,0.1)' }}>
              <Sparkles size={14} style={{ color: '#E86C4A' }} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-navy-800">AI Next-Best Actions</h2>
              <p className="text-xs text-slate-400">Advisor Copilot — prioritized for today</p>
            </div>
          </div>
          <Link to="/clients" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1 transition-colors">
            See all clients <ChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {MOCK_ACTIONS.map((action, i) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.06 }}
              className="p-4 rounded-xl hover:shadow-card-hover transition-all duration-150 cursor-pointer group"
              style={{ background: '#F4FBFD', border: '1px solid #D8EEF5' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9BCAD8'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D8EEF5'}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ACTION_COLORS[action.type]}`}>
                  {action.type}
                </span>
                <PriorityBadge priority={action.priority} />
              </div>
              <p className="text-sm font-medium text-navy-700 mb-1 group-hover:text-navy-900 transition-colors">{action.title}</p>
              <p className="text-xs text-slate-400 mb-2">{action.client_name}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-600 font-medium">{action.estimated_impact}</span>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={11} />
                  {formatRelativeTime(action.created_at)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
