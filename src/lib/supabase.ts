import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export type DbBrand = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  client_size: 'enterprise' | 'mid-market' | 'small-business';
  color: string;
  created_at: string;
};

export type DbConnectedAccount = {
  id: string;
  brand_id: string;
  platform: 'amazon' | 'tiktok' | 'ebay' | 'etsy';
  marketplace: string;
  seller_id: string | null;
  name: string;
  handle: string;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  last_sync: string | null;
};
