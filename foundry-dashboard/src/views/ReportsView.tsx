import { FileText, Download, Calendar, Sun } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { morningReport } from '../data/mockData';
import type { ClientGroup } from '../types';
import { formatCurrency, formatNumber } from '../utils/format';
import { PlatformIcon } from '../components/PlatformIcon';

interface ReportsViewProps {
  groups: ClientGroup[];
}

export function ReportsView({ groups }: ReportsViewProps) {
  const report = morningReport;
  const reportDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const platformBreakdown = groups.flatMap((g) => g.accounts).reduce(
    (acc, account) => {
      const p = account.platform;
      if (!acc[p]) acc[p] = { revenue: 0, orders: 0, views: 0, count: 0 };
      acc[p].revenue += account.metrics.revenue;
      acc[p].orders += account.metrics.orders;
      acc[p].views += account.metrics.views;
      acc[p].count += 1;
      return acc;
    },
    {} as Record<string, { revenue: number; orders: number; views: number; count: number }>
  );

  const groupRankings = [...groups]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .map((g, i) => ({ rank: i + 1, ...g }));

  return (
    <div className="view reports-view">
      <header className="view-header">
        <div>
          <h1>Morning Reports</h1>
          <p className="view-subtitle">
            Automated daily snapshots delivered every morning at 6:00 AM
          </p>
        </div>
        <button className="btn-secondary">
          <Download size={16} />
          Export PDF
        </button>
      </header>

      <div className="report-hero">
        <div className="report-hero-icon">
          <Sun size={28} />
        </div>
        <div className="report-hero-content">
          <h2>Daily Commerce Report</h2>
          <div className="report-meta">
            <Calendar size={14} />
            <span>{reportDate}</span>
            <span className="report-divider">·</span>
            <FileText size={14} />
            <span>{report.period}</span>
          </div>
        </div>
        <div className="report-hero-badge">Auto-generated</div>
      </div>

      <section className="metrics-row">
        <MetricCard label="Total Revenue" value={report.totalRevenue} format="currency" />
        <MetricCard label="Total Orders" value={report.totalOrders} format="number" />
        <MetricCard label="Total Views" value={report.totalViews} format="number" />
        <MetricCard label="Avg Engagement" value={report.avgEngagement} format="percent" />
      </section>

      <div className="reports-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Platform Breakdown</h2>
          </div>
          <div className="platform-breakdown">
            {Object.entries(platformBreakdown).map(([platform, data]) => (
              <div key={platform} className="platform-breakdown-item">
                <div className={`pb-icon platform-${platform}`}>
                  <PlatformIcon platform={platform as 'tiktok' | 'amazon' | 'ebay'} size={20} />
                </div>
                <div className="pb-info">
                  <span className="pb-name">
                    {platform === 'tiktok' ? 'TikTok Shop' : platform === 'amazon' ? 'Amazon' : 'eBay'}
                  </span>
                  <span className="pb-accounts">{data.count} accounts</span>
                </div>
                <div className="pb-stats">
                  <span className="pb-revenue">{formatCurrency(data.revenue)}</span>
                  <span className="pb-orders">{formatNumber(data.orders)} orders</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Group Rankings</h2>
            <span className="panel-meta">By 24h revenue</span>
          </div>
          <div className="rankings-list">
            {groupRankings.map((group) => (
              <div key={group.id} className="ranking-item">
                <span className="ranking-number">#{group.rank}</span>
                <div className="ranking-color" style={{ background: group.color }} />
                <div className="ranking-info">
                  <span className="ranking-name">{group.name}</span>
                  <span className="ranking-accounts">{group.accountCount} accounts</span>
                </div>
                <div className="ranking-stats">
                  <span className="ranking-revenue">{formatCurrency(group.totalRevenue)}</span>
                  <span className={`ranking-change ${group.revenueChange >= 0 ? 'positive' : 'negative'}`}>
                    {group.revenueChange >= 0 ? '+' : ''}{group.revenueChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Report Highlights</h2>
        </div>
        <div className="report-highlights-grid">
          {report.highlights.map((h) => (
            <div key={h.id} className={`report-highlight type-${h.type}`}>
              <p>{h.message}</p>
              <span>{h.groupName}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function SettingsView() {
  return (
    <div className="view settings-view">
      <header className="view-header">
        <div>
          <h1>Settings</h1>
          <p className="view-subtitle">Configure your Foundry Labs dashboard</p>
        </div>
      </header>

      <div className="settings-sections">
        <section className="panel settings-panel">
          <h2>Morning Report Schedule</h2>
          <p className="settings-desc">Automated reports are generated and emailed daily</p>
          <div className="settings-row">
            <label>Report Time</label>
            <select defaultValue="06:00">
              <option value="05:00">5:00 AM</option>
              <option value="06:00">6:00 AM</option>
              <option value="07:00">7:00 AM</option>
              <option value="08:00">8:00 AM</option>
            </select>
          </div>
          <div className="settings-row">
            <label>Report Email</label>
            <input type="email" defaultValue="reports@foundrylabs.co" />
          </div>
          <div className="settings-row">
            <label>Data Period</label>
            <select defaultValue="24h">
              <option value="24h">Last 24 Hours</option>
              <option value="48h">Last 48 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </section>

        <section className="panel settings-panel">
          <h2>Live Data Sync</h2>
          <p className="settings-desc">How often platform data is refreshed</p>
          <div className="settings-row">
            <label>Refresh Interval</label>
            <select defaultValue="30">
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="60">Every hour</option>
            </select>
          </div>
          <div className="settings-row toggle-row">
            <label>Auto-sync on login</label>
            <input type="checkbox" defaultChecked />
          </div>
        </section>

        <section className="panel settings-panel">
          <h2>Connected Platforms</h2>
          <p className="settings-desc">API integration status (mockup — not live)</p>
          <div className="platform-status-list">
            {[
              { name: 'TikTok Shop API', status: 'ready', note: 'OAuth 2.0' },
              { name: 'Amazon SP-API', status: 'ready', note: 'Seller Central' },
              { name: 'eBay Trading API', status: 'ready', note: 'OAuth' },
            ].map((p) => (
              <div key={p.name} className="platform-status-item">
                <div className="ps-info">
                  <span className="ps-name">{p.name}</span>
                  <span className="ps-note">{p.note}</span>
                </div>
                <span className="ps-status status-ready">Ready to connect</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
