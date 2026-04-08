export const formatCurrency = (value, decimals = 0) => {
  if (value == null) return '—';
  const num = parseFloat(value);
  if (isNaN(num)) return '—';

  if (Math.abs(num) >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(num) >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(num) >= 1_000) {
    return `$${(num / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercent = (value, decimals = 1) => {
  if (value == null) return '—';
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(decimals)}%`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(dateStr));
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

export const getRiskColor = (risk) => {
  const map = { conservative: 'emerald', moderate: 'amber', aggressive: 'rose' };
  return map[risk] || 'slate';
};

export const getPriorityColor = (priority) => {
  const map = { critical: 'rose', high: 'amber', medium: 'blue', low: 'slate' };
  return map[priority] || 'slate';
};

export const getSeverityColor = (severity) => {
  const map = { critical: 'rose', error: 'rose', warning: 'amber', info: 'blue' };
  return map[severity] || 'slate';
};
