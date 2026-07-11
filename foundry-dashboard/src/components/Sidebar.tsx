import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Plus,
  Radio,
  RefreshCw,
} from 'lucide-react';

export type View = 'overview' | 'groups' | 'group-detail' | 'reports' | 'settings';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onAddGroup: () => void;
  isLive: boolean;
  onToggleLive: () => void;
  onRefresh: () => void;
  lastUpdated: Date;
  groupCount: number;
  accountCount: number;
}

export function Sidebar({
  currentView,
  onNavigate,
  onAddGroup,
  isLive,
  onToggleLive,
  onRefresh,
  lastUpdated,
  groupCount,
  accountCount,
}: SidebarProps) {
  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'groups', label: 'Client Groups', icon: <Users size={18} /> },
    { id: 'reports', label: 'Morning Reports', icon: <FileText size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.9" />
              <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
              <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
              <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-name">Foundry Labs</span>
            <span className="logo-tagline">Commerce Hub</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id || (item.id === 'groups' && currentView === 'group-detail') ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-stats">
        <div className="stat-pill">
          <span className="stat-value">{groupCount}</span>
          <span className="stat-label">Groups</span>
        </div>
        <div className="stat-pill">
          <span className="stat-value">{accountCount}</span>
          <span className="stat-label">Accounts</span>
        </div>
      </div>

      <div className="sidebar-actions">
        <button className="btn-primary" onClick={onAddGroup}>
          <Plus size={16} />
          New Group
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="live-indicator">
          <button
            className={`live-toggle ${isLive ? 'active' : ''}`}
            onClick={onToggleLive}
            title={isLive ? 'Pause live updates' : 'Resume live updates'}
          >
            <Radio size={14} />
            <span>{isLive ? 'Live' : 'Paused'}</span>
            {isLive && <span className="live-dot" />}
          </button>
          <button className="refresh-btn" onClick={onRefresh} title="Refresh now">
            <RefreshCw size={14} />
          </button>
        </div>
        <span className="last-updated">
          Updated {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </aside>
  );
}
