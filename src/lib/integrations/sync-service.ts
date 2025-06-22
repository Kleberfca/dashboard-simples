import { createClient } from '@/lib/supabase/server';
import { decrypt, decryptObject } from '@/lib/crypto/encryption';
import type { IntegrationConfig, PlatformType, DailyMetrics } from '@/types';

// Import platform-specific sync functions
import { syncGoogleAdsData } from './google-ads';
import { syncFacebookData } from './facebook';
import { syncTikTokData } from './tiktok';
import { syncAnalyticsData } from './analytics';

interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  error?: string;
}

// Map of platform types to sync functions
const syncFunctions: Record<PlatformType, (config: IntegrationConfig, credentials: any) => Promise<SyncResult>> = {
  google_ads: syncGoogleAdsData,
  facebook_ads: syncFacebookData,
  instagram_ads: syncFacebookData, // Same API as Facebook
  tiktok_ads: syncTikTokData,
  analytics: syncAnalyticsData,
};

export class SyncService {
  /**
   * Sync all active integrations for a company
   */
  async syncCompanyIntegrations(companyId: string): Promise<void> {
    const supabase = await createClient();
    
    const { data: integrations, error } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching integrations:', error);
      return;
    }

    if (!integrations || integrations.length === 0) {
      console.log(`No active integrations found for company ${companyId}`);
      return;
    }

    // Process integrations in parallel
    const syncPromises = integrations.map(integration => 
      this.syncIntegration(integration)
    );

    await Promise.allSettled(syncPromises);
  }

  /**
   * Sync a single integration
   */
  async syncIntegration(integration: IntegrationConfig & { credentials_encrypted: string }): Promise<void> {
    const syncLogId = await this.createSyncLog(integration.id);

    try {
      // Update integration status
      await this.updateIntegrationStatus(integration.id, 'in_progress');

      // Decrypt credentials
      const credentials = decryptObject(integration.credentials_encrypted);

      // Get sync function for platform
      const syncFunction = syncFunctions[integration.platform];
      if (!syncFunction) {
        throw new Error(`No sync function for platform: ${integration.platform}`);
      }

      // Execute sync
      const result = await syncFunction(integration, credentials);

      if (result.success) {
        // Update sync log and integration status
        await this.completeSyncLog(syncLogId, 'completed', result.recordsProcessed);
        await this.updateIntegrationStatus(integration.id, 'success');
        
        // Trigger real-time metric calculation
        await this.calculateRealTimeMetrics(integration.company_id);
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Sync error for integration ${integration.id}:`, errorMessage);
      
      // Update sync log and integration status
      await this.completeSyncLog(syncLogId, 'failed', 0, errorMessage);
      await this.updateIntegrationStatus(integration.id, 'failed', errorMessage);
    }
  }

  /**
   * Calculate real-time metrics after sync
   */
  private async calculateRealTimeMetrics(companyId: string): Promise<void> {
    const supabase = await createClient();
    
    // Get last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: metrics, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('company_id', companyId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error || !metrics) {
      console.error('Error fetching metrics for calculation:', error);
      return;
    }

    // Calculate aggregated metrics
    const totalMetrics = metrics.reduce((acc, metric) => ({
      impressions: acc.impressions + (metric.impressions || 0),
      clicks: acc.clicks + (metric.clicks || 0),
      cost: acc.cost + (metric.cost || 0),
      leads: acc.leads + (metric.leads || 0),
      revenue: acc.revenue + (metric.revenue || 0)
    }), {
      impressions: 0,
      clicks: 0,
      cost: 0,
      leads: 0,
      revenue: 0
    });

    // Calculate KPIs
    const kpis = {
      ctr: totalMetrics.impressions > 0 ? (totalMetrics.clicks / totalMetrics.impressions * 100) : 0,
      cpc: totalMetrics.clicks > 0 ? (totalMetrics.cost / totalMetrics.clicks) : 0,
      cpl: totalMetrics.leads > 0 ? (totalMetrics.cost / totalMetrics.leads) : 0,
      roas: totalMetrics.cost > 0 ? (totalMetrics.revenue / totalMetrics.cost) : 0
    };

    // Store calculated metrics for quick access
    await supabase
      .from('company_metrics_cache')
      .upsert({
        company_id: companyId,
        period: '30d',
        metrics: totalMetrics,
        kpis: kpis,
        updated_at: new Date().toISOString()
      });
  }

  // Helper methods remain the same...
  private async createSyncLog(integrationId: string): Promise<string> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('sync_logs')
      .insert({
        integration_config_id: integrationId,
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error || !data) {
      throw new Error('Failed to create sync log');
    }

    return data.id;
  }

  private async completeSyncLog(
    syncLogId: string, 
    status: 'completed' | 'failed', 
    recordsProcessed: number,
    errorMessage?: string
  ): Promise<void> {
    const supabase = await createClient();
    
    await supabase
      .from('sync_logs')
      .update({
        status,
        completed_at: new Date().toISOString(),
        records_processed: recordsProcessed,
        error_message: errorMessage
      })
      .eq('id', syncLogId);
  }

  private async updateIntegrationStatus(
    integrationId: string,
    status: 'success' | 'failed' | 'in_progress',
    error?: string
  ): Promise<void> {
    const supabase = await createClient();
    
    await supabase
      .from('integration_configs')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: status,
        last_sync_error: error || null
      })
      .eq('id', integrationId);
  }
}

// Export singleton instance
let syncServiceInstance: SyncService | null = null;

export function getSyncService(): SyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new SyncService();
  }
  return syncServiceInstance;
}