import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Receipt, Sparkles, TrendingDown, ArrowRightLeft, PiggyBank, Building2, AlertCircle } from 'lucide-react';
import { clientsAPI, taxAPI } from '../services/api';
import Button from '../components/ui/Button';
import { LoadingSpinner, AILoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';

const TYPE_CONFIG = {
  loss_harvesting: { icon: TrendingDown,     color: 'rose',    label: 'Loss Harvesting' },
  asset_location:  { icon: ArrowRightLeft,   color: 'blue',    label: 'Asset Location' },
  roth_conversion: { icon: PiggyBank,        color: 'emerald', label: 'Roth Conversion' },
  municipal_bonds: { icon: Building2,        color: 'amber',   label: 'Municipal Bonds' },
};

const URGENCY_BADGE = {
  high:   { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' },
  medium: { bg: '#fffbeb', text: '#d97706', border: '#fcd34d' },
  low:    { bg: '#f0fdf4', text: '#16a34a', border: '#86efac' },
};

const ICON_COLORS = {
  rose:    { bg: '#fef2f2', text: '#dc2626' },
  blue:    { bg: '#eff6ff', text: '#2563eb' },
  emerald: { bg: '#f0fdf4', text: '#16a34a' },
  amber:   { bg: '#fffbeb', text: '#d97706' },
};

const inputStyle = { background: '#EBF8FC', border: '1px solid #C5E4EF', color: '#1C3A5C' };

export default function TaxOptimization() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [opportunities, setOpportunities] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);

  useEffect(() => {
    clientsAPI.list({ limit: 20 }).then((res) => setClients(res.data.clients || [])).finally(() => setClientsLoading(false));
  }, []);

  const analyze = async () => {
    if (!selectedClient) return;
    setLoading(true);
    setOpportunities([]);
    try {
      const res = await taxAPI.opportunities(selectedClient);
      setOpportunities(res.data.opportunities || []);
      setTotalSavings(res.data.total_estimated_savings || 0);
    } catch (e) {} finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="glass-card p-5">
        <h2 className="font-semibold text-navy-800 mb-4">Tax Optimization Engine</h2>
        <div className="flex flex-wrap gap-3">
          <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}
            className="flex-1 min-w-48 px-3 py-2 rounded-lg text-sm focus:outline-none cursor-pointer" style={inputStyle}>
            <option value="">Select a client to analyze...</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Button icon={Sparkles} onClick={analyze} loading={loading} disabled={!selectedClient}>
            Analyze Tax Opportunities
          </Button>
        </div>
      </div>

      {loading && <AILoadingSpinner message="Analyzing tax position..." />}

      {opportunities.length > 0 && (
        <>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5" style={{ borderLeft: '4px solid #10b981', background: '#f0fdf4' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Receipt size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-700">{formatCurrency(totalSavings)} in potential tax savings identified</p>
                <p className="text-sm text-slate-500">{opportunities.length} opportunities across tax strategies</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp, i) => {
              const config = TYPE_CONFIG[opp.type] || { icon: AlertCircle, color: 'blue', label: opp.type };
              const Icon = config.icon;
              const urgency = URGENCY_BADGE[opp.urgency] || URGENCY_BADGE.medium;
              const iconCol = ICON_COLORS[config.color] || ICON_COLORS.blue;
              const savings = opp.estimated_tax_savings || opp.annual_tax_drag || 0;

              return (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass-card p-5 hover:shadow-card-hover transition-all duration-150">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: iconCol.bg }}>
                        <Icon size={18} style={{ color: iconCol.text }} />
                      </div>
                      <div>
                        <p className="font-semibold text-navy-800">{opp.title}</p>
                        <p className="text-xs text-slate-400">{config.label}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ background: urgency.bg, color: urgency.text, border: `1px solid ${urgency.border}` }}>
                      {opp.urgency}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mb-4">{opp.recommendation}</p>

                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #D8EEF5' }}>
                    <div>
                      <p className="text-xs text-slate-400">Estimated Savings</p>
                      <p className="text-base font-bold text-emerald-600">{formatCurrency(savings)}</p>
                    </div>
                    {opp.deadline && (
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Deadline</p>
                        <p className="text-sm font-medium text-amber-600">{opp.deadline}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {!loading && opportunities.length === 0 && selectedClient && (
        <div className="glass-card p-12 flex flex-col items-center text-slate-400">
          <Receipt size={40} className="mb-3 opacity-30" />
          <p className="font-medium">No results yet</p>
          <p className="text-sm mt-1">Click Analyze to run the AI tax engine</p>
        </div>
      )}

      {!loading && !selectedClient && (
        <div className="glass-card p-12 flex flex-col items-center text-slate-400">
          <Receipt size={40} className="mb-3 opacity-30" />
          <p className="font-medium">No results yet</p>
          <p className="text-sm mt-1">Select a client and click Analyze</p>
        </div>
      )}
    </div>
  );
}
