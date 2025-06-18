import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSyncService } from '@/lib/integrations/sync-service'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { integrationId, companyId } = await req.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company if not provided
    let validCompanyId = companyId
    if (!validCompanyId) {
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (!userData?.company_id) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
      }
      validCompanyId = userData.company_id
    }

    const syncService = getSyncService()

    if (integrationId) {
      // Sync specific integration
      const { data: integration, error } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('id', integrationId)
        .eq('company_id', validCompanyId)
        .single()

      if (error || !integration) {
        return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
      }

      // Start sync in background
      syncService.syncIntegration(integration).catch(console.error)
    } else {
      // Sync all integrations for company
      syncService.syncCompanyIntegrations(validCompanyId).catch(console.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Sync initiated successfully'
    })
  } catch (error) {
    console.error('Manual sync error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate sync' },
      { status: 500 }
    )
  }
}