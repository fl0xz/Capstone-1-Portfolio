import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../lib/config';
import { loadAmazonAccounts, syncAmazonAccount } from '../lib/sync';

function authorize(req: VercelRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.SYNC_SECRET;
  if (!secret) return true;

  const header = req.headers.authorization;
  if (header === `Bearer ${secret}`) return true;

  const querySecret = typeof req.query.secret === 'string' ? req.query.secret : undefined;
  return querySecret === secret;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!authorize(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({
      error: 'Supabase is required for Amazon data sync',
      setupRequired: true,
      message: 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then connect Amazon accounts via OAuth',
    });
  }

  if (!process.env.AMAZON_LWA_CLIENT_ID || !process.env.AMAZON_LWA_CLIENT_SECRET) {
    return res.status(503).json({
      error: 'Amazon SP-API is not configured yet',
      setupRequired: true,
    });
  }

  const brandId = typeof req.query.brandId === 'string' ? req.query.brandId : undefined;
  const accountId = typeof req.query.accountId === 'string' ? req.query.accountId : undefined;

  try {
    const accounts = await loadAmazonAccounts(supabase, { brandId, accountId });

    if (accounts.length === 0) {
      return res.status(200).json({
        synced: 0,
        results: [],
        message: 'No connected Amazon UK accounts found',
      });
    }

    const results = [];
    for (const account of accounts) {
      results.push(await syncAmazonAccount(supabase, account));
    }

    const synced = results.filter((r) => r.status === 'synced').length;
    const failed = results.filter((r) => r.status === 'error').length;

    return res.status(200).json({
      synced,
      failed,
      total: results.length,
      results,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'sync_failed';
    return res.status(500).json({ error: message });
  }
}
