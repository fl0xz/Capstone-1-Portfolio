import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../lib/config';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const configured = Boolean(
    process.env.AMAZON_APPLICATION_ID &&
      process.env.AMAZON_LWA_CLIENT_ID &&
      process.env.AMAZON_LWA_CLIENT_SECRET
  );

  const supabaseConfigured = Boolean(
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let connectedAccounts = 0;
  let lastSync: string | null = null;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data } = await supabase
      .from('connected_accounts')
      .select('last_sync')
      .eq('platform', 'amazon')
      .eq('marketplace', 'UK')
      .order('last_sync', { ascending: false });

    connectedAccounts = data?.length || 0;
    lastSync = data?.[0]?.last_sync || null;
  }

  return res.status(200).json({
    amazon: {
      configured,
      marketplace: 'UK',
      oauth: 'link-based',
      sync: configured && supabaseConfigured,
      connectedAccounts,
      lastSync,
      sellerCentral: 'https://sellercentral.amazon.co.uk',
    },
    supabase: supabaseConfigured,
    cron: Boolean(process.env.CRON_SECRET),
  });
}
