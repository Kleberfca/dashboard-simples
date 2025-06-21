// src/app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CampaignWithMetrics, ProcessedCampaign, CampaignMetric } from '@/types/campaign'

// GET - Listar campanhas
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get filters from query params
    const searchParams = req.nextUrl.searchParams
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query
    let query = supabase
      .from('campaigns')
      .select(`
        *,
        daily_metrics!campaign_id (
          date,
          impressions,
          clicks,
          cost,
          leads,
          revenue
        )
      `)
      .eq('company_id', userData.company_id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (platform && platform !== 'all') {
      query = query.eq('platform', platform)
    }
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: campaigns, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Process campaigns with aggregated metrics
    const processedCampaigns: ProcessedCampaign[] = campaigns.map((campaign: CampaignWithMetrics) => {
      const metrics = campaign.daily_metrics || []
      
      // Filter metrics by date range if provided
      const filteredMetrics = metrics.filter((m: CampaignMetric) => {
        const metricDate = new Date(m.date)
        if (startDate && metricDate < new Date(startDate)) return false
        if (endDate && metricDate > new Date(endDate)) return false
        return true
      })

      // Aggregate metrics
      const totals = filteredMetrics.reduce((acc, m) => ({
        impressions: acc.impressions + (m.impressions || 0),
        clicks: acc.clicks + (m.clicks || 0),
        cost: acc.cost + (m.cost || 0),
        leads: acc.leads + (m.leads || 0),
        revenue: acc.revenue + (m.revenue || 0)
      }), { impressions: 0, clicks: 0, cost: 0, leads: 0, revenue: 0 })

      // Calculate derived metrics
      const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions * 100) : 0
      const cpl = totals.leads > 0 ? (totals.cost / totals.leads) : 0
      const roas = totals.cost > 0 ? (totals.revenue / totals.cost) : 0

      // Remove daily_metrics from response
      const { daily_metrics, ...campaignData } = campaign

      return {
        ...campaignData,
        // Add aggregated metrics
        impressions: totals.impressions,
        clicks: totals.clicks,
        spent: totals.cost,
        leads: totals.leads,
        revenue: totals.revenue,
        ctr: parseFloat(ctr.toFixed(2)),
        cpl: parseFloat(cpl.toFixed(2)),
        roas: parseFloat(roas.toFixed(1))
      }
    })

    return NextResponse.json({ campaigns: processedCampaigns })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Criar campanha
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    // Validate required fields
    const { name, platform, budget, startDate, endDate } = body
    if (!name || !platform || !budget) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current user and company
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Create campaign
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        company_id: userData.company_id,
        name,
        platform,
        status: 'active',
        metadata: {
          budget,
          startDate,
          endDate,
          ...body.metadata
        }
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Atualizar campanha
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify campaign ownership
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    const { data: existingCampaign } = await supabase
      .from('campaigns')
      .select('company_id')
      .eq('id', id)
      .single()

    if (existingCampaign?.company_id !== userData?.company_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update campaign
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Excluir campanha
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify campaign ownership
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    const { data: existingCampaign } = await supabase
      .from('campaigns')
      .select('company_id')
      .eq('id', id)
      .single()

    if (existingCampaign?.company_id !== userData?.company_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete campaign (metrics will be cascade deleted)
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}