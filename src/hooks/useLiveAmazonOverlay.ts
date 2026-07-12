import { useCallback, useEffect, useState } from 'react';
import { getAmazonMetrics, type LiveAmazonAccount } from '../lib/api';
import type { ClientGroup, ConnectedAccount } from '../types';

/**
 * Overlay live Amazon UK metrics onto mock brand groups when sync data exists.
 * Matching is by brandId when brands are stored in Supabase; otherwise by seller handle.
 */
export function useLiveAmazonOverlay(groups: ClientGroup[]) {
  const [liveAccounts, setLiveAccounts] = useState<LiveAmazonAccount[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const refreshLive = useCallback(async () => {
    setLoading(true);
    const data = await getAmazonMetrics();
    setLiveAccounts(data.accounts);
    setLive(data.live);
    setMessage(data.message);
    setLoading(false);
    return data;
  }, []);

  useEffect(() => {
    void refreshLive();
  }, [refreshLive]);

  const mergedGroups = groups.map((group) => {
    const brandLives = liveAccounts.filter((a) => a.brandId === group.id);
    if (brandLives.length === 0) return group;

    const accounts: ConnectedAccount[] = [
      ...brandLives.map((liveAcc) => {
        const existing = group.accounts.find(
          (a) => a.platform === 'amazon' && (a.id === liveAcc.id || a.handle === liveAcc.handle)
        );

        const metrics = liveAcc.metrics;
        return {
          id: liveAcc.id,
          platform: 'amazon' as const,
          name: liveAcc.name,
          handle: liveAcc.handle || 'amazon-uk',
          status: (liveAcc.status as ConnectedAccount['status']) || 'connected',
          lastSync: liveAcc.lastSync || new Date().toISOString(),
          metrics: {
            revenue: metrics?.revenue ?? existing?.metrics.revenue ?? 0,
            revenueChange: metrics?.revenueChange ?? existing?.metrics.revenueChange ?? 0,
            orders: metrics?.orders ?? existing?.metrics.orders ?? 0,
            ordersChange: metrics?.ordersChange ?? existing?.metrics.ordersChange ?? 0,
            views: metrics?.views ?? existing?.metrics.views ?? 0,
            viewsChange: existing?.metrics.viewsChange ?? 0,
            engagement: existing?.metrics.engagement ?? 0,
            engagementChange: existing?.metrics.engagementChange ?? 0,
            followers: existing?.metrics.followers ?? 0,
            followersChange: existing?.metrics.followersChange ?? 0,
            conversionRate: metrics?.conversionRate ?? existing?.metrics.conversionRate ?? 0,
            conversionChange: existing?.metrics.conversionChange ?? 0,
          },
          hourlyData:
            metrics?.hourlyData?.length
              ? metrics.hourlyData
              : existing?.hourlyData || [],
        };
      }),
      ...group.accounts.filter(
        (a) =>
          a.platform !== 'amazon' ||
          !brandLives.some((l) => l.id === a.id || l.handle === a.handle)
      ),
    ];

    const totalRevenue = accounts.reduce((s, a) => s + a.metrics.revenue, 0);
    const revenueChange =
      accounts.reduce((s, a) => s + a.metrics.revenueChange, 0) / (accounts.length || 1);

    return {
      ...group,
      accounts,
      accountCount: accounts.length,
      totalRevenue,
      revenueChange,
    };
  });

  return {
    groups: live ? mergedGroups : groups,
    live,
    loading,
    message,
    liveAccounts,
    refreshLive,
  };
}
