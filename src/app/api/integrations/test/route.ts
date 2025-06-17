import { NextRequest, NextResponse } from 'next/server';
import { testGoogleAdsConnection } from '@/lib/integrations/google-ads';
import { testFacebookConnection } from '@/lib/integrations/facebook';
import { testTikTokConnection } from '@/lib/integrations/tiktok';
import { testAnalyticsConnection } from '@/lib/integrations/analytics';
import type { PlatformType, IntegrationCredentials } from '@/types';

// Map of platform types to test functions
const testFunctions: Record<PlatformType, (credentials: IntegrationCredentials) => Promise<{ success: boolean; error?: string }>> = {
  google_ads: testGoogleAdsConnection,
  facebook_ads: testFacebookConnection,
  instagram_ads: testFacebookConnection, // Same API as Facebook
  tiktok_ads: testTikTokConnection,
  analytics: testAnalyticsConnection,
};

export async function POST(req: NextRequest) {
  try {
    const { platform, credentials } = await req.json();

    // Validate platform
    if (!platform || !testFunctions[platform as PlatformType]) {
      return NextResponse.json(
        { success: false, error: 'Invalid platform' },
        { status: 400 }
      );
    }

    // Validate credentials
    if (!credentials || typeof credentials !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Test the connection
    const testFunction = testFunctions[platform as PlatformType];
    const result = await testFunction(credentials);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}