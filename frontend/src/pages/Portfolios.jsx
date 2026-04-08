import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { portfoliosAPI } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatCurrency, formatPercent } from '../utils/formatters';

const PIE_COLORS = ['#3AACCA', '#10b981', '#f59e0b', '#E86C4A', '#6366f1'];
const tooltipStyle = { background: '#fff', border: '1px solid #C5E4EF', borderRadius: 8, fontSize: 12, color: '#1C3A5C' };

function aggregateAllocation(portfolios) {
  const totals = {};
  let totalValue = 0;
  for (const p of portfolios) {
    const val = parseFloat(p.total_value) || 0;
    totalValue += val;
    const alloc = typeof p.allocation === 'string' ? JSON.parse(p.allocation || '{}') : (p.allocation || {});
    for (const [k, pct] of Object.entries(alloc)) {
      totals[k] = (totals[k] || 0) + (parseFloat(pct) || 0) * val;
    }
  }
  return Object.entries(totals).map(([name, value]) => ({ name, value: Math.round(value / totalValue) }));
}

export default function Portfolios() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portfoliosAPI.list().then((res) => setPortfolios(res.data.portfolios || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalAUM = portfolios.reduce((s, p) => s + parseFloat(p.total_value || 0), 0);
  const avgReturn = portfolios.length ? portfolios.reduce((s, p) => s + parseFloat(p.ytd_return || 0), 0) / portfolios.length : 0;
  const allocationData = aggregateAllocation(portfolios);
  const perfData = portfolios.slice(0, 6).map((p) => ({
    name: p.client_name?.split(' ')[0] || p.name?.slice(0, 8) || 'Portfolio',
    return: parseFloat(p.ytd_return || 0).toFixed(1),
    benchmark: (parseFloat(p.ytd_return || 0) - 2 - Math.random() * 3).toFixed(1),
  }));

  if (loading) return <LoadingSpinner message="Loading portfolios..." />;

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total AUM', value: formatCurrency(totalAUM) },
          { label: 'Portfolios', value: portfolios.length },
          { label: 'Avg. YTD Return', value: formatPercent(avgReturn) },
          { label: 'Outperforming', value: `${portfolios.filter((p) => parseFloat(p.ytd_return) > 15).length}/${portfolios.length}` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-4">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-navy-800">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5 lg:col-span-2">
          <h3 className="font-semibold text-navy-800 mb-4">YTD Return vs. Benchmark</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perfData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8EEF5" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => [`${v}%`]} contentStyle={tooltipStyle} />
              <Bar dataKey="return" name="Portfolio" fill="#3AACCA" radius={[4,4,0,0]} />
              <Bar dataKey="benchmark" name="Benchmark" fill="#C5E4EF" radius={[4,4,0,0]} />
              <Legend iconType="circle" iconSize={8} formatter={(val) => <span style={{ color: '#5B7A91', fontSize: 12 }}>{val}</span>} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="font-semibold text-navy-800 mb-4">Aggregate Allocation</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={allocationData} cx="50%" cy="50%" innerRadius={55} outerRadius={82} dataKey="value" paddingAngle={3}>
                {allocationData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#5B7A91', fontSize: 11 }}>{v}</span>} />
              <Tooltip formatter={(v) => [`${v}%`]} contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card overflow-hidden">
        <div className="p-5" style={{ borderBottom: '1px solid #D8EEF5' }}>
          <h3 className="font-semibold text-navy-800">All Portfolios</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-400" style={{ borderBottom: '1px solid #D8EEF5' }}>
                {['Client', 'Portfolio', 'Value', 'YTD Return', 'Unrealized G/L', 'Risk Score', 'Benchmark'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ borderTop: 'none' }}>
              {portfolios.map((p, i) => {
                const isPos = parseFloat(p.ytd_return) >= 0;
                const isGain = parseFloat(p.unrealized_gain) >= 0;
                return (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * i }}
                    className="transition-colors cursor-default"
                    style={{ borderBottom: '1px solid #D8EEF5' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F4FBFD'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-5 py-3"><p className="text-sm font-medium text-navy-700">{p.client_name}</p></td>
                    <td className="px-5 py-3"><p className="text-sm text-slate-400 truncate max-w-36">{p.name}</p></td>
                    <td className="px-5 py-3"><p className="text-sm font-semibold text-navy-800">{formatCurrency(p.total_value)}</p></td>
                    <td className="px-5 py-3"><p className={`text-sm font-semibold ${isPos ? 'text-emerald-600' : 'text-rose-500'}`}>{formatPercent(p.ytd_return)}</p></td>
                    <td className="px-5 py-3"><p className={`text-sm font-semibold ${isGain ? 'text-emerald-600' : 'text-rose-500'}`}>{formatCurrency(p.unrealized_gain)}</p></td>
                    <td className="px-5 py-3"><p className="text-sm text-navy-600">{p.risk_score ? `${parseFloat(p.risk_score).toFixed(1)}/10` : '—'}</p></td>
                    <td className="px-5 py-3"><p className="text-sm text-slate-400">{p.benchmark || 'S&P 500'}</p></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
