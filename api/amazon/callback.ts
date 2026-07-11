import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAppUrl, getSupabaseAdmin } from '../lib/config';

async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const clientId = process.env.AMAZON_LWA_CLIENT_ID!;
  const clientSecret = process.env.AMAZON_LWA_CLIENT_SECRET!;

  const response = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  return response.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const appUrl = getAppUrl(req);
  const redirectUri = process.env.AMAZON_REDIRECT_URI || `${appUrl}/api/amazon/callback`;

  const error = req.query.error as string | undefined;
  if (error) {
    return res.redirect(`${appUrl}/?connect=error&message=${encodeURIComponent(error)}`);
  }

  const code = req.query.spapi_oauth_code as string | undefined;
  const state = req.query.state as string | undefined;
  const sellingPartnerId = req.query.selling_partner_id as string | undefined;

  if (!code || !state) {
    return res.redirect(`${appUrl}/?connect=error&message=missing_code_or_state`);
  }

  let brandId: string | null = null;
  const supabase = getSupabaseAdmin();

  try {
    if (supabase) {
      const { data: stateRow } = await supabase
        .from('oauth_states')
        .select('brand_id, expires_at')
        .eq('state', state)
        .single();

      if (!stateRow || new Date(stateRow.expires_at) < new Date()) {
        return res.redirect(`${appUrl}/?connect=error&message=invalid_or_expired_state`);
      }

      brandId = stateRow.brand_id;
      await supabase.from('oauth_states').delete().eq('state', state);
    } else {
      const parts = state.includes(':') ? state.split(':') : [state, null];
      brandId = parts[1] || (req.query.brandId as string) || null;
    }

    if (!brandId) {
      return res.redirect(`${appUrl}/?connect=error&message=missing_brand`);
    }

    const tokens = await exchangeCodeForTokens(code, redirectUri);

    if (supabase) {
      const accountName = sellingPartnerId
        ? `Amazon UK (${sellingPartnerId})`
        : 'Amazon UK';

      const { data: account, error: accountError } = await supabase
        .from('connected_accounts')
        .upsert(
          {
            brand_id: brandId,
            platform: 'amazon',
            marketplace: 'UK',
            seller_id: sellingPartnerId || null,
            name: accountName,
            handle: sellingPartnerId || 'amazon-uk',
            status: 'connected',
            last_sync: new Date().toISOString(),
          },
          { onConflict: 'brand_id,platform,marketplace' }
        )
        .select('id')
        .single();

      if (accountError || !account) {
        throw new Error(accountError?.message || 'Failed to save account');
      }

      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

      await supabase.from('oauth_tokens').upsert(
        {
          account_id: account.id,
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
          expires_at: expiresAt,
        },
        { onConflict: 'account_id' }
      );
    }

    return res.redirect(
      `${appUrl}/?connect=success&platform=amazon&brandId=${brandId}&seller=${sellingPartnerId || ''}`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'connection_failed';
    return res.redirect(`${appUrl}/?connect=error&message=${encodeURIComponent(message)}`);
  }
}
