import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, ChevronRight, Users, AlertCircle, X } from 'lucide-react';
import { clientsAPI } from '../services/api';
import { RiskBadge, StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';

const RISK_OPTIONS = ['', 'conservative', 'moderate', 'aggressive'];
const STATUS_OPTIONS = ['', 'active', 'inactive', 'prospect'];

const inputStyle = { background: '#EBF8FC', border: '1px solid #C5E4EF', color: '#1C3A5C' };

const EMPTY_FORM = {
  name: '', email: '', phone: '',
  risk_tolerance: 'moderate', status: 'active',
  aum: '', net_worth: '', annual_income: '', tax_bracket: '',
  investment_goals: '',
};

function AddClientModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await clientsAPI.create({
        ...form,
        aum: parseFloat(form.aum) || 0,
        net_worth: parseFloat(form.net_worth) || 0,
        annual_income: parseFloat(form.annual_income) || 0,
        tax_bracket: parseFloat(form.tax_bracket) || 0,
      });
      onCreated(res.data.client || res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create client.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(28,58,92,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-card-hover w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ border: '1px solid #D8EEF5' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #D8EEF5' }}>
          <h2 className="font-bold text-navy-800 text-lg">Add New Client</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-navy-700 cursor-pointer transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.background = '#EBF8FC'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Full Name *</label>
              <input value={form.name} onChange={set('name')} placeholder="e.g. Jane & John Smith"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="email@example.com"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone</label>
              <input value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
              <select value={form.status} onChange={set('status')}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none cursor-pointer" style={inputStyle}>
                <option value="active">Active</option>
                <option value="prospect">Prospect</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Risk Tolerance</label>
              <select value={form.risk_tolerance} onChange={set('risk_tolerance')}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none cursor-pointer" style={inputStyle}>
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">AUM ($)</label>
              <input type="number" value={form.aum} onChange={set('aum')} placeholder="0"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Net Worth ($)</label>
              <input type="number" value={form.net_worth} onChange={set('net_worth')} placeholder="0"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Annual Income ($)</label>
              <input type="number" value={form.annual_income} onChange={set('annual_income')} placeholder="0"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Tax Bracket (%)</label>
              <input type="number" value={form.tax_bracket} onChange={set('tax_bracket')} placeholder="0"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={inputStyle} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Investment Goals</label>
              <textarea value={form.investment_goals} onChange={set('investment_goals')}
                placeholder="e.g. Retirement at 65, college funding, estate planning..."
                rows={3} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none" style={inputStyle} />
            </div>
          </div>
          <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid #D8EEF5' }}>
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-navy-700 cursor-pointer transition-colors"
              style={{ background: '#EBF8FC', border: '1px solid #C5E4EF' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#D8EEF5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#EBF8FC'}>
              Cancel
            </button>
            <Button type="submit" icon={Plus} loading={saving} className="flex-1">
              Add Client
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Clients() {
  const [searchParams] = useSearchParams();
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      clientsAPI.list({ search, risk_tolerance: riskFilter, status: statusFilter })
        .then((res) => { setClients(res.data.clients || []); setTotal(res.data.total || 0); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, riskFilter, statusFilter]);

  const handleClientCreated = (newClient) => {
    setClients((prev) => [newClient, ...prev]);
    setTotal((t) => t + 1);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <AnimatePresence>
        {showAddModal && (
          <AddClientModal onClose={() => setShowAddModal(false)} onCreated={handleClientCreated} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-800">Client Portfolio</h2>
          <p className="text-sm text-slate-400">{total} clients under management</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>Add Client</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm placeholder-slate-400 focus:outline-none transition-all"
            style={inputStyle}
          />
        </div>
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm text-navy-700 focus:outline-none cursor-pointer" style={inputStyle}>
          <option value="">All Risk</option>
          {RISK_OPTIONS.filter(Boolean).map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm text-navy-700 focus:outline-none cursor-pointer" style={inputStyle}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {/* Client Grid */}
      {loading ? (
        <LoadingSpinner message="Loading clients..." />
      ) : clients.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-slate-400">
          <Users size={40} className="mb-3 opacity-30" />
          <p className="text-lg font-medium">No clients found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client, i) => (
            <motion.div key={client.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={`/clients/${client.id}`}
                className="block glass-card p-5 hover:shadow-card-hover transition-all duration-150 group"
                style={{ borderColor: '#D8EEF5' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9BCAD8'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D8EEF5'}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: 'linear-gradient(135deg,#3AACCA,#1a8fab)' }}>
                      {client.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-navy-800 truncate group-hover:text-brand-600 transition-colors">{client.name}</p>
                      <p className="text-xs text-slate-400 truncate">{client.email}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-500 transition-colors shrink-0 mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="rounded-lg p-2.5" style={{ background: '#F4FBFD', border: '1px solid #D8EEF5' }}>
                    <p className="text-xs text-slate-400 mb-0.5">AUM</p>
                    <p className="text-sm font-bold text-navy-800">{formatCurrency(client.aum)}</p>
                  </div>
                  <div className="rounded-lg p-2.5" style={{ background: '#F4FBFD', border: '1px solid #D8EEF5' }}>
                    <p className="text-xs text-slate-400 mb-0.5">Net Worth</p>
                    <p className="text-sm font-bold text-navy-800">{formatCurrency(client.net_worth)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusBadge status={client.status} />
                    <RiskBadge risk={client.risk_tolerance} />
                  </div>
                  {client.pending_actions > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertCircle size={12} />
                      {client.pending_actions} action{client.pending_actions > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3" style={{ borderTop: '1px solid #D8EEF5' }}>
                  <p className="text-xs text-slate-400">
                    Advisor: <span className="text-navy-600">{client.advisor_name || 'Unassigned'}</span>
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
