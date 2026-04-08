import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Sparkles, ChevronDown, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { plansAPI, aiAPI, clientsAPI } from '../services/api';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { LoadingSpinner, AILoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';

const inputStyle = { background: '#EBF8FC', border: '1px solid #C5E4EF', color: '#1C3A5C' };

export default function FinancialPlans() {
  const [plans, setPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [form, setForm] = useState({ client_id: '', retirement_age: 65, retirement_income_goal: 150000, goals: [] });

  useEffect(() => {
    Promise.all([
      plansAPI.list().then((r) => setPlans(r.data.plans || [])),
      clientsAPI.list({ limit: 30 }).then((r) => setClients(r.data.clients || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const generatePlan = async () => {
    if (!form.client_id) return;
    setGenerating(true); setGeneratedPlan(null);
    try { const res = await aiAPI.generatePlan(form); setGeneratedPlan(res.data); setPlans((prev) => [res.data.plan, ...prev]); }
    catch (e) {} finally { setGenerating(false); }
  };

  if (loading) return <LoadingSpinner message="Loading financial plans..." />;

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy-800">Financial Plans</h2>
          <p className="text-sm text-slate-400">{plans.length} plans across all clients</p>
        </div>
        <Button icon={Sparkles} onClick={() => setShowGenerator(!showGenerator)}>Generate AI Plan</Button>
      </div>

      <AnimatePresence>
        {showGenerator && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card p-5">
            <h3 className="font-semibold text-navy-800 mb-4 flex items-center gap-2">
              <Sparkles size={16} style={{ color: '#E86C4A' }} /> AI Plan Generator
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Client</label>
                <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none cursor-pointer" style={inputStyle}>
                  <option value="">Select client...</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Target Retirement Age</label>
                <input type="number" value={form.retirement_age} onChange={(e) => setForm({ ...form, retirement_age: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Annual Income Goal ($)</label>
                <input type="number" value={form.retirement_income_goal} onChange={(e) => setForm({ ...form, retirement_income_goal: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={inputStyle} />
              </div>
            </div>
            <Button icon={Sparkles} onClick={generatePlan} loading={generating} disabled={!form.client_id}>
              Generate Comprehensive Plan
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {generating && <AILoadingSpinner message="AI is generating your financial plan..." />}

      {generatedPlan?.ai_content && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5" style={{ borderLeft: '4px solid #3AACCA' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: '#E86C4A' }} />
            <h3 className="font-semibold text-navy-800">AI-Generated Plan Preview</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">{generatedPlan.ai_content.executive_summary}</p>
          {generatedPlan.ai_content.sections?.map((section, i) => (
            <div key={i} className="mb-4">
              <h4 className="text-sm font-semibold mb-1" style={{ color: '#3AACCA' }}>{section.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{section.content}</p>
            </div>
          ))}
          {generatedPlan.ai_content.action_items?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-navy-700 mb-2">Action Items</h4>
              <ul className="space-y-1">
                {generatedPlan.ai_content.action_items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      <div className="space-y-3">
        {plans.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center text-slate-400">
            <FileText size={36} className="mb-3 opacity-30" />
            <p>No plans yet — generate one with AI</p>
          </div>
        ) : plans.map((plan, i) => (
          <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass-card overflow-hidden">
            <button
              onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
              className="w-full flex items-center gap-4 p-5 text-left transition-colors cursor-pointer"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F4FBFD'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(58,172,202,0.1)' }}>
                <FileText size={16} style={{ color: '#3AACCA' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-800">{plan.title}</p>
                <p className="text-xs text-slate-400">{plan.client_name} · Created by {plan.created_by_name}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={plan.status} />
                {plan.next_review_date && (
                  <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
                    <Clock size={11} /> {formatDate(plan.next_review_date)}
                  </span>
                )}
                {expandedPlan === plan.id ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
              </div>
            </button>
            <AnimatePresence>
              {expandedPlan === plan.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden" style={{ borderTop: '1px solid #D8EEF5' }}>
                  <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {[
                      { label: 'Retirement Age', value: plan.retirement_age },
                      { label: 'Income Goal', value: formatCurrency(plan.retirement_income_goal) + '/yr' },
                      { label: 'Projected Value', value: formatCurrency(plan.projected_retirement_value) },
                      { label: 'Next Review', value: formatDate(plan.next_review_date) },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg p-3" style={{ background: '#F4FBFD', border: '1px solid #D8EEF5' }}>
                        <p className="text-xs text-slate-400 mb-0.5">{s.label}</p>
                        <p className="text-sm font-semibold text-navy-700">{s.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                  {plan.content && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-slate-500 leading-relaxed">{plan.content}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
