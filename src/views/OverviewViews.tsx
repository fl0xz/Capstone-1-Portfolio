import { Sun, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { GroupCard } from '../components/Cards';
import { morningReport } from '../data/mockData';
import type { ClientGroup } from '../types';

interface OverviewViewProps {
  groups: ClientGroup[];
  totals: {
    revenue: number;
    orders: number;
    views: number;
    accounts: number;
    groups: number;
  };
  onSelectGroup: (groupId: string) => void;
}

export function OverviewView({ groups, totals, onSelectGroup }: OverviewViewProps) {
  const report = morningReport;
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const avgRevenueChange =
    groups.reduce((s, g) => s + g.revenueChange, 0) / groups.length;

  return (
    <div className="view overview-view">
      <header className="view-header">
        <div>
          <h1>{greeting}</h1>
          <p className="view-subtitle">
            Here's your 24-hour commerce snapshot across all client groups
          </p>
        </div>
        <div className="report-badge">
          <Sun size={16} />
          <span>Morning Report · {report.period}</span>
        </div>
      </header>

      <section className="metrics-row">
        <MetricCard
          label="Total Revenue"
          value={totals.revenue}
          change={avgRevenueChange}
          format="currency"
        />
        <MetricCard label="Total Orders" value={totals.orders} format="number" />
        <MetricCard label="Total Views" value={totals.views} format="number" />
        <MetricCard
          label="Avg Engagement"
          value={report.avgEngagement}
          format="percent"
          subtitle="Across all platforms"
        />
      </section>

      <div className="overview-grid">
        <section className="panel highlights-panel">
          <div className="panel-header">
            <h2>
              <TrendingUp size={18} />
              Highlights
            </h2>
          </div>
          <div className="highlights-list">
            {report.highlights.map((h) => (
              <div key={h.id} className={`highlight-item type-${h.type}`}>
                <div className="highlight-dot" />
                <div>
                  <p className="highlight-message">{h.message}</p>
                  <span className="highlight-group">{h.groupName}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel alerts-panel">
          <div className="panel-header">
            <h2>
              <AlertTriangle size={18} />
              Alerts
            </h2>
          </div>
          <div className="alerts-list">
            {report.alerts.map((a) => (
              <div key={a.id} className={`alert-item severity-${a.severity}`}>
                {a.severity === 'warning' ? <AlertTriangle size={16} /> : <Info size={16} />}
                <div>
                  <p className="alert-message">{a.message}</p>
                  <span className="alert-account">
                    {a.accountName} · {a.platform}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Client Groups</h2>
          <span className="panel-meta">{groups.length} groups · {totals.accounts} accounts</span>
        </div>
        <div className="groups-grid">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              name={group.name}
              description={group.description}
              clientSize={group.clientSize}
              accountCount={group.accountCount}
              totalRevenue={group.totalRevenue}
              revenueChange={group.revenueChange}
              color={group.color}
              platforms={[...new Set(group.accounts.map((a) => a.platform))]}
              onClick={() => onSelectGroup(group.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

interface GroupsViewProps {
  groups: ClientGroup[];
  onSelectGroup: (groupId: string) => void;
}

export function GroupsView({ groups, onSelectGroup }: GroupsViewProps) {
  return (
    <div className="view">
      <header className="view-header">
        <div>
          <h1>Client Groups</h1>
          <p className="view-subtitle">
            Manage and monitor all your client accounts in one place
          </p>
        </div>
      </header>

      <div className="groups-grid full">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            name={group.name}
            description={group.description}
            clientSize={group.clientSize}
            accountCount={group.accountCount}
            totalRevenue={group.totalRevenue}
            revenueChange={group.revenueChange}
            color={group.color}
            platforms={[...new Set(group.accounts.map((a) => a.platform))]}
            onClick={() => onSelectGroup(group.id)}
          />
        ))}
      </div>
    </div>
  );
}
