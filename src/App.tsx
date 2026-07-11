import { useState } from 'react';
import { Sidebar, type View } from './components/Sidebar';
import { OverviewView, GroupsView } from './views/OverviewViews';
import { GroupDetailView } from './views/GroupDetailView';
import { ReportsView, SettingsView } from './views/ReportsView';
import { AddGroupModal, Toast } from './components/Modals';
import { useLiveData } from './hooks/useLiveData';
import type { NewAccountForm } from './types';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState<View>('overview');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  const { groups, lastUpdated, isLive, setIsLive, refresh, addAccount, addGroup, totals } =
    useLiveData();

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setCurrentView('group-detail');
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    if (view !== 'group-detail') setSelectedGroupId(null);
  };

  const handleAddGroup = (name: string, description: string, size: 'enterprise' | 'mid-market' | 'small-business') => {
    const id = addGroup(name, description, size);
    setToast({ message: `Created group "${name}"`, type: 'success' });
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
        return <SettingsView />;
      default:
        return <OverviewView groups={groups} totals={totals} onSelectGroup={handleSelectGroup} />;
    }
  };

  return (
    <div className="app">
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onAddGroup={() => setShowAddGroupModal(true)}
        isLive={isLive}
        onToggleLive={() => setIsLive(!isLive)}
        onRefresh={refresh}
        lastUpdated={lastUpdated}
        groupCount={totals.groups}
        accountCount={totals.accounts}
      />
      <main className="main-content">{renderView()}</main>
      {showAddGroupModal && (
        <AddGroupModal
          onClose={() => setShowAddGroupModal(false)}
          onSubmit={handleAddGroup}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default App;
