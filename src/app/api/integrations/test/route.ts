// src/app/api/integrations/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { testGoogleAdsConnection } from '@/lib/integrations/google-ads';
import { testFacebookConnection } from '@/lib/integrations/facebook';
import { testTikTokConnection } from '@/lib/integrations/tiktok';
import { testAnalyticsConnection } from '@/lib/integrations/analytics';
import type { PlatformType, IntegrationCredentials } from '@/types';

// Mapeamento de plataformas para funções de teste com validação real
const testFunctions: Record<PlatformType, (credentials: IntegrationCredentials) => Promise<{ success: boolean; error?: string }>> = {
  google_ads: testGoogleAdsConnection,
  facebook_ads: testFacebookConnection,
  instagram_ads: testFacebookConnection, // Usa a mesma API do Facebook
  tiktok_ads: testTikTokConnection,
  analytics: testAnalyticsConnection,
};

export async function POST(req: NextRequest) {
  try {
    const { platform, credentials } = await req.json();

    // Validar plataforma
    if (!platform || !testFunctions[platform as PlatformType]) {
      return NextResponse.json(
        { success: false, error: 'Plataforma inválida' },
        { status: 400 }
      );
    }

    // Validar credenciais
    if (!credentials || typeof credentials !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 400 }
      );
    }

    // Testar a conexão com validação real
    const testFunction = testFunctions[platform as PlatformType];
    const result = await testFunction(credentials);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}