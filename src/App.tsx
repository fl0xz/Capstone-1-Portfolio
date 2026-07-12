import { useState, useEffect } from 'react';
import { Sidebar, type View } from './components/Sidebar';
import { OverviewView, GroupsView } from './views/OverviewViews';
import { GroupDetailView } from './views/GroupDetailView';
import { ReportsView, SettingsView } from './views/ReportsView';
import { AddGroupModal, Toast } from './components/Modals';
import { useLiveData } from './hooks/useLiveData';
import { useLiveAmazonOverlay } from './hooks/useLiveAmazonOverlay';
import { syncAmazonAccounts } from './lib/api';
import type { NewAccountForm } from './types';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState<View>('overview');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  const { groups: mockGroups, lastUpdated, isLive, setIsLive, refresh, addAccount, addGroup } =
    useLiveData();

  const { groups, live: hasLiveAmazon, refreshLive } = useLiveAmazonOverlay(mockGroups);

  const totals = {
    revenue: groups.reduce((s, g) => s + g.totalRevenue, 0),
    orders: groups.reduce((s, g) => s + g.accounts.reduce((a, acc) => a + acc.metrics.orders, 0), 0),
    views: groups.reduce((s, g) => s + g.accounts.reduce((a, acc) => a + acc.metrics.views, 0), 0),
    accounts: groups.reduce((s, g) => s + g.accounts.length, 0),
    groups: groups.length,
  };

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connect = params.get('connect');

    if (connect === 'success') {
      const platform = params.get('platform') || 'account';
      const brandId = params.get('brandId');
      const shouldSync = params.get('sync') === '1';

      setToast({
        message: `${platform === 'amazon' ? 'Amazon UK' : platform} connected successfully!`,
        type: 'success',
      });
      if (brandId) {
        setSelectedGroupId(brandId);
        setCurrentView('group-detail');
      }
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setToast(null), 5000);

      if (shouldSync && brandId) {
        void (async () => {
          setToast({ message: 'Syncing Amazon UK orders…', type: 'success' });
          const result = await syncAmazonAccounts({ brandId });
          if (result.ok) {
            await refreshLive();
            setToast({
              message: `Synced ${result.synced || 0} Amazon account${(result.synced || 0) === 1 ? '' : 's'}`,
              type: 'success',
            });
          } else {
            setToast({
              message: result.error || 'Connected — sync will run once credentials are ready',
              type: 'warning',
            });
          }
          setTimeout(() => setToast(null), 5000);
        })();
      }
    }

    if (connect === 'error') {
      const message = params.get('message') || 'Connection failed';
      setToast({ message: decodeURIComponent(message), type: 'warning' });
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setToast(null), 6000);
    }
  }, [refreshLive]);

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setCurrentView('group-detail');
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    if (view !== 'group-detail') setSelectedGroupId(null);
  };

  const handleAddGroup = (
    name: string,
    description: string,
    size: 'enterprise' | 'mid-market' | 'small-business'
  ) => {
    const id = addGroup(name, description, size);
    setToast({ message: `Created brand "${name}"`, type: 'success' });
    setTimeout(() => setToast(null), 3000);
    handleSelectGroup(id);
  };

  const handleAddAccount = (groupId: string, form: NewAccountForm) => {
    addAccount(groupId, {
      platform: form.platform,
      name: form.name,
      handle: form.handle,
    });
    setToast({ message: `Connecting ${form.name}...`, type: 'success' });
    setTimeout(() => {
      setToast({ message: `${form.name} connected successfully`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
    }, 3000);
  };

  const renderView = () => {
    if (currentView === 'group-detail' && selectedGroup) {
      return (
        <GroupDetailView
          group={selectedGroup}
          onBack={() => handleNavigate('groups')}
          onAddAccount={handleAddAccount}
          onSynced={async () => {
            await refreshLive();
          }}
        />
      );
    }

    switch (currentView) {
      case 'overview':
        return <OverviewView groups={groups} totals={totals} onSelectGroup={handleSelectGroup} />;
      case 'groups':
        return <GroupsView groups={groups} onSelectGroup={handleSelectGroup} />;
      case 'reports':
        return <ReportsView groups={groups} />;
      case 'settings':
        return (
          <SettingsView
            onSynced={async () => {
              await refreshLive();
            }}
          />
        );
      default:
        return <OverviewView groups={groups} totals={totals} onSelectGroup={handleSelectGroup} />;
    }
  };

  const handleRefresh = async () => {
    refresh();
    await refreshLive();
  };

  return (
    <div className="app">
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onAddGroup={() => setShowAddGroupModal(true)}
        isLive={isLive || hasLiveAmazon}
        onToggleLive={() => setIsLive(!isLive)}
        onRefresh={() => void handleRefresh()}
        lastUpdated={lastUpdated}
        groupCount={totals.groups}
        accountCount={totals.accounts}
      />
      <main className="main-content">{renderView()}</main>
      {showAddGroupModal && (
        <AddGroupModal onClose={() => setShowAddGroupModal(false)} onSubmit={handleAddGroup} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default App;
