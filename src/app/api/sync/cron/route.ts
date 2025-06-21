// src/app/api/sync/cron/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSyncService } from '@/lib/integrations/sync-service'
import { headers } from 'next/headers'

export const maxDuration = 60 // 60 seconds max for Vercel

export async function GET(req: NextRequest) {
  try {
    // Verificar cron secret para segurança
    const headersList = headers()
    const cronSecret = (await headersList).get('x-cron-secret')
    
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Buscar todas as empresas ativas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)

    if (companiesError || !companies) {
      console.error('Error fetching companies:', companiesError)
      return NextResponse.json({ 
        error: 'Failed to fetch companies',
        details: companiesError?.message 
      }, { status: 500 })
    }

    console.log(`Starting sync for ${companies.length} companies`)

    const syncService = getSyncService()
    const results = []

    // Processar empresas em paralelo (mas limitado para não sobrecarregar)
    const batchSize = 5
    for (let i = 0; i < companies.length; i += batchSize) {
      const batch = companies.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (company) => {
        try {
          console.log(`Syncing company: ${company.name} (${company.id})`)
          
          // Sincronizar integrações da empresa
          await syncService.syncCompanyIntegrations(company.id)
          
          // Registrar sucesso
          await supabase
            .from('sync_logs')
            .insert({
              company_id: company.id,
              sync_type: 'cron',
              status: 'completed',
              started_at: new Date().toISOString(),
              completed_at: new Date().toISOString()
            })

          return {
            companyId: company.id,
            companyName: company.name,
            status: 'success'
          }
        } catch (error) {
          console.error(`Error syncing company ${company.id}:`, error)
          
          // Registrar erro
          await supabase
            .from('sync_logs')
            .insert({
              company_id: company.id,
              sync_type: 'cron',
              status: 'failed',
              started_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
              error_message: error instanceof Error ? error.message : 'Unknown error'
            })

          return {
            companyId: company.id,
            companyName: company.name,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })

      const batchResults = await Promise.allSettled(batchPromises)
      results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : r.reason))
    }

    // Resumo dos resultados
    const summary = {
      total: companies.length,
      success: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      timestamp: new Date().toISOString(),
      results
    }

    console.log('Sync completed:', summary)

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Cron sync error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST para teste manual (desenvolvimento)
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
  }

  // Simular requisição do cron job
  const testReq = new NextRequest(req.url, {
    headers: {
      'x-cron-secret': process.env.CRON_SECRET || ''
    }
  })

  return GET(testReq)
}