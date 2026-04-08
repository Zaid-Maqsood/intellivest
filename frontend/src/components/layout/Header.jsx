import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Bell, Search, Sparkles, AlertTriangle, XCircle, Info, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { complianceAPI } from '../../services/api';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clients',
  '/portfolios': 'Portfolios',
  '/plans': 'Financial Plans',
  '/tax': 'Tax Optimization',
  '/documents': 'Document Intelligence',
  '/analytics': 'Institutional Analytics',
  '/compliance': 'Compliance Monitoring',
  '/reports': 'Reports',
};

const SEVERITY_ICON = {
  critical: { icon: XCircle, color: '#dc2626' },
  error: { icon: XCircle, color: '#dc2626' },
  warning: { icon: AlertTriangle, color: '#d97706' },
  info: { icon: Info, color: '#2563eb' },
};

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const title = PAGE_TITLES[pathname] || Object.entries(PAGE_TITLES)
    .find(([k]) => pathname.startsWith(k))?.[1] || 'IntelliVest';

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (notifOpen) {
      complianceAPI.logs({ limit: 8, resolved: 'false' })
        .then((res) => setNotifications(res.data.logs || []))
        .catch(() => {});
    }
  }, [notifOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchKey = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/clients?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchFocused(false);
      e.target.blur();
    }
  };

  const unreadCount = notifications.filter((n) => !n.resolved).length;

  return (
    <header className="h-16 bg-white flex items-center px-6 gap-4 shrink-0 sticky top-0 z-20"
      style={{ borderBottom: '1px solid #D8EEF5' }}>
      {/* Title */}
      <div className="flex-1 min-w-0">
        <motion.h1
          key={pathname}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold text-navy-800 truncate"
        >
          {title}
        </motion.h1>
        <p className="text-xs text-slate-400 hidden sm:block">
          {greeting}, {user?.name?.split(' ')[0]}
        </p>
      </div>

      {/* Search */}
      <div className={`relative hidden md:flex items-center transition-all duration-200 ${searchFocused ? 'w-72' : 'w-52'}`}>
        <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search clients, portfolios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          onKeyDown={handleSearchKey}
          className="w-full pl-9 pr-8 py-2 rounded-lg text-sm text-navy-800 placeholder-slate-400 focus:outline-none transition-all"
          style={{ background: '#EBF8FC', border: `1px solid ${searchFocused ? '#3AACCA' : '#C5E4EF'}` }}
        />
        {searchQuery && (
          <button
            onMouseDown={(e) => { e.preventDefault(); setSearchQuery(''); }}
            className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-navy-700 cursor-pointer transition-colors"
          >
            <X size={13} />
          </button>
        )}
        {searchFocused && searchQuery && (
          <p className="absolute top-full mt-1 left-0 text-xs text-slate-400 bg-white px-3 py-1.5 rounded-lg shadow-card border border-slate-100 whitespace-nowrap">
            Press Enter to search clients
          </p>
        )}
      </div>

      {/* AI Badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
        style={{ background: 'rgba(232,108,74,0.08)', border: '1px solid rgba(232,108,74,0.2)' }}>
        <Sparkles size={12} style={{ color: '#E86C4A' }} />
        <span className="text-xs font-medium" style={{ color: '#E86C4A' }}>AI Active</span>
      </div>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative p-2 rounded-lg transition-all cursor-pointer"
          style={{ color: notifOpen ? '#3AACCA' : '#94a3b8', background: notifOpen ? '#EBF8FC' : 'transparent' }}
          onMouseEnter={(e) => { if (!notifOpen) e.currentTarget.style.background = '#EBF8FC'; }}
          onMouseLeave={(e) => { if (!notifOpen) e.currentTarget.style.background = 'transparent'; }}
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ background: '#E86C4A' }} />
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-card-hover overflow-hidden"
              style={{ border: '1px solid #D8EEF5', zIndex: 50 }}
            >
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #D8EEF5' }}>
                <h3 className="font-semibold text-navy-800 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(232,108,74,0.1)', color: '#E86C4A' }}>
                    {unreadCount} open
                  </span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-slate-400">
                    <CheckCircle2 size={24} className="mb-2 text-emerald-400" />
                    <p className="text-sm">All clear — no open issues</p>
                  </div>
                ) : notifications.map((n) => {
                  const cfg = SEVERITY_ICON[n.severity] || SEVERITY_ICON.info;
                  const Icon = cfg.icon;
                  return (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer"
                      style={{ borderBottom: '1px solid #F4FBFD' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F4FBFD'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => { navigate('/compliance'); setNotifOpen(false); }}>
                      <Icon size={15} style={{ color: cfg.color }} className="mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-navy-700 font-medium truncate">{n.title}</p>
                        <p className="text-xs text-slate-400 truncate">{n.client_name || n.description?.slice(0, 50)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/compliance" onClick={() => setNotifOpen(false)}
                className="flex items-center justify-center py-2.5 text-xs font-medium transition-colors"
                style={{ borderTop: '1px solid #D8EEF5', color: '#3AACCA' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#EBF8FC'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                View all in Compliance →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
