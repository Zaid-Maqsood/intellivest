import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Sparkles, Download, FileText } from 'lucide-react';
import { clientsAPI, aiAPI } from '../services/api';
import Button from '../components/ui/Button';
import { AILoadingSpinner } from '../components/ui/LoadingSpinner';

const PERIODS = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Annual 2024'];
const inputStyle = { background: '#EBF8FC', border: '1px solid #C5E4EF', color: '#1C3A5C' };

export default function Reports() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [period, setPeriod] = useState('Q4 2024');
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState('');
  const [clientName, setClientName] = useState('');

  useEffect(() => { clientsAPI.list({ limit: 30 }).then((r) => setClients(r.data.clients || [])); }, []);

  const generate = async () => {
    if (!selectedClient) return;
    setGenerating(true); setReport('');
    const client = clients.find((c) => c.id === selectedClient);
    setClientName(client?.name || '');
    try {
      const res = await aiAPI.generateReport({ client_id: selectedClient, period });
      setReport(res.data.report);
    } catch (e) {} finally { setGenerating(false); }
  };

  const download = () => {
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientName}-${period}-Report.txt`.replace(/\s/g, '-');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={16} style={{ color: '#E86C4A' }} />
          <h2 className="font-semibold text-navy-800">AI Report Generator</h2>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-slate-500 mb-1.5">Client</label>
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none cursor-pointer" style={inputStyle}>
              <option value="">Select client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Period</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm focus:outline-none cursor-pointer" style={inputStyle}>
              {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <Button icon={Sparkles} onClick={generate} loading={generating} disabled={!selectedClient}>
            Generate Report
          </Button>
        </div>
      </div>

      {generating && <AILoadingSpinner message="AI is drafting your client report..." />}

      <AnimatePresence>
        {report && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid #D8EEF5' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(58,172,202,0.1)' }}>
                  <FileText size={16} style={{ color: '#3AACCA' }} />
                </div>
                <div>
                  <p className="font-semibold text-navy-800">{clientName} — {period} Report</p>
                  <p className="text-xs text-slate-400">AI-generated · Ready to send</p>
                </div>
              </div>
              <Button icon={Download} variant="secondary" size="sm" onClick={download}>Download</Button>
            </div>
            <div className="p-6">
              <pre className="text-sm text-navy-700 leading-relaxed whitespace-pre-wrap font-mono rounded-xl p-5"
                style={{ background: '#F4FBFD', border: '1px solid #D8EEF5' }}>
                {report}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!report && !generating && (
        <div className="glass-card p-16 flex flex-col items-center text-slate-400">
          <TrendingUp size={40} className="mb-3 opacity-30" />
          <p className="font-medium">Generate a Client Report</p>
          <p className="text-sm mt-1">Select a client and period, then click Generate</p>
        </div>
      )}
    </div>
  );
}
