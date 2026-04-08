import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { complianceAPI } from '../services/api';
import { SeverityBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatRelativeTime } from '../utils/formatters';

const SEVERITY_CONFIG = {
  critical: { icon: XCircle,      bg: '#fef2f2', iconColor: '#dc2626', border: '#fca5a5' },
  error:    { icon: XCircle,      bg: '#fef2f2', iconColor: '#dc2626', border: '#fca5a5' },
  warning:  { icon: AlertTriangle, bg: '#fffbeb', iconColor: '#d97706', border: '#fde68a' },
  info:     { icon: Info,          bg: '#eff6ff', iconColor: '#2563eb', border: '#bfdbfe' },
};

const STAT_COLORS = {
  amber: { bg: '#fffbeb', text: '#d97706' },
  rose:  { bg: '#fef2f2', text: '#dc2626' },
  blue:  { bg: '#eff6ff', text: '#2563eb' },
};

const inputStyle = { background: '#EBF8FC', border: '1px solid #C5E4EF', color: '#1C3A5C' };

export default function Compliance() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [resolvedFilter, setResolvedFilter] = useState('');

  const load = () => {
    setLoading(true);
    complianceAPI.logs({ severity: filter, resolved: resolvedFilter, limit: 50 })
      .then((res) => { setLogs(res.data.logs || []); setStats(res.data.stats || {}); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, resolvedFilter]);

  const resolve = async (id) => { await complianceAPI.resolve(id); load(); };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open Issues', value: stats.open_count || 0, icon: AlertTriangle, color: 'amber' },
          { label: 'Critical', value: stats.critical_count || 0, icon: XCircle, color: 'rose' },
          { label: 'Warnings', value: stats.warning_count || 0, icon: Shield, color: 'blue' },
        ].map((s, i) => {
          const Icon = s.icon;
          const col = STAT_COLORS[s.color];
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: col.bg }}>
                  <Icon size={18} style={{ color: col.text }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-navy-800">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm focus:outline-none cursor-pointer" style={inputStyle}>
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
        <select value={resolvedFilter} onChange={(e) => setResolvedFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm focus:outline-none cursor-pointer" style={inputStyle}>
          <option value="">All Status</option>
          <option value="false">Open</option>
          <option value="true">Resolved</option>
        </select>
      </div>

      {loading ? <LoadingSpinner message="Loading compliance logs..." /> : (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="glass-card p-12 flex flex-col items-center text-slate-400">
              <CheckCircle2 size={36} className="mb-3 text-emerald-400" />
              <p>All clear — no compliance issues</p>
            </div>
          ) : logs.map((log, i) => {
            const config = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.info;
            const Icon = config.icon;
            return (
              <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`glass-card p-4 flex items-start gap-4 ${log.resolved ? 'opacity-60' : ''}`}
                style={{ borderColor: config.border }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: config.bg }}>
                  <Icon size={18} style={{ color: config.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-navy-800">{log.title}</p>
                    <SeverityBadge severity={log.severity} />
                    {log.resolved && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Resolved</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-1">{log.description}</p>
                  <p className="text-xs text-slate-400">
                    {log.client_name && <span>{log.client_name} · </span>}
                    {log.advisor_name && <span>{log.advisor_name} · </span>}
                    {formatRelativeTime(log.created_at)}
                  </p>
                </div>
                {!log.resolved && (
                  <Button size="sm" variant="success" onClick={() => resolve(log.id)}>Resolve</Button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
