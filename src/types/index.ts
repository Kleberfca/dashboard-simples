// Company and User types
export interface Company {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  company_id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Integration types
export type PlatformType = 'google_ads' | 'facebook_ads' | 'instagram_ads' | 'tiktok_ads' | 'analytics';

export interface IntegrationConfig {
  id: string;
  company_id: string;
  platform: PlatformType;
  name: string;
  is_active: boolean;
  last_sync_at: string | null;
  last_sync_status: 'success' | 'failed' | 'in_progress' | null;
  last_sync_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationCredentials {
  // Google Ads
  client_id?: string;
  client_secret?: string;
  developer_token?: string;
  customer_id?: string;
  
  // Facebook/Instagram
  access_token?: string;
  app_id?: string;
  app_secret?: string;
  ad_account_id?: string;
  
  // TikTok
  tiktok_access_token?: string;
  tiktok_advertiser_id?: string;
  
  // Analytics
  property_id?: string;
  view_id?: string;
}

// Campaign and Creative types
export interface Campaign {
  id: string;
  company_id: string;
  integration_config_id: string;
  external_id: string;
  name: string;
  status: string;
  platform: PlatformType;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Creative {
  id: string;
  company_id: string;
  campaign_id: string;
  external_id: string;
  name: string;
  type: 'video' | 'image' | 'carousel' | 'text';
  url: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Metrics types
export interface DailyMetrics {
  id: string;
  company_id: string;
  campaign_id: string;
  creative_id: string | null;
  date: string;
  
  // Media metrics
  impressions: number;
  clicks: number;
  cost: number;
  
  // Conversion metrics
  leads: number;
  leads_qualified: number;
  leads_icp: number;
  
  // Sales metrics
  revenue: number;
  deals_closed: number;
  
  // Calculated metrics
  ctr: number;
  cpm: number;
  cpc: number;
  cpl: number;
  roas: number;
}

// Dashboard types
export interface KPIMetric {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  prefix?: string;
  suffix?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DashboardFilters {
  dateRange: DateRange;
  platforms?: PlatformType[];
  campaigns?: string[];
  creatives?: string[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}