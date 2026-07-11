import { useState, useEffect, useCallback } from 'react';
import type { ClientGroup, ConnectedAccount } from '../types';
import { clientGroups as initialGroups } from '../data/mockData';

function jitter(value: number, percent: number = 0.02): number {
  const delta = value * percent * (Math.random() - 0.5) * 2;
  return Math.round((value + delta) * 100) / 100;
}

function updateAccountMetrics(account: ConnectedAccount): ConnectedAccount {
  const m = account.metrics;
  return {
    ...account,
    lastSync: new Date().toISOString(),
    metrics: {
      ...m,
      revenue: jitter(m.revenue, 0.005),
      orders: Math.round(jitter(m.orders, 0.01)),
      views: Math.round(jitter(m.views, 0.008)),
      engagement: jitter(m.engagement, 0.02),
      followers: Math.round(jitter(m.followers, 0.001)),
      conversionRate: jitter(m.conversionRate, 0.02),
    },
    hourlyData: account.hourlyData.map((point, i) => {
      if (i === account.hourlyData.length - 1) {
        return {
          ...point,
          revenue: Math.round(jitter(point.revenue, 0.05)),
          orders: Math.round(jitter(point.orders, 0.05)),
          views: Math.round(jitter(point.views, 0.03)),
        };
      }
      return point;
    }),
  };
}

function recalcGroupTotals(group: ClientGroup): ClientGroup {
  const totalRevenue = group.accounts.reduce((sum, a) => sum + a.metrics.revenue, 0);
  const avgChange =
    group.accounts.reduce((sum, a) => sum + a.metrics.revenueChange, 0) / group.accounts.length;
  return {
    ...group,
    accountCount: group.accounts.length,
    totalRevenue: Math.round(totalRevenue),
    revenueChange: Math.round(avgChange * 10) / 10,
  };
}

export function useLiveData() {
  const [groups, setGroups] = useState<ClientGroup[]>(initialGroups);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  const refresh = useCallback(() => {
    setGroups((prev) =>
      prev.map((group) =>
        recalcGroupTotals({
          ...group,
          accounts: group.accounts.map((account) =>
            account.status === 'connected' ? updateAccountMetrics(account) : account
          ),
        })
      )
    );
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [isLive, refresh]);

  const addAccount = useCallback(
    (groupId: string, account: Omit<ConnectedAccount, 'id' | 'hourlyData' | 'metrics' | 'lastSync' | 'status'>) => {
      const newAccount: ConnectedAccount = {
        ...account,
        id: `a${Date.now()}`,
        status: 'syncing',
        lastSync: new Date().toISOString(),
        metrics: {
          revenue: 0,
          revenueChange: 0,
          orders: 0,
          ordersChange: 0,
          views: 0,
          viewsChange: 0,
          engagement: 0,
          engagementChange: 0,
          followers: 0,
          followersChange: 0,
          conversionRate: 0,
          conversionChange: 0,
        },
        hourlyData: [],
      };

      setGroups((prev) =>
        prev.map((group) => {
          if (group.id !== groupId) return group;
          const updated = recalcGroupTotals({
            ...group,
            accounts: [...group.accounts, newAccount],
          });
          return updated;
        })
      );

      setTimeout(() => {
        setGroups((prev) =>
          prev.map((group) => {
            if (group.id !== groupId) return group;
            return recalcGroupTotals({
              ...group,
              accounts: group.accounts.map((a) =>
                a.id === newAccount.id
                  ? {
                      ...a,
                      status: 'connected' as const,
                      metrics: {
                        revenue: 1200 + Math.random() * 800,
                        revenueChange: 5 + Math.random() * 15,
                        orders: 40 + Math.round(Math.random() * 30),
                        ordersChange: 3 + Math.random() * 10,
                        views: 50000 + Math.round(Math.random() * 100000),
                        viewsChange: 5 + Math.random() * 20,
                        engagement: 2 + Math.random() * 4,
                        engagementChange: 0.5 + Math.random() * 1.5,
                        followers: 5000 + Math.round(Math.random() * 20000),
                        followersChange: 0.5 + Math.random() * 2,
                        conversionRate: 2 + Math.random() * 3,
                        conversionChange: 0.2 + Math.random() * 0.8,
                      },
                      hourlyData: Array.from({ length: 24 }, (_, i) => ({
                        hour: new Date(Date.now() - (23 - i) * 3600000).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                        revenue: Math.round(30 + Math.random() * 80),
                        orders: Math.round(1 + Math.random() * 6),
                        views: Math.round(1000 + Math.random() * 5000),
                      })),
                    }
                  : a
              ),
            });
          })
        );
      }, 3000);
    },
    []
  );

  const addGroup = useCallback((name: string, description: string, clientSize: ClientGroup['clientSize']) => {
    const colors = ['#5856D6', '#AF52DE', '#FF2D55', '#FF9500', '#34C759', '#0071E3'];
    const newGroup: ClientGroup = {
      id: `g${Date.now()}`,
      name,
      description,
      clientSize,
      accountCount: 0,
      totalRevenue: 0,
      revenueChange: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      accounts: [],
    };
    setGroups((prev) => [...prev, newGroup]);
    return newGroup.id;
  }, []);

  const totals = {
    revenue: groups.reduce((s, g) => s + g.totalRevenue, 0),
    orders: groups.reduce((s, g) => s + g.accounts.reduce((a, acc) => a + acc.metrics.orders, 0), 0),
    views: groups.reduce((s, g) => s + g.accounts.reduce((a, acc) => a + acc.metrics.views, 0), 0),
    accounts: groups.reduce((s, g) => s + g.accounts.length, 0),
    groups: groups.length,
  };

  return { groups, lastUpdated, isLive, setIsLive, refresh, addAccount, addGroup, totals };
}
