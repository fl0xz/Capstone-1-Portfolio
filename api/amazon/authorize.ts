import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { AMAZON_UK, getAppUrl, getSupabaseAdmin } from '../lib/config';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const brandId = req.query.brandId as string | undefined;
  if (!brandId) {
    return res.status(400).json({ error: 'brandId is required' });
  }

  const applicationId = process.env.AMAZON_APPLICATION_ID;
  const clientId = process.env.AMAZON_LWA_CLIENT_ID;

  if (!applicationId || !clientId) {
    return res.status(503).json({
      error: 'Amazon SP-API is not configured yet',
      setupRequired: true,
      message: 'Add AMAZON_APPLICATION_ID and AMAZON_LWA_CLIENT_ID to Vercel environment variables',
    });
  }

  const appUrl = getAppUrl(req);
  const redirectUri = process.env.AMAZON_REDIRECT_URI || `${appUrl}/api/amazon/callback`;
  const state = crypto.randomBytes(24).toString('hex');

  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from('oauth_states').insert({
      state,
      brand_id: brandId,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
  }

  const params = new URLSearchParams({
    application_id: applicationId,
    state: supabase ? state : `${state}:${brandId}`,
    redirect_uri: redirectUri,
  });

  if (process.env.AMAZON_DRAFT_APP === 'true') {
    params.set('version', 'beta');
  }

  const url = `${AMAZON_UK.consentUrl}?${params.toString()}`;

  return res.status(200).json({ url, marketplace: 'UK' });
}
