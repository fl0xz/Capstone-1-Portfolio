import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../lib/config';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(200).json({
      live: false,
      accounts: [],
      message: 'Demo mode — connect Supabase + Amazon OAuth for live metrics',
    });
  }

  const brandId = typeof req.query.brandId === 'string' ? req.query.brandId : undefined;

  let accountsQuery = supabase
    .from('connected_accounts')
    .select('id, brand_id, platform, marketplace, seller_id, name, handle, status, last_sync')
    .eq('platform', 'amazon')
    .eq('marketplace', 'UK')
    .order('last_sync', { ascending: false });

  if (brandId) {
    accountsQuery = accountsQuery.eq('brand_id', brandId);
  }

  const { data: accounts, error: accountsError } = await accountsQuery;
  if (accountsError) {
    return res.status(500).json({ error: accountsError.message });
  }

  if (!accounts || accounts.length === 0) {
    return res.status(200).json({ live: false, accounts: [], message: 'No Amazon UK accounts connected' });
  }

  const accountIds = accounts.map((a) => a.id);

  const { data: snapshots, error: snapError } = await supabase
    .from('metrics_snapshots')
    .select(
      'account_id, revenue, orders, views, conversion_rate, revenue_change, orders_change, hourly_data, captured_at'
    )
    .in('account_id', accountIds)
    .eq('period', '24h')
    .order('captured_at', { ascending: false });

  if (snapError) {
    return res.status(500).json({ error: snapError.message });
  }

  const latestByAccount = new Map<string, (typeof snapshots)[number]>();
  for (const snap of snapshots || []) {
    if (!latestByAccount.has(snap.account_id)) {
      latestByAccount.set(snap.account_id, snap);
    }
  }

  const enriched = accounts.map((account) => {
    const snap = latestByAccount.get(account.id);
    return {
      id: account.id,
      brandId: account.brand_id,
      platform: account.platform,
      marketplace: account.marketplace,
      sellerId: account.seller_id,
      name: account.name,
      handle: account.handle,
      status: account.status,
      lastSync: account.last_sync,
      metrics: snap
        ? {
            revenue: Number(snap.revenue) || 0,
            revenueChange: Number(snap.revenue_change) || 0,
            orders: Number(snap.orders) || 0,
            ordersChange: Number(snap.orders_change) || 0,
            views: Number(snap.views) || 0,
            conversionRate: Number(snap.conversion_rate) || 0,
            hourlyData: Array.isArray(snap.hourly_data) ? snap.hourly_data : [],
            capturedAt: snap.captured_at,
          }
        : null,
    };
  });

  return res.status(200).json({
    live: enriched.some((a) => a.metrics),
    accounts: enriched,
    fetchedAt: new Date().toISOString(),
  });
}
