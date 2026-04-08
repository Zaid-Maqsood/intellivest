import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Users, Briefcase, FileText, TrendingUp,
  Shield, BarChart3, Receipt, FileBarChart, ChevronLeft,
  ChevronRight, LogOut
} from 'lucide-react';

function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="9" fill="url(#logo-grad)" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3AACCA" />
          <stop offset="100%" stopColor="#1a7a9a" />
        </linearGradient>
      </defs>
      {/* Left vertical bar of "I" */}
      <rect x="9" y="10" width="3" height="16" rx="1.5" fill="white" />
      {/* "V" — left arm */}
      <path d="M15 10 L19.5 26" stroke="white" strokeWidth="3" strokeLinecap="round" />
      {/* "V" — right arm */}
      <path d="M24 10 L19.5 26" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/portfolios', icon: Briefcase, label: 'Portfolios' },
  { to: '/plans', icon: FileText, label: 'Financial Plans' },
  { to: '/tax', icon: Receipt, label: 'Tax Optimization' },
  { to: '/documents', icon: FileBarChart, label: 'Documents' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/compliance', icon: Shield, label: 'Compliance' },
  { to: '/reports', icon: TrendingUp, label: 'Reports' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col shrink-0"
      style={{
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: '#1C3A5C',
        overflow: 'visible',
      }}
    >
      {/* Inner clip wrapper — keeps text from overflowing during collapse animation */}
      <div className="flex flex-col flex-1 overflow-hidden" style={{ background: '#1C3A5C' }}>

      {/* Logo */}
      <div className="flex items-center h-16 px-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0">
            <LogoMark size={34} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <span className="text-white font-bold text-base tracking-tight">IntelliVest</span>
                <span className="block text-xs font-normal leading-none" style={{ color: '#7AB3CC' }}>AI Advisory</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer group relative ${
                isActive
                  ? 'text-white'
                  : 'text-[#7AB3CC] hover:text-white'
              }`
            }
            style={({ isActive }) => isActive ? { background: 'rgba(58,172,202,0.18)' } : {}}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'rgba(58,172,202,0.18)', border: '1px solid rgba(58,172,202,0.3)' }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <Icon size={18} className="shrink-0 relative z-10" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium truncate relative z-10"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-white border border-surface-lighter rounded-md text-xs text-navy-800 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-card">
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User & Collapse */}
      <div className="p-3 space-y-2 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {/* User */}
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
            style={{ background: 'linear-gradient(135deg,#3AACCA,#1a8fab)' }}>
            {user?.name?.charAt(0) || 'A'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs capitalize truncate" style={{ color: '#7AB3CC' }}>{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer"
          style={{ color: '#7AB3CC' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#7AB3CC'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={16} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

      </div>

      </div>{/* end inner clip wrapper */}

      {/* Collapse Toggle — floating on right edge */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 z-10"
        style={{ background: '#1C3A5C', border: '1.5px solid rgba(58,172,202,0.4)', color: '#7AB3CC' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#3AACCA'; e.currentTarget.style.background = '#3AACCA'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#7AB3CC'; e.currentTarget.style.borderColor = 'rgba(58,172,202,0.4)'; e.currentTarget.style.background = '#1C3A5C'; }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
