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
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Update sync log and integration status with error
      await this.completeSyncLog(syncLogId, 'failed', 0, errorMessage);
      await this.updateIntegrationStatus(integration.id, 'failed', errorMessage);
      
      console.error(`Sync failed for integration ${integration.id}:`, error);
    }
  }

  /**
   * Create a new sync log entry
   */
  private async createSyncLog(integrationConfigId: string): Promise<string> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('sync_logs')
      .insert({
        integration_config_id: integrationConfigId,
        status: 'started',
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Complete a sync log entry
   */
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
        completed_at: new Date().toISOString(),
        status,
        records_processed: recordsProcessed,
        error_message: errorMessage,
      })
      .eq('id', syncLogId);
  }

  /**
   * Update integration status
   */
  private async updateIntegrationStatus(
    integrationId: string,
    status: 'success' | 'failed' | 'in_progress',
    error?: string
  ): Promise<void> {
    const supabase = await createClient();
    
    const updates: any = {
      last_sync_status: status,
      last_sync_at: new Date().toISOString(),
    };

    if (error) {
      updates.last_sync_error = error;
    } else if (status === 'success') {
      updates.last_sync_error = null;
    }

    await supabase
      .from('integration_configs')
      .update(updates)
      .eq('id', integrationId);
  }

  /**
   * Process and save metrics data
   */
  async saveMetrics(
    companyId: string,
    campaignId: string,
    creativeId: string | null,
    date: string,
    metrics: Partial<DailyMetrics>
  ): Promise<void> {
    const supabase = await createClient();
    
    // Calculate derived metrics
    const calculatedMetrics = this.calculateMetrics(metrics);

    // Upsert metrics data
    const { error } = await supabase
      .from('daily_metrics')
      .upsert({
        company_id: companyId,
        campaign_id: campaignId,
        creative_id: creativeId,
        date,
        ...metrics,
        ...calculatedMetrics,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'company_id,campaign_id,creative_id,date',
      });

    if (error) {
      console.error('Error saving metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate derived metrics
   */
  private calculateMetrics(metrics: Partial<DailyMetrics>): Partial<DailyMetrics> {
    const calculated: Partial<DailyMetrics> = {};

    if (metrics.impressions && metrics.clicks) {
      calculated.ctr = (metrics.clicks / metrics.impressions) * 100;
    }

    if (metrics.impressions && metrics.cost) {
      calculated.cpm = (metrics.cost / metrics.impressions) * 1000;
    }

    if (metrics.clicks && metrics.cost) {
      calculated.cpc = metrics.cost / metrics.clicks;
    }

    if (metrics.leads && metrics.cost) {
      calculated.cpl = metrics.cost / metrics.leads;
    }

    if (metrics.revenue && metrics.cost && metrics.cost > 0) {
      calculated.roas = metrics.revenue / metrics.cost;
    }

    return calculated;
  }
}

// Singleton instance
let syncServiceInstance: SyncService | null = null;

export function getSyncService(): SyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new SyncService();
  }
  return syncServiceInstance;
}