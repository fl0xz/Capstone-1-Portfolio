import { AMAZON_UK } from './config';

export interface LwaTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface OrderMetricPoint {
  interval: string;
  unitCount: number;
  orderItemCount: number;
  orderCount: number;
  averageUnitPrice?: { amount: string; currencyCode: string };
  totalSales?: { amount: string; currencyCode: string };
}

export interface SyncMetrics {
  revenue: number;
  orders: number;
  currency: string;
  hourly: Array<{ hour: string; revenue: number; orders: number; views: number }>;
  previousRevenue: number;
  previousOrders: number;
}

export async function refreshAccessToken(refreshToken: string): Promise<LwaTokens> {
  const clientId = process.env.AMAZON_LWA_CLIENT_ID;
  const clientSecret = process.env.AMAZON_LWA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Amazon LWA credentials are not configured');
  }

  const response = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  return response.json() as Promise<LwaTokens>;
}

function isoUtc(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** Align to the top of the hour (Sales API interval requirement). */
function startOfHour(date: Date): Date {
  const d = new Date(date);
  d.setUTCMinutes(0, 0, 0);
  return d;
}

async function spApiGet<T>(path: string, accessToken: string, query: Record<string, string>): Promise<T> {
  const url = new URL(path, AMAZON_UK.endpoint);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      host: url.host,
      'user-agent': 'FoundryLabsCommerceHub/1.0 (Language=TypeScript)',
      'x-amz-access-token': accessToken,
      'x-amz-date': now,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`SP-API ${path} failed (${response.status}): ${err}`);
  }

  return response.json() as Promise<T>;
}

async function fetchOrderMetrics(
  accessToken: string,
  start: Date,
  end: Date,
  granularity: 'Hour' | 'Total'
): Promise<OrderMetricPoint[]> {
  const interval = `${isoUtc(start)}--${isoUtc(end)}`;
  const data = await spApiGet<{ payload?: OrderMetricPoint[] }>(
    '/sales/v1/orderMetrics',
    accessToken,
    {
      marketplaceIds: AMAZON_UK.marketplaceId,
      interval,
      granularity,
    }
  );

  return data.payload || [];
}

function parseAmount(point?: OrderMetricPoint): number {
  const amount = point?.totalSales?.amount;
  return amount ? Number.parseFloat(amount) : 0;
}

/**
 * Pull last-24h + previous-24h order metrics (hourly + totals) for Amazon UK.
 */
export async function fetchAmazonUkMetrics(accessToken: string): Promise<SyncMetrics> {
  const end = startOfHour(new Date());
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  const prevStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);

  const [hourly, currentTotal, previousTotal] = await Promise.all([
    fetchOrderMetrics(accessToken, start, end, 'Hour'),
    fetchOrderMetrics(accessToken, start, end, 'Total'),
    fetchOrderMetrics(accessToken, prevStart, start, 'Total'),
  ]);

  const current = currentTotal[0];
  const previous = previousTotal[0];

  const mappedHourly = hourly.map((point) => {
    const intervalStart = point.interval?.split('--')[0] || '';
    const hourDate = intervalStart ? new Date(intervalStart) : new Date();
    const hour = `${String(hourDate.getUTCHours()).padStart(2, '0')}:00`;

    return {
      hour,
      revenue: parseAmount(point),
      orders: point.orderCount || 0,
      views: 0,
    };
  });

  return {
    revenue: parseAmount(current),
    orders: current?.orderCount || 0,
    currency: current?.totalSales?.currencyCode || 'GBP',
    hourly: mappedHourly,
    previousRevenue: parseAmount(previous),
    previousOrders: previous?.orderCount || 0,
  };
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export async function verifySellerAccess(accessToken: string): Promise<boolean> {
  try {
    await spApiGet('/sellers/v1/marketplaceParticipations', accessToken, {});
    return true;
  } catch {
    return false;
  }
}
