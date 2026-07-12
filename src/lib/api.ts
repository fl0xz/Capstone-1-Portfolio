export async function getAmazonAuthorizeUrl(brandId: string): Promise<{
  url?: string;
  error?: string;
  setupRequired?: boolean;
}> {
  const params = new URLSearchParams({ brandId });
  const res = await fetch(`/api/amazon/authorize?${params.toString()}`);

  const data = await res.json();

  if (!res.ok) {
    return {
      error: data.error || 'Failed to start Amazon connection',
      setupRequired: data.setupRequired,
    };
  }

  return { url: data.url };
}

export async function getIntegrationStatus(): Promise<{
  amazon: {
    configured: boolean;
    marketplace: string;
    sync?: boolean;
    connectedAccounts?: number;
    lastSync?: string | null;
  };
  supabase?: boolean;
  cron?: boolean;
}> {
  try {
    const res = await fetch('/api/integrations/status');
    if (!res.ok) throw new Error('status check failed');
    return await res.json();
  } catch {
    return { amazon: { configured: false, marketplace: 'UK' } };
  }
}

export async function syncAmazonAccounts(options: {
  brandId?: string;
  accountId?: string;
} = {}): Promise<{
  ok: boolean;
  synced?: number;
  failed?: number;
  error?: string;
  setupRequired?: boolean;
  results?: Array<{
    accountId: string;
    brandId: string;
    status: 'synced' | 'error';
    revenue?: number;
    orders?: number;
    error?: string;
  }>;
}> {
  const params = new URLSearchParams();
  if (options.brandId) params.set('brandId', options.brandId);
  if (options.accountId) params.set('accountId', options.accountId);

  const qs = params.toString();
  const res = await fetch(`/api/amazon/sync${qs ? `?${qs}` : ''}`, { method: 'POST' });
  const data = await res.json();

  if (!res.ok) {
    return {
      ok: false,
      error: data.error || 'Sync failed',
      setupRequired: data.setupRequired,
    };
  }

  return { ok: true, ...data };
}

export interface LiveAmazonAccount {
  id: string;
  brandId: string;
  name: string;
  handle: string;
  status: string;
  lastSync: string | null;
  metrics: {
    revenue: number;
    revenueChange: number;
    orders: number;
    ordersChange: number;
    views: number;
    conversionRate: number;
    hourlyData: Array<{ hour: string; revenue: number; orders: number; views: number }>;
    capturedAt: string;
  } | null;
}

export async function getAmazonMetrics(brandId?: string): Promise<{
  live: boolean;
  accounts: LiveAmazonAccount[];
  message?: string;
}> {
  try {
    const params = brandId ? `?brandId=${encodeURIComponent(brandId)}` : '';
    const res = await fetch(`/api/amazon/metrics${params}`);
    if (!res.ok) throw new Error('metrics fetch failed');
    return await res.json();
  } catch {
    return { live: false, accounts: [], message: 'Unable to load live metrics' };
  }
}
