export type Platform = 'tiktok' | 'amazon' | 'ebay' | 'etsy';

export interface AccountMetrics {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  views: number;
  viewsChange: number;
  engagement: number;
  engagementChange: number;
  followers: number;
  followersChange: number;
  conversionRate: number;
  conversionChange: number;
}

export interface HourlyDataPoint {
  hour: string;
  revenue: number;
  orders: number;
  views: number;
}

export interface ConnectedAccount {
  id: string;
  platform: Platform;
  name: string;
  handle: string;
  status: 'connected' | 'syncing' | 'error';
  lastSync: string;
  metrics: AccountMetrics;
  hourlyData: HourlyDataPoint[];
}

export interface ClientGroup {
  id: string;
  name: string;
  description: string;
  clientSize: 'enterprise' | 'mid-market' | 'small-business';
  accountCount: number;
  totalRevenue: number;
  revenueChange: number;
  accounts: ConnectedAccount[];
  color: string;
}

export interface MorningReport {
  generatedAt: string;
  period: string;
  totalRevenue: number;
  totalOrders: number;
  totalViews: number;
  avgEngagement: number;
  highlights: ReportHighlight[];
  alerts: ReportAlert[];
}

export interface ReportHighlight {
  id: string;
  type: 'positive' | 'neutral';
  message: string;
  groupName: string;
}

export interface ReportAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  accountName: string;
  platform: Platform;
}

export interface NewAccountForm {
  platform: Platform;
  name: string;
  handle: string;
  email: string;
  password: string;
}
