import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../lib/config';
import { loadAmazonAccounts, syncAmazonAccount } from '../lib/sync';

/**
 * Hourly cron — syncs all connected Amazon UK accounts.
 * Configure in vercel.json and set CRON_SECRET in Vercel env.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const accounts = await loadAmazonAccounts(supabase);
    const results = [];

    for (const account of accounts) {
      results.push(await syncAmazonAccount(supabase, account));
    }

    return res.status(200).json({
      ok: true,
      synced: results.filter((r) => r.status === 'synced').length,
      failed: results.filter((r) => r.status === 'error').length,
      results,
      at: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'cron_sync_failed';
    return res.status(500).json({ error: message });
  }
}
