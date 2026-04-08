import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, Trash2, Sparkles, Send, X, Plus } from 'lucide-react';
import { documentsAPI, clientsAPI } from '../services/api';
import Button from '../components/ui/Button';
import { LoadingSpinner, AILoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatRelativeTime } from '../utils/formatters';

const CATEGORIES = ['general', 'trust', 'estate', 'tax', 'investment', 'compliance', 'report'];
const CAT_STYLE = {
  trust:      { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
  estate:     { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  tax:        { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  investment: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  compliance: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' },
  report:     { bg: 'rgba(58,172,202,0.08)', text: '#3AACCA', border: '#C5E4EF' },
  general:    { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
};

const inputStyle = { background: '#EBF8FC', border: '1px solid #C5E4EF', color: '#1C3A5C' };

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientFilter, setClientFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadClient, setUploadClient] = useState('');
  const [uploadCategory, setUploadCategory] = useState('general');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [querying, setQuerying] = useState(false);
  const fileInputRef = useRef();

  const loadDocs = () => {
    setLoading(true);
    documentsAPI.list({ client_id: clientFilter, category: categoryFilter })
      .then((res) => setDocuments(res.data.documents || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDocs(); }, [clientFilter, categoryFilter]);
  useEffect(() => { clientsAPI.list({ limit: 30 }).then((res) => setClients(res.data.clients || [])); }, []);

  const handleFileUpload = async (file) => {
    if (!uploadClient) { alert('Please select a client first'); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('client_id', uploadClient);
    fd.append('category', uploadCategory);
    try { await documentsAPI.upload(fd); setShowUpload(false); loadDocs(); }
    catch (e) { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleQuery = async () => {
    if (!selectedDoc || !question.trim()) return;
    setQuerying(true); setAiAnswer('');
    try { const res = await documentsAPI.query({ document_id: selectedDoc.id, question }); setAiAnswer(res.data.answer); }
    catch (e) { setAiAnswer('Error processing query.'); }
    finally { setQuerying(false); }
  };

  const deleteDoc = async (id) => {
    if (!confirm('Delete this document?')) return;
    await documentsAPI.delete(id); loadDocs();
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex flex-wrap items-center gap-3">
        <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm focus:outline-none cursor-pointer" style={inputStyle}>
          <option value="">All Clients</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm focus:outline-none cursor-pointer capitalize" style={inputStyle}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
        <Button icon={Plus} onClick={() => setShowUpload(true)} className="ml-auto">Upload Document</Button>
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-800">Upload Document</h3>
              <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-navy-600 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              <select value={uploadClient} onChange={(e) => setUploadClient(e.target.value)}
                className="flex-1 min-w-40 px-3 py-2 rounded-lg text-sm focus:outline-none cursor-pointer" style={inputStyle}>
                <option value="">Select client...</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm focus:outline-none cursor-pointer" style={inputStyle}>
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all"
              style={{
                borderColor: dragOver ? '#3AACCA' : '#C5E4EF',
                background: dragOver ? 'rgba(58,172,202,0.06)' : '#F4FBFD',
              }}
            >
              <Upload size={28} style={{ color: dragOver ? '#3AACCA' : '#94a3b8' }} />
              <p className="text-sm text-slate-500">{uploading ? 'Uploading...' : 'Drop file here or click to browse'}</p>
              <p className="text-xs text-slate-400">PDF, DOC, XLSX, TXT — max 50MB</p>
            </div>
            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.xlsx,.csv"
              onChange={(e) => { if (e.target.files[0]) handleFileUpload(e.target.files[0]); }} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          {loading ? <LoadingSpinner message="Loading documents..." /> : documents.length === 0 ? (
            <div className="glass-card p-12 flex flex-col items-center text-slate-400">
              <FileText size={36} className="mb-3 opacity-30" />
              <p>No documents found</p>
            </div>
          ) : documents.map((doc, i) => {
            const cat = CAT_STYLE[doc.category] || CAT_STYLE.general;
            const isSelected = selectedDoc?.id === doc.id;
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => { setSelectedDoc(doc); setAiAnswer(''); setQuestion(''); }}
                className="glass-card p-4 flex items-start gap-4 cursor-pointer transition-all"
                style={{ borderColor: isSelected ? '#3AACCA' : '#D8EEF5', background: isSelected ? 'rgba(58,172,202,0.04)' : '#fff' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                  <FileText size={16} style={{ color: cat.text }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-800 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-400">{doc.client_name} · <span className="capitalize">{doc.category}</span> · {formatRelativeTime(doc.created_at)}</p>
                  {doc.summary && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{doc.summary}</p>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }}
                  className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer shrink-0">
                  <Trash2 size={15} />
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="glass-card p-5 h-fit sticky top-20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} style={{ color: '#E86C4A' }} />
            <h3 className="font-semibold text-navy-800">Document Intelligence</h3>
          </div>
          {!selectedDoc ? (
            <p className="text-sm text-slate-400 text-center py-8">Select a document to query with AI</p>
          ) : (
            <>
              <div className="p-2.5 rounded-lg mb-4" style={{ background: '#F4FBFD', border: '1px solid #D8EEF5' }}>
                <p className="text-xs text-slate-500 truncate">
                  <FileText size={11} className="inline mr-1" />{selectedDoc.name}
                </p>
              </div>
              <div className="relative mb-4">
                <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about this document..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-navy-800 placeholder-slate-400 focus:outline-none resize-none transition-all"
                  style={inputStyle}
                />
              </div>
              <Button icon={Send} onClick={handleQuery} loading={querying} disabled={!question.trim()} className="w-full">
                Ask AI
              </Button>
              {querying && <AILoadingSpinner message="Reading document..." />}
              {aiAnswer && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-lg" style={{ background: '#F4FBFD', border: '1px solid #D8EEF5' }}>
                  <p className="text-xs mb-2 flex items-center gap-1" style={{ color: '#E86C4A' }}>
                    <Sparkles size={11} /> AI Response
                  </p>
                  <p className="text-sm text-navy-700 leading-relaxed">{aiAnswer}</p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
