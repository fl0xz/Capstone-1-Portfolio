import { ChevronRight, Plus, Wifi, WifiOff, Loader } from 'lucide-react';
import type { ConnectedAccount } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { formatCurrency, formatNumber, formatPercent, formatTimeAgo, getPlatformLabel } from '../utils/format';

interface AccountCardProps {
  account: ConnectedAccount;
  onClick?: () => void;
  compact?: boolean;
}

export function AccountCard({ account, onClick, compact = false }: AccountCardProps) {
  const { metrics, platform, name, handle, status, lastSync } = account;

  const statusIcon = {
    connected: <Wifi size={12} />,
    syncing: <Loader size={12} className="spin" />,
    error: <WifiOff size={12} />,
  };

  if (compact) {
    return (
      <button className="account-card compact" onClick={onClick}>
        <div className={`account-platform-icon platform-${platform}`}>
          <PlatformIcon platform={platform} size={16} />
        </div>
        <div className="account-info">
          <span className="account-name">{name}</span>
          <span className="account-handle">{handle}</span>
        </div>
        <div className="account-metric-compact">
          <span className="account-revenue">{formatCurrency(metrics.revenue)}</span>
          <span className={`account-change ${metrics.revenueChange >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(metrics.revenueChange)}
          </span>
        </div>
        <ChevronRight size={16} className="account-chevron" />
      </button>
    );
  }

  return (
    <div className="account-card" onClick={onClick} role={onClick ? 'button' : undefined}>
      <div className="account-card-header">
        <div className={`account-platform-icon platform-${platform}`}>
          <PlatformIcon platform={platform} size={20} />
        </div>
        <div className="account-info">
          <span className="account-name">{name}</span>
          <span className="account-handle">{handle}</span>
        </div>
        <div className={`account-status status-${status}`}>
          {statusIcon[status]}
          <span>{status}</span>
        </div>
      </div>

      <div className="account-metrics-grid">
        <div className="account-metric">
          <span className="am-label">Revenue</span>
          <span className="am-value">{formatCurrency(metrics.revenue)}</span>
          <span className={`am-change ${metrics.revenueChange >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(metrics.revenueChange)}
          </span>
        </div>
        <div className="account-metric">
          <span className="am-label">Orders</span>
          <span className="am-value">{formatNumber(metrics.orders)}</span>
          <span className={`am-change ${metrics.ordersChange >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(metrics.ordersChange)}
          </span>
        </div>
        <div className="account-metric">
          <span className="am-label">Views</span>
          <span className="am-value">{formatNumber(metrics.views)}</span>
          <span className={`am-change ${metrics.viewsChange >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(metrics.viewsChange)}
          </span>
        </div>
        <div className="account-metric">
          <span className="am-label">Engagement</span>
          <span className="am-value">{metrics.engagement.toFixed(1)}%</span>
          <span className={`am-change ${metrics.engagementChange >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(metrics.engagementChange)}
          </span>
        </div>
      </div>

      <div className="account-card-footer">
        <span className="platform-tag">{getPlatformLabel(platform)}</span>
        <span className="sync-time">Synced {formatTimeAgo(lastSync)}</span>
      </div>
    </div>
  );
}

interface GroupCardProps {
  name: string;
  description: string;
  clientSize: string;
  accountCount: number;
  totalRevenue: number;
  revenueChange: number;
  color: string;
  platforms: string[];
  onClick: () => void;
}

export function GroupCard({
  name,
  description,
  clientSize,
  accountCount,
  totalRevenue,
  revenueChange,
  color,
  platforms,
  onClick,
}: GroupCardProps) {
  return (
    <button className="group-card" onClick={onClick}>
      <div className="group-card-accent" style={{ background: color }} />
      <div className="group-card-content">
        <div className="group-card-top">
          <div>
            <h3 className="group-name">{name}</h3>
            <p className="group-desc">{description}</p>
          </div>
          <span className={`client-size size-${clientSize}`}>
            {clientSize === 'enterprise' ? 'Enterprise' : clientSize === 'mid-market' ? 'Mid-Market' : 'Small Biz'}
          </span>
        </div>
        <div className="group-card-stats">
          <div className="group-stat">
            <span className="gs-value">{formatCurrency(totalRevenue)}</span>
            <span className="gs-label">24h Revenue</span>
          </div>
          <div className="group-stat">
            <span className={`gs-change ${revenueChange >= 0 ? 'positive' : 'negative'}`}>
              {formatPercent(revenueChange)}
            </span>
            <span className="gs-label">vs yesterday</span>
          </div>
          <div className="group-stat">
            <span className="gs-value">{accountCount}</span>
            <span className="gs-label">Accounts</span>
          </div>
        </div>
        <div className="group-card-footer">
          <div className="platform-dots">
            {platforms.map((p) => (
              <span key={p} className={`platform-dot platform-${p}`} title={p} />
            ))}
          </div>
          <ChevronRight size={18} className="group-chevron" />
        </div>
      </div>
    </button>
  );
}

interface AddAccountButtonProps {
  onClick: () => void;
}

export function AddAccountButton({ onClick }: AddAccountButtonProps) {
  return (
    <button className="add-account-btn" onClick={onClick}>
      <Plus size={20} />
      <span>Connect Account</span>
    </button>
  );
}
