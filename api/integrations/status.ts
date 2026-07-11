import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const configured = Boolean(
    process.env.AMAZON_APPLICATION_ID &&
      process.env.AMAZON_LWA_CLIENT_ID &&
      process.env.AMAZON_LWA_CLIENT_SECRET
  );

  return res.status(200).json({
    amazon: {
      configured,
      marketplace: 'UK',
      oauth: 'link-based',
      sellerCentral: 'https://sellercentral.amazon.co.uk',
    },
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
}
