export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          company_id: string | null
          email: string
          name: string | null
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          email: string
          name?: string | null
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          email?: string
          name?: string | null
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      integration_configs: {
        Row: {
          id: string
          company_id: string
          platform: string
          name: string
          credentials_encrypted: string | null
          oauth_tokens: Json | null
          config: Json
          is_active: boolean
          last_sync_at: string | null
          last_sync_status: string | null
          last_sync_error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          platform: string
          name: string
          credentials_encrypted?: string | null
          oauth_tokens?: Json | null
          config?: Json
          is_active?: boolean
          last_sync_at?: string | null
          last_sync_status?: string | null
          last_sync_error?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          platform?: string
          name?: string
          credentials_encrypted?: string | null
          oauth_tokens?: Json | null
          config?: Json
          is_active?: boolean
          last_sync_at?: string | null
          last_sync_status?: string | null
          last_sync_error?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          company_id: string
          integration_config_id: string | null
          external_id: string | null
          name: string | null
          status: string | null
          platform: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          integration_config_id?: string | null
          external_id?: string | null
          name?: string | null
          status?: string | null
          platform?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          integration_config_id?: string | null
          external_id?: string | null
          name?: string | null
          status?: string | null
          platform?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      daily_metrics: {
        Row: {
          id: string
          company_id: string
          campaign_id: string
          creative_id: string | null
          date: string
          impressions: number
          clicks: number
          cost: number
          leads: number
          leads_qualified: number
          leads_icp: number
          revenue: number
          deals_closed: number
          ctr: number | null
          cpm: number | null
          cpc: number | null
          cpl: number | null
          roas: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          campaign_id: string
          creative_id?: string | null
          date: string
          impressions?: number
          clicks?: number
          cost?: number
          leads?: number
          leads_qualified?: number
          leads_icp?: number
          revenue?: number
          deals_closed?: number
          ctr?: number | null
          cpm?: number | null
          cpc?: number | null
          cpl?: number | null
          roas?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          campaign_id?: string
          creative_id?: string | null
          date?: string
          impressions?: number
          clicks?: number
          cost?: number
          leads?: number
          leads_qualified?: number
          leads_icp?: number
          revenue?: number
          deals_closed?: number
          ctr?: number | null
          cpm?: number | null
          cpc?: number | null
          cpl?: number | null
          roas?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}