export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    tiktok: 'TikTok Shop',
    amazon: 'Amazon UK',
    ebay: 'eBay',
    etsy: 'Etsy',
  };
  return labels[platform] || platform;
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    tiktok: '#000000',
    amazon: '#FF9900',
    ebay: '#E53238',
    etsy: '#F1641E',
  };
  return colors[platform] || '#86868B';
}

export function getClientSizeLabel(size: string): string {
  const labels: Record<string, string> = {
    enterprise: 'Enterprise',
    'mid-market': 'Mid-Market',
    'small-business': 'Small Business',
  };
  return labels[size] || size;
}
