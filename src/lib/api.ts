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
  amazon: { configured: boolean; marketplace: string };
}> {
  try {
    const res = await fetch('/api/integrations/status');
    if (!res.ok) throw new Error('status check failed');
    return await res.json();
  } catch {
    return { amazon: { configured: false, marketplace: 'UK' } };
  }
}
