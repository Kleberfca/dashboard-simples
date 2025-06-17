import type { IntegrationConfig, IntegrationCredentials } from '@/types';

/**
 * Test TikTok connection
 */
export async function testTikTokConnection(credentials: IntegrationCredentials): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate required fields
    if (!credentials.tiktok_access_token || !credentials.tiktok_advertiser_id) {
      return {
        success: false,
        error: 'Missing required credentials'
      };
    }

    // In production: Call TikTok Marketing API
    // Example: GET /advertiser/info/

    // Mock validation for MVP
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed'
    };
  }
}

/**
 * Sync TikTok data
 */
export async function syncTikTokData(
  config: IntegrationConfig,
  credentials: IntegrationCredentials
): Promise<{ success: boolean; recordsProcessed: number; error?: string }> {
  try {
    const mockCampaigns = generateMockTikTokCampaigns(config.company_id);
    const recordsProcessed = mockCampaigns.length * 7;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      recordsProcessed
    };
  } catch (error) {
    return {
      success: false,
      recordsProcessed: 0,
      error: error instanceof Error ? error.message : 'Sync failed'
    };
  }
}

/**
 * Generate mock TikTok campaign data
 */
function generateMockTikTokCampaigns(companyId: string) {
  return [
    {
      id: 'tiktok_campaign_1',
      name: 'Traffic - Young Adults 18-24',
      objective: 'TRAFFIC',
      status: 'ENABLE',
      metrics: {
        impressions: 450000,
        clicks: 5400,
        cost: 1800.00,
        conversions: 72,
        revenue: 8640.00
      }
    },
    {
      id: 'tiktok_campaign_2',
      name: 'App Install - Gaming Audience',
      objective: 'APP_INSTALL',
      status: 'ENABLE',
      metrics: {
        impressions: 320000,
        clicks: 8900,
        cost: 2200.00,
        conversions: 156,
        revenue: 4680.00
      }
    }
  ];
}