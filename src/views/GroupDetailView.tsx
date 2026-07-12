import { useState } from 'react';
import { ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { AccountCard, AddAccountButton } from '../components/Cards';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { AddAccountModal } from '../components/Modals';
import { syncAmazonAccounts } from '../lib/api';
import type { ClientGroup, ConnectedAccount, NewAccountForm } from '../types';
import { formatCurrency, formatNumber, getClientSizeLabel } from '../utils/format';

interface GroupDetailViewProps {
  group: ClientGroup;
  onBack: () => void;
  onAddAccount: (groupId: string, form: NewAccountForm) => void;
  onSynced?: () => void | Promise<void>;
}

export function GroupDetailView({ group, onBack, onAddAccount, onSynced }: GroupDetailViewProps) {
  const [selectedAccount, setSelectedAccount] = useState<ConnectedAccount | null>(
    group.accounts[0] || null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders' | 'views'>('revenue');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const totalOrders = group.accounts.reduce((s, a) => s + a.metrics.orders, 0);
  const totalViews = group.accounts.reduce((s, a) => s + a.metrics.views, 0);
  const avgEngagement =
    group.accounts.reduce((s, a) => s + a.metrics.engagement, 0) / (group.accounts.length || 1);

  const amazonAccounts = group.accounts.filter((a) => a.platform === 'amazon');

  const handleAddAccount = (form: NewAccountForm) => {
    onAddAccount(group.id, form);
    setShowAddModal(false);
  };

  const handleSyncAmazon = async () => {
    setSyncing(true);
    setSyncMessage('');
    const result = await syncAmazonAccounts({ brandId: group.id });
    if (result.ok) {
      setSyncMessage(`Synced ${result.synced || 0} Amazon account(s)`);
      await onSynced?.();
    } else {
      setSyncMessage(result.error || 'Sync failed');
    }
    setSyncing(false);
    setTimeout(() => setSyncMessage(''), 4000);
  };

  return (
    <div className="view group-detail-view">
      <header className="view-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>All Groups</span>
        </button>
        <div className="group-detail-title">
          <div className="group-color-dot" style={{ background: group.color }} />
          <div>
            <h1>{group.name}</h1>
            <p className="view-subtitle">
              {group.description} · {getClientSizeLabel(group.clientSize)}
            </p>
          </div>
        </div>
        <div className="header-actions">
          {amazonAccounts.length > 0 && (
            <button className="btn-secondary" onClick={() => void handleSyncAmazon()} disabled={syncing}>
              <RefreshCw size={16} className={syncing ? 'spin' : undefined} />
              {syncing ? 'Syncing…' : 'Sync Amazon'}
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Connect Account
          </button>
        </div>
      </header>
      {syncMessage && <p className="inline-sync-message">{syncMessage}</p>}

      <section className="metrics-row">
        <MetricCard
          label="24h Revenue"
          value={group.totalRevenue}
          change={group.revenueChange}
          format="currency"
          accent={group.color}
        />
        <MetricCard label="Orders" value={totalOrders} format="number" />
        <MetricCard label="Views" value={totalViews} format="number" />
        <MetricCard label="Engagement" value={avgEngagement} format="percent" />
      </section>

      <div className="group-detail-layout">
        <section className="panel accounts-panel">
          <div className="panel-header">
            <h2>Connected Accounts</h2>
            <span className="panel-meta">{group.accounts.length} accounts</span>
          </div>
          <div className="accounts-list">
            {group.accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                compact
                onClick={() => setSelectedAccount(account)}
              />
            ))}
            <AddAccountButton onClick={() => setShowAddModal(true)} />
          </div>
        </section>

        <section className="panel analytics-panel">
          {selectedAccount ? (
            <>
              <div className="panel-header">
                <div>
                  <h2>{selectedAccount.name}</h2>
                  <span className="panel-meta">{selectedAccount.handle} · Last 24 hours</span>
                </div>
                <div className="chart-tabs">
                  {(['revenue', 'orders', 'views'] as const).map((m) => (
                    <button
                      key={m}
                      className={`chart-tab ${chartMetric === m ? 'active' : ''}`}
                      onClick={() => setChartMetric(m)}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <AnalyticsChart
                data={selectedAccount.hourlyData}
                metric={chartMetric}
                color={group.color}
                height={220}
              />

              <div className="detail-metrics">
                <div className="detail-metric">
                  <span className="dm-label">Revenue</span>
                  <span className="dm-value">{formatCurrency(selectedAccount.metrics.revenue)}</span>
                </div>
                <div className="detail-metric">
                  <span className="dm-label">Orders</span>
                  <span className="dm-value">{formatNumber(selectedAccount.metrics.orders)}</span>
                </div>
                <div className="detail-metric">
                  <span className="dm-label">Views</span>
                  <span className="dm-value">{formatNumber(selectedAccount.metrics.views)}</span>
                </div>
                <div className="detail-metric">
                  <span className="dm-label">Engagement</span>
                  <span className="dm-value">{selectedAccount.metrics.engagement.toFixed(1)}%</span>
                </div>
                <div className="detail-metric">
                  <span className="dm-label">Followers</span>
                  <span className="dm-value">{formatNumber(selectedAccount.metrics.followers)}</span>
                </div>
                <div className="detail-metric">
                  <span className="dm-label">Conversion</span>
                  <span className="dm-value">{selectedAccount.metrics.conversionRate.toFixed(1)}%</span>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No accounts connected yet</p>
              <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                Connect your first account
              </button>
            </div>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>All Account Analytics</h2>
        </div>
        <div className="accounts-grid">
          {group.accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onClick={() => setSelectedAccount(account)}
            />
          ))}
        </div>
      </section>

      {showAddModal && (
        <AddAccountModal
          brandId={group.id}
          brandName={group.name}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddAccount}
        />
      )}
    </div>
  );
}
