import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { companyId, filters } = await req.json()

    // Validate input
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Parse date range
    const startDate = filters?.dateRange?.start || new Date(new Date().setDate(new Date().getDate() - 30))
    const endDate = filters?.dateRange?.end || new Date()

    // Get metrics for the period
    const { data: currentMetrics, error: currentError } = await supabase
      .from('daily_metrics')
      .select(`
        impressions,
        clicks,
        cost,
        leads,
        leads_qualified,
        leads_icp,
        revenue,
        deals_closed
      `)
      .eq('company_id', companyId)
      .gte('date', new Date(startDate).toISOString().split('T')[0])
      .lte('date', new Date(endDate).toISOString().split('T')[0])

    if (currentError) {
      return NextResponse.json({ error: currentError.message }, { status: 500 })
    }

    // Calculate previous period for comparison
    const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    const previousStart = new Date(startDate)
    previousStart.setDate(previousStart.getDate() - daysDiff)
    const previousEnd = new Date(startDate)
    previousEnd.setDate(previousEnd.getDate() - 1)

    const { data: previousMetrics, error: previousError } = await supabase
      .from('daily_metrics')
      .select(`
        impressions,
        clicks,
        cost,
        leads,
        revenue
      `)
      .eq('company_id', companyId)
      .gte('date', previousStart.toISOString().split('T')[0])
      .lte('date', previousEnd.toISOString().split('T')[0])

    if (previousError) {
      console.error('Error fetching previous metrics:', previousError)
    }

    // Aggregate metrics
    const current = aggregateMetrics(currentMetrics || [])
    const previous = aggregateMetrics(previousMetrics || [])

    // Calculate KPIs with comparisons
    const kpis = [
      {
        label: 'Investimento',
        value: formatCurrency(current.cost),
        change: calculateChange(current.cost, previous.cost),
        changeType: current.cost > previous.cost ? 'increase' : 'decrease'
      },
      {
        label: 'Leads',
        value: current.leads.toLocaleString('pt-BR'),
        change: calculateChange(current.leads, previous.leads),
        changeType: current.leads > previous.leads ? 'increase' : 'decrease'
      },
      {
        label: 'Custo por Lead',
        value: formatCurrency(current.leads > 0 ? current.cost / current.leads : 0),
        change: calculateChange(
          current.leads > 0 ? current.cost / current.leads : 0,
          previous.leads > 0 ? previous.cost / previous.leads : 0
        ),
        changeType: 'increase' // Higher CPL is typically worse
      },
      {
        label: 'Receita',
        value: formatCurrency(current.revenue),
        change: calculateChange(current.revenue, previous.revenue),
        changeType: current.revenue > previous.revenue ? 'increase' : 'decrease'
      },
      {
        label: 'CTR',
        value: `${current.impressions > 0 ? ((current.clicks / current.impressions) * 100).toFixed(2) : '0'}%`,
        change: calculateChange(
          current.impressions > 0 ? (current.clicks / current.impressions) * 100 : 0,
          previous.impressions > 0 ? (previous.clicks / previous.impressions) * 100 : 0
        ),
        changeType: 'increase'
      },
      {
        label: 'CPM',
        value: formatCurrency(current.impressions > 0 ? (current.cost / current.impressions) * 1000 : 0),
        change: calculateChange(
          current.impressions > 0 ? (current.cost / current.impressions) * 1000 : 0,
          previous.impressions > 0 ? (previous.cost / previous.impressions) * 1000 : 0
        ),
        changeType: 'decrease' // Lower CPM is better
      },
      {
        label: 'Cliques',
        value: current.clicks.toLocaleString('pt-BR'),
        change: calculateChange(current.clicks, previous.clicks),
        changeType: current.clicks > previous.clicks ? 'increase' : 'decrease'
      },
      {
        label: 'ROAS',
        value: current.cost > 0 ? (current.revenue / current.cost).toFixed(1) : '0',
        change: calculateChange(
          current.cost > 0 ? current.revenue / current.cost : 0,
          previous.cost > 0 ? previous.revenue / previous.cost : 0
        ),
        changeType: 'increase'
      }
    ]

    // Get daily metrics for charts
    const { data: dailyData, error: dailyError } = await supabase
      .from('daily_metrics')
      .select('date, clicks, cost, leads')
      .eq('company_id', companyId)
      .gte('date', new Date(startDate).toISOString().split('T')[0])
      .lte('date', new Date(endDate).toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (dailyError) {
      console.error('Error fetching daily metrics:', dailyError)
    }

    // Format chart data
    const chartData = (dailyData || []).map(day => ({
      date: new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      cpc: day.clicks > 0 ? day.cost / day.clicks : 0,
      leads: day.leads
    }))

    return NextResponse.json({
      kpis,
      chartData,
      period: {
        start: startDate,
        end: endDate
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function aggregateMetrics(metrics: any[]) {
  return metrics.reduce((acc, metric) => ({
    impressions: acc.impressions + (metric.impressions || 0),
    clicks: acc.clicks + (metric.clicks || 0),
    cost: acc.cost + (metric.cost || 0),
    leads: acc.leads + (metric.leads || 0),
    leads_qualified: acc.leads_qualified + (metric.leads_qualified || 0),
    leads_icp: acc.leads_icp + (metric.leads_icp || 0),
    revenue: acc.revenue + (metric.revenue || 0),
    deals_closed: acc.deals_closed + (metric.deals_closed || 0)
  }), {
    impressions: 0,
    clicks: 0,
    cost: 0,
    leads: 0,
    leads_qualified: 0,
    leads_icp: 0,
    revenue: 0,
    deals_closed: 0
  })
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}