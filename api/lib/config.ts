import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getAppUrl(req?: { headers?: { host?: string; 'x-forwarded-proto'?: string } }) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (req?.headers?.host) {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    return `${proto}://${req.headers.host}`;
  }
  return 'http://localhost:5173';
}

export const AMAZON_UK = {
  consentUrl: 'https://sellercentral.amazon.co.uk/apps/authorize/consent',
  marketplaceId: 'A1F83G8C2ARO7P',
  region: 'eu-west-1',
  endpoint: 'https://sellingpartnerapi-eu.amazon.com',
};
