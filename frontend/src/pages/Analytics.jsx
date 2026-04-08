import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, ComposedChart, Area, Line
} from 'recharts';
import { BarChart3, Sparkles, TrendingUp, Users, DollarSign } from 'lucide-react';
import { analyticsAPI, clientsAPI } from '../services/api';
import Button from '../components/ui/Button';
import { LoadingSpinner, AILoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatCurrency, formatPercent } from '../utils/formatters';

const PIE_COLORS = ['#3AACCA', '#10b981', '#f59e0b', '#E86C4A', '#6366f1'];
const tooltipStyle = { background: '#fff', border: '1px solid #C5E4EF', borderRadius: 8, fontSize: 12, color: '#1C3A5C' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-lg p-3 shadow-card text-xs" style={{ borderColor: '#C5E4EF' }}>
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  );
};

const inputStyle = { background: '#EBF8FC', border: '1px solid #C5E4EF', color: '#1C3A5C' };

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [riskModel, setRiskModel] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simLoading, setSimLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    Promise.all([
      analyticsAPI.summary().then((r) => setSummary(r.data)),
      analyticsAPI.riskModel().then((r) => setRiskModel(r.data)),
      clientsAPI.list({ limit: 30 }).then((r) => setClients(r.data.clients || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const runSimulation = async () => {
    if (!selectedClient) return;
    setSimLoading(true);
    try {
      const res = await analyticsAPI.simulate(selectedClient);
      setSimulation(res.data.simulation);
    } catch (e) {} finally { setSimLoading(false); }
  };

  if (loading) return <LoadingSpinner message="Loading analytics..." />;

  const sum = summary?.summary;
  const byRisk = summary?.by_risk || [];
  const byAdvisor = summary?.by_advisor || [];
  const allocation = riskModel?.aggregate_allocation || [];

  const metricColorMap = {
    rose:    { bg: '#fef2f2', text: '#dc2626' },
    emerald: { bg: '#f0fdf4', text: '#16a34a' },
    brand:   { bg: 'rgba(58,172,202,0.1)', text: '#3AACCA' },
    amber:   { bg: '#fffbeb', text: '#d97706' },
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total AUM', value: formatCurrency(sum?.total_aum || 0), icon: DollarSign, color: 'brand' },
          { label: 'Total Clients', value: sum?.total_clients || '—', icon: Users, color: 'emerald' },
          { label: 'Active Portfolios', value: sum?.total_portfolios || '—', icon: BarChart3, color: 'amber' },
          { label: 'Avg YTD Return', value: formatPercent(sum?.avg_ytd_return || 0), icon: TrendingUp, color: 'brand' },
        ].map((s, i) => {
          const Icon = s.icon;
          const col = metricColorMap[s.color];
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400">{s.label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: col.bg }}>
                  <Icon size={14} style={{ color: col.text }} />
                </div>
              </div>
              <p className="text-xl font-bold text-navy-800">{s.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h3 className="font-semibold text-navy-800 mb-4">Risk Model Metrics</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: '95% VaR', value: formatPercent((riskModel?.var_95 || 0) * 100), col: metricColorMap.rose },
              { label: 'Sharpe Ratio', value: riskModel?.sharpe_ratio?.toFixed(2) || '—', col: metricColorMap.emerald },
              { label: 'Portfolio Beta', value: riskModel?.beta?.toFixed(2) || '—', col: metricColorMap.brand },
              { label: 'Alpha', value: formatPercent((riskModel?.alpha || 0) * 100), col: metricColorMap.amber },
            ].map((m) => (
              <div key={m.label} className="rounded-xl p-3" style={{ background: '#F4FBFD', border: '1px solid #D8EEF5' }}>
                <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                <p className="text-lg font-bold" style={{ color: m.col.text }}>{m.value}</p>
              </div>
            ))}
          </div>
          <h4 className="text-sm font-medium text-navy-700 mb-3">Clients by Risk Profile</h4>
          <div className="space-y-2">
            {byRisk.map((r) => {
              const pct = sum?.total_clients > 0 ? Math.round((r.count / sum.total_clients) * 100) : 0;
              const trackColor = r.risk_tolerance === 'conservative' ? '#10b981' : r.risk_tolerance === 'moderate' ? '#f59e0b' : '#E86C4A';
              return (
                <div key={r.risk_tolerance}>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span className="capitalize">{r.risk_tolerance}</span>
                    <span>{r.count} clients ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#D8EEF5' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.6 }}
                      className="h-full rounded-full" style={{ background: trackColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="font-semibold text-navy-800 mb-4">Aggregate Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={allocation} cx="50%" cy="50%" innerRadius={55} outerRadius={82} dataKey="value" paddingAngle={3}>
                {allocation.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#5B7A91', fontSize: 12 }}>{v}</span>} />
              <Tooltip formatter={(v) => [`${v}%`]} contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <h4 className="text-sm font-medium text-navy-700 mt-4 mb-3">AUM by Advisor</h4>
          <div className="space-y-2">
            {byAdvisor.slice(0, 4).map((adv) => (
              <div key={adv.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{adv.name}</span>
                <span className="font-semibold text-navy-700">{formatCurrency(adv.total_aum)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: '#E86C4A' }} />
            <div>
              <h3 className="font-semibold text-navy-800">Monte Carlo Portfolio Simulation</h3>
              <p className="text-xs text-slate-400">1,000 scenarios · 30-year projection</p>
            </div>
          </div>
          <div className="flex gap-3">
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm focus:outline-none cursor-pointer" style={inputStyle}>
              <option value="">Select client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Button icon={Sparkles} onClick={runSimulation} loading={simLoading} disabled={!selectedClient}>Run Simulation</Button>
          </div>
        </div>

        {simLoading && <AILoadingSpinner message="Running 1,000 Monte Carlo scenarios..." />}

        {simulation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'Success Rate', value: `${simulation.success_rate}%`, col: simulation.success_rate >= 80 ? metricColorMap.emerald : simulation.success_rate >= 60 ? metricColorMap.amber : metricColorMap.rose },
                { label: 'Median Outcome', value: formatCurrency(simulation.median_final_value), col: metricColorMap.brand },
                { label: 'P10 (Pessimistic)', value: formatCurrency(simulation.p10_final_value), col: metricColorMap.rose },
                { label: 'P90 (Optimistic)', value: formatCurrency(simulation.p90_final_value), col: metricColorMap.emerald },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-3" style={{ background: '#F4FBFD', border: '1px solid #D8EEF5' }}>
                  <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                  <p className="text-lg font-bold" style={{ color: m.col.text }}>{m.value}</p>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={simulation.chart_data}>
                <defs>
                  <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3AACCA" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3AACCA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8EEF5" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => formatCurrency(v)} axisLine={false} tickLine={false} width={72} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="optimistic" name="Optimistic (P90)" fill="url(#simGrad)" stroke="#10b981" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
                <Line type="monotone" dataKey="expected" name="Expected (P50)" stroke="#3AACCA" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="pessimistic" name="Pessimistic (P10)" stroke="#E86C4A" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
                <Legend iconType="line" iconSize={12} formatter={(v) => <span style={{ color: '#5B7A91', fontSize: 11 }}>{v}</span>} />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {!simulation && !simLoading && (
          <div className="flex flex-col items-center py-12 text-slate-400">
            <BarChart3 size={40} className="mb-3 opacity-30" />
            <p>Select a client and run a Monte Carlo simulation</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
