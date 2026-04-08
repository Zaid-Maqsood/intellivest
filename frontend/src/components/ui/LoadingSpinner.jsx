import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-2"
        style={{ borderColor: '#D8EEF5', borderTopColor: '#3AACCA' }}
      />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

export function AILoadingSpinner({ message = 'AI is thinking...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(232,108,74,0.1)' }}
        >
          <Sparkles size={20} style={{ color: '#E86C4A' }} />
        </motion.div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-xl border-2 border-transparent"
          style={{ borderTopColor: 'rgba(232,108,74,0.4)' }}
        />
      </div>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-4 rounded w-32" style={{ background: '#D8EEF5' }} />
        <div className="h-8 w-8 rounded-lg" style={{ background: '#D8EEF5' }} />
      </div>
      <div className="h-8 rounded w-24 mb-3" style={{ background: '#D8EEF5' }} />
      <div className="h-3 rounded w-20" style={{ background: '#D8EEF5' }} />
    </div>
  );
}
