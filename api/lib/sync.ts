import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchAmazonUkMetrics, percentChange, refreshAccessToken } from './amazon';

export interface SyncResult {
  accountId: string;
  brandId: string;
  sellerId: string | null;
  status: 'synced' | 'error';
  revenue?: number;
  orders?: number;
  error?: string;
}

interface AccountRow {
  id: string;
  brand_id: string;
  seller_id: string | null;
  name: string;
  oauth_tokens:
    | { refresh_token: string; access_token: string | null; expires_at: string | null }
    | { refresh_token: string; access_token: string | null; expires_at: string | null }[]
    | null;
}

function getTokenRow(account: AccountRow) {
  if (!account.oauth_tokens) return null;
  return Array.isArray(account.oauth_tokens) ? account.oauth_tokens[0] : account.oauth_tokens;
}

async function getValidAccessToken(
  supabase: SupabaseClient,
  account: AccountRow
): Promise<string> {
  const tokenRow = getTokenRow(account);
  if (!tokenRow?.refresh_token) {
    throw new Error('No refresh token stored for this account');
  }

  const expiresAt = tokenRow.expires_at ? new Date(tokenRow.expires_at).getTime() : 0;
  const stillValid =
    tokenRow.access_token && expiresAt > Date.now() + 2 * 60 * 1000;

  if (stillValid && tokenRow.access_token) {
    return tokenRow.access_token;
  }

  const tokens = await refreshAccessToken(tokenRow.refresh_token);
  const newExpires = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  await supabase.from('oauth_tokens').upsert(
    {
      account_id: account.id,
      refresh_token: tokens.refresh_token || tokenRow.refresh_token,
      access_token: tokens.access_token,
      expires_at: newExpires,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'account_id' }
  );

  return tokens.access_token;
}

export async function syncAmazonAccount(
  supabase: SupabaseClient,
  account: AccountRow
): Promise<SyncResult> {
  const base = {
    accountId: account.id,
    brandId: account.brand_id,
    sellerId: account.seller_id,
  };

  try {
    await supabase
      .from('connected_accounts')
      .update({ status: 'syncing', updated_at: new Date().toISOString() })
      .eq('id', account.id);

    const accessToken = await getValidAccessToken(supabase, account);
    const metrics = await fetchAmazonUkMetrics(accessToken);

    const revenueChange = percentChange(metrics.revenue, metrics.previousRevenue);
    const ordersChange = percentChange(metrics.orders, metrics.previousOrders);

    await supabase.from('metrics_snapshots').insert({
      account_id: account.id,
      period: '24h',
      revenue: metrics.revenue,
      orders: metrics.orders,
      views: 0,
      conversion_rate: 0,
      ad_spend: 0,
      margin: 0,
      roi: 0,
      revenue_change: revenueChange,
      orders_change: ordersChange,
      hourly_data: metrics.hourly,
      captured_at: new Date().toISOString(),
    });

    await supabase
      .from('connected_accounts')
      .update({
        status: 'connected',
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    return {
      ...base,
      status: 'synced',
      revenue: metrics.revenue,
      orders: metrics.orders,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'sync_failed';

    await supabase
      .from('connected_accounts')
      .update({
        status: 'error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    return { ...base, status: 'error', error: message };
  }
}

export async function loadAmazonAccounts(
  supabase: SupabaseClient,
  options: { brandId?: string; accountId?: string } = {}
): Promise<AccountRow[]> {
  let query = supabase
    .from('connected_accounts')
    .select(
      'id, brand_id, seller_id, name, oauth_tokens(refresh_token, access_token, expires_at)'
    )
    .eq('platform', 'amazon')
    .eq('marketplace', 'UK');

  if (options.accountId) {
    query = query.eq('id', options.accountId);
  }

  if (options.brandId) {
    query = query.eq('brand_id', options.brandId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as AccountRow[];
}
