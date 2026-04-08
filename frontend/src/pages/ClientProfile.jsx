import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft, Sparkles, Briefcase, FileText, Receipt,
  FileBarChart, TrendingUp
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { clientsAPI, aiAPI } from '../services/api';
import { RiskBadge, StatusBadge, PriorityBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { LoadingSpinner, AILoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';

const TABS = [
  { id: 'overview',   label: 'Overview',   icon: TrendingUp },
  { id: 'portfolio',  label: 'Portfolio',  icon: Briefcase },
  { id: 'plans',      label: 'Plans',      icon: FileText },
  { id: 'tax',        label: 'Tax',        icon: Receipt },
  { id: 'documents',  label: 'Documents',  icon: FileBarChart },
];

const PIE_COLORS = ['#3AACCA', '#10b981', '#f59e0b', '#E86C4A', '#6366f1'];
const tooltipStyle = { background: '#fff', border: '1px solid #C5E4EF', borderRadius: 8, fontSize: 12, color: '#1C3A5C' };

export default function ClientProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [aiActions, setAiActions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    clientsAPI.get(id).then((res) => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const fetchAIRecommendations = async () => {
    setAiLoading(true);
    try { const res = await aiAPI.recommendations(id); setAiActions(res.data.recommendations || []); }
    catch (e) {} finally { setAiLoading(false); }
  };

  if (loading) return <LoadingSpinner message="Loading client profile..." />;
  if (!data?.client) return <div className="text-slate-400 py-16 text-center">Client not found.</div>;

  const { client, portfolios = [], actions = [], documents = [], plans = [] } = data;
  const portfolio = portfolios[0];
  const allocation = portfolio?.allocation || {};
  const allocationData = Object.entries(typeof allocation === 'string' ? JSON.parse(allocation) : allocation)
    .map(([name, value]) => ({ name, value: parseFloat(value) }));

  const performanceHistory = (() => {
    try {
      const raw = typeof portfolio?.performance_history === 'string'
        ? JSON.parse(portfolio.performance_history)
        : (portfolio?.performance_history || []);
      return raw.slice(-13);
    } catch { return []; }
  })();

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <Link to="/clients"
          className="mt-1 p-2 rounded-lg text-slate-400 hover:text-navy-700 transition-all cursor-pointer"
          style={{ background: 'transparent' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#EBF8FC'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-navy-800">{client.name}</h1>
            <StatusBadge status={client.status} />
            <RiskBadge risk={client.risk_tolerance} />
          </div>
          <p className="text-sm text-slate-400">{client.email} · {client.phone}</p>
        </div>
        <Button icon={Sparkles} onClick={fetchAIRecommendations} loading={aiLoading}>
          AI Copilot
        </Button>
      </div>

      {aiLoading && <AILoadingSpinner message="Generating AI recommendations..." />}
      {aiActions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5"
          style={{ borderLeft: '4px solid #E86C4A' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: '#E86C4A' }} />
            <h3 className="font-semibold text-navy-800">AI Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {aiActions.map((action, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: '#F4FBFD', border: '1px solid #D8EEF5' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(58,172,202,0.1)', color: '#3AACCA' }}>{action.type}</span>
                  <PriorityBadge priority={action.priority} />
                </div>
                <p className="text-sm font-medium text-navy-800 mb-1">{action.title}</p>
                <p className="text-xs text-slate-500 mb-2">{action.description}</p>
                <p className="text-xs text-emerald-600 font-medium">{action.estimated_impact}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'AUM', value: formatCurrency(client.aum) },
          { label: 'Net Worth', value: formatCurrency(client.net_worth) },
          { label: 'Annual Income', value: formatCurrency(client.annual_income) },
          { label: 'Tax Bracket', value: `${client.tax_bracket?.toFixed(2)}%` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-4">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className="text-lg font-bold text-navy-800">{s.value || '—'}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: '1px solid #D8EEF5' }}>
        {TABS.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer"
            style={{
              borderColor: tab === tabId ? '#3AACCA' : 'transparent',
              color: tab === tabId ? '#3AACCA' : '#94a3b8',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass-card p-5">
              <h3 className="font-semibold text-navy-800 mb-1">Investment Goals</h3>
              <p className="text-sm text-slate-500 mb-4">{client.investment_goals || 'Not specified'}</p>
              <h3 className="font-semibold text-navy-800 mb-1">Notes</h3>
              <p className="text-sm text-slate-500">{client.notes || 'No notes'}</p>
            </div>
            <div className="glass-card p-5">
              <h3 className="font-semibold text-navy-800 mb-3">Recent Actions</h3>
              {actions.length === 0
                ? <p className="text-sm text-slate-400">No pending actions</p>
                : actions.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-start gap-2 py-2 last:border-0" style={{ borderBottom: '1px solid #D8EEF5' }}>
                    <PriorityBadge priority={a.priority} />
                    <div className="min-w-0">
                      <p className="text-sm text-navy-700 truncate">{a.title}</p>
                      <p className="text-xs text-slate-400">{a.estimated_impact}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {tab === 'portfolio' && (
          <div className="space-y-5">
            {!portfolio ? <p className="text-slate-400">No portfolio found.</p> : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Portfolio Value', value: formatCurrency(portfolio.total_value) },
                    { label: 'YTD Return', value: formatPercent(portfolio.ytd_return) },
                    { label: 'Unrealized Gain', value: formatCurrency(portfolio.unrealized_gain) },
                    { label: 'Risk Score', value: `${portfolio.risk_score}/10` },
                  ].map((s) => (
                    <div key={s.label} className="glass-card p-4">
                      <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                      <p className="text-lg font-bold text-navy-800">{s.value || '—'}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-navy-800 mb-4">Performance History</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={performanceHistory}>
                        <defs>
                          <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3AACCA" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#3AACCA" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(d) => d?.slice(5, 7) + '/' + d?.slice(2, 4)} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} axisLine={false} tickLine={false} width={52} />
                        <Tooltip formatter={(v) => [formatCurrency(v), 'Value']} contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="value" stroke="#3AACCA" strokeWidth={2} fill="url(#perfGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-navy-800 mb-4">Asset Allocation</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={allocationData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                          {allocationData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                        </Pie>
                        <Legend iconType="circle" iconSize={8} formatter={(val) => <span style={{ color: '#5B7A91', fontSize: 12 }}>{val}</span>} />
                        <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'plans' && (
          <div className="space-y-3">
            {plans.length === 0 ? <p className="text-slate-400">No financial plans yet.</p> : plans.map((plan) => (
              <div key={plan.id} className="glass-card p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-navy-800">{plan.title}</h3>
                  <StatusBadge status={plan.status} />
                </div>
                <p className="text-sm text-slate-500 mb-3">{plan.content?.slice(0, 200)}...</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-400">Retirement Age: <span className="text-navy-700">{plan.retirement_age}</span></span>
                  <span className="text-slate-400">Goal: <span className="text-navy-700">{formatCurrency(plan.retirement_income_goal)}/yr</span></span>
                  <span className="text-slate-400">Next Review: <span className="text-navy-700">{formatDate(plan.next_review_date)}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'documents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.length === 0 ? <p className="text-slate-400">No documents uploaded.</p> : documents.map((doc) => (
              <div key={doc.id} className="glass-card p-4 cursor-pointer transition-all"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9BCAD8'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D8EEF5'}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: '#fef2f2' }}>
                    <FileBarChart size={16} style={{ color: '#dc2626' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy-800 truncate">{doc.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{doc.category} · {formatDate(doc.created_at)}</p>
                  </div>
                </div>
                {doc.summary && <p className="text-xs text-slate-400 mt-3 line-clamp-2">{doc.summary}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === 'tax' && (
          <div className="glass-card p-8 flex flex-col items-center text-slate-400">
            <Receipt size={36} className="mb-3 opacity-30" />
            <p className="font-medium text-navy-700">View Tax Analysis</p>
            <p className="text-sm mt-1 mb-4">AI-powered tax optimization for this client</p>
            <Link to="/tax"><Button>Open Tax Optimizer</Button></Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
