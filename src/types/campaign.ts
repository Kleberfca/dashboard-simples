// src/types/campaign.ts

export interface CampaignMetric {
  date: string
  impressions: number
  clicks: number
  cost: number
  leads: number
  revenue: number
}

export interface CampaignWithMetrics {
  id: string
  company_id: string
  name: string
  platform: string
  status: string
  metadata?: {
    budget?: number
    startDate?: string
    endDate?: string
  }
  daily_metrics?: CampaignMetric[]
  created_at: string
  updated_at: string
}

export interface ProcessedCampaign {
  id: string
  company_id: string
  name: string
  platform: string
  status: string
  metadata?: {
    budget?: number
    startDate?: string
    endDate?: string
  }
  impressions: number
  clicks: number
  spent: number
  leads: number
  revenue: number
  ctr: number
  cpl: number
  roas: number
  created_at: string
  updated_at: string
}

export interface ReportTotals {
  impressions: number
  clicks: number
  cost: number
  leads: number
  revenue: number
  deals_closed?: number
}

export interface ReportKPIs {
  ctr: number
  cpc: number
  cpl: number
  roas: number
  conversionRate?: number
}

export interface SummaryReport {
  type: 'summary'
  totals: ReportTotals
  kpis: ReportKPIs
  byPlatform: Record<string, ReportTotals>
  daysAnalyzed: number
}

export interface DetailedReport {
  type: 'detailed'
  campaigns: Array<{
    campaign: any
    metrics: ReportTotals
    dailyData: CampaignMetric[]
    kpis: Record<string, string>
  }>
}

export interface ComparisonReport {
  type: 'comparison'
  periods: {
    first: {
      start: string
      end: string
      metrics: ReportTotals
    }
    second: {
      start: string
      end: string
      metrics: ReportTotals
    }
  }
  changes: Record<string, string>
  dailyTrends: Array<{ date: string } & ReportTotals>
}

export type Report = SummaryReport | DetailedReport | ComparisonReport