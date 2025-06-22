// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'
import type { 
  ReportTotals, 
  ReportKPIs, 
  SummaryReport, 
  DetailedReport, 
  ComparisonReport 
} from '@/types/campaign'

// GET - Gerar relatório
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
      .select('company_id, company:companies(*)')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get report parameters
    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get('type') || 'summary'
    const format = searchParams.get('format') || 'json'
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = searchParams.get('endDate') || new Date().toISOString()
    const platforms = searchParams.get('platforms')?.split(',') || []
    const campaigns = searchParams.get('campaigns')?.split(',') || []

    // Build metrics query
    let metricsQuery = supabase
      .from('daily_metrics')
      .select(`
        *,
        campaign:campaigns(*)
      `)
      .eq('company_id', userData.company_id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    // Apply filters
    if (campaigns.length > 0) {
      metricsQuery = metricsQuery.in('campaign_id', campaigns)
    }

    const { data: metrics, error: metricsError } = await metricsQuery

    if (metricsError) {
      return NextResponse.json({ error: metricsError.message }, { status: 500 })
    }

    // Filter by platforms if specified
    let filteredMetrics = metrics
    if (platforms.length > 0) {
      filteredMetrics = metrics.filter(m => 
        m.campaign && platforms.includes(m.campaign.platform)
      )
    }

    // Generate report based on type
    let report: any = {
      company: userData.company,
      period: { start: startDate, end: endDate },
      generatedAt: new Date().toISOString()
    }

    let reportData: Record<string, any> = {}
    switch (type) {
      case 'summary':
        reportData = generateSummaryReport(filteredMetrics)
        break
      case 'detailed':
        reportData = generateDetailedReport(filteredMetrics)
        break
      case 'comparison':
        reportData = generateComparisonReport(filteredMetrics)
        break
    }
    
    report = { ...report, ...reportData }

    // Format response based on requested format
    if (format === 'csv') {
      const csv = convertToCSV(report)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="report-${type}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'excel') {
      const excel = convertToExcel(report)
      return new NextResponse(excel, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="report-${type}-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Função para converter para Excel
function convertToExcel(report: any): Buffer {
  const wb = XLSX.utils.book_new()
  
  // Criar planilha de resumo
  const summaryData = [
    ['Dashboard Tryum - Relatório de Marketing'],
    [],
    ['Empresa:', report.company.name],
    ['Período:', `${new Date(report.period.start).toLocaleDateString('pt-BR')} - ${new Date(report.period.end).toLocaleDateString('pt-BR')}`],
    ['Gerado em:', new Date(report.generatedAt).toLocaleString('pt-BR')],
    []
  ]

  if (report.type === 'summary' && report.totals) {
    summaryData.push(
      ['RESUMO EXECUTIVO'],
      ['Métrica', 'Valor'],
      ['Impressões', report.totals.impressions],
      ['Cliques', report.totals.clicks],
      ['Investimento Total', report.totals.cost],
      ['Leads', report.totals.leads],
      ['Receita', report.totals.revenue],
      [],
      ['KPIs'],
      ['CTR', `${report.kpis.ctr}%`],
      ['CPC', `R$ ${report.kpis.cpc}`],
      ['CPL', `R$ ${report.kpis.cpl}`],
      ['ROAS', `${report.kpis.roas}x`]
    )
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumo')

  // Criar planilha de dados detalhados se houver
  if (report.type === 'detailed' && report.campaigns) {
    const detailData = report.campaigns.map((c: any) => ({
      'Campanha': c.campaign.name,
      'Plataforma': c.campaign.platform,
      'Impressões': c.metrics.impressions,
      'Cliques': c.metrics.clicks,
      'Custo': c.metrics.cost,
      'Leads': c.metrics.leads,
      'Receita': c.metrics.revenue,
      'CTR': c.kpis.ctr,
      'CPC': c.kpis.cpc,
      'CPL': c.kpis.cpl,
      'ROAS': c.kpis.roas
    }))
    
    const detailSheet = XLSX.utils.json_to_sheet(detailData)
    XLSX.utils.book_append_sheet(wb, detailSheet, 'Campanhas')
  }

  // Converter para buffer
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })
  return excelBuffer
}

// Helper functions
function generateSummaryReport(metrics: any[]): Record<string, any> {
  const totals = metrics.reduce<ReportTotals>((acc, m) => ({
    impressions: acc.impressions + (m.impressions || 0),
    clicks: acc.clicks + (m.clicks || 0),
    cost: acc.cost + (m.cost || 0),
    leads: acc.leads + (m.leads || 0),
    revenue: acc.revenue + (m.revenue || 0),
    deals_closed: acc.deals_closed + (m.deals_closed || 0)
  }), { impressions: 0, clicks: 0, cost: 0, leads: 0, revenue: 0, deals_closed: 0 })

  // Group by platform
  const byPlatform = metrics.reduce<Record<string, ReportTotals>>((acc, m) => {
    if (!m.campaign) return acc
    
    const platform = m.campaign.platform
    if (!acc[platform]) {
      acc[platform] = { impressions: 0, clicks: 0, cost: 0, leads: 0, revenue: 0 }
    }
    
    acc[platform].impressions += m.impressions || 0
    acc[platform].clicks += m.clicks || 0
    acc[platform].cost += m.cost || 0
    acc[platform].leads += m.leads || 0
    acc[platform].revenue += m.revenue || 0
    
    return acc
  }, {} as Record<string, ReportTotals>)

  // Calculate KPIs
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions * 100) : 0
  const cpc = totals.clicks > 0 ? (totals.cost / totals.clicks) : 0
  const cpl = totals.leads > 0 ? (totals.cost / totals.leads) : 0
  const roas = totals.cost > 0 ? (totals.revenue / totals.cost) : 0
  const conversionRate = totals.clicks > 0 ? (totals.leads / totals.clicks * 100) : 0

  return {
    type: 'summary',
    totals,
    kpis: {
      ctr: parseFloat(ctr.toFixed(2)),
      cpc: parseFloat(cpc.toFixed(2)),
      cpl: parseFloat(cpl.toFixed(2)),
      roas: parseFloat(roas.toFixed(2)),
      conversionRate: parseFloat(conversionRate.toFixed(2))
    },
    byPlatform,
    daysAnalyzed: new Set(metrics.map(m => m.date)).size
  }
}

function generateDetailedReport(metrics: any[]): Record<string, any> {
  // Group by campaign
  const byCampaign = metrics.reduce<Record<string, any>>((acc, m) => {
    if (!m.campaign) return acc
    
    const campaignId = m.campaign_id
    if (!acc[campaignId]) {
      acc[campaignId] = {
        campaign: m.campaign,
        metrics: { impressions: 0, clicks: 0, cost: 0, leads: 0, revenue: 0 },
        dailyData: []
      }
    }
    
    acc[campaignId].metrics.impressions += m.impressions || 0
    acc[campaignId].metrics.clicks += m.clicks || 0
    acc[campaignId].metrics.cost += m.cost || 0
    acc[campaignId].metrics.leads += m.leads || 0
    acc[campaignId].metrics.revenue += m.revenue || 0
    
    acc[campaignId].dailyData.push({
      date: m.date,
      impressions: m.impressions,
      clicks: m.clicks,
      cost: m.cost,
      leads: m.leads,
      ctr: m.ctr,
      cpl: m.cpl
    })
    
    return acc
  }, {} as Record<string, any>)

  return {
    type: 'detailed',
    campaigns: Object.values(byCampaign).map((c: any) => ({
      ...c,
      kpis: {
        ctr: c.metrics.impressions > 0 ? (c.metrics.clicks / c.metrics.impressions * 100).toFixed(2) : '0',
        cpc: c.metrics.clicks > 0 ? (c.metrics.cost / c.metrics.clicks).toFixed(2) : '0',
        cpl: c.metrics.leads > 0 ? (c.metrics.cost / c.metrics.leads).toFixed(2) : '0',
        roas: c.metrics.cost > 0 ? (c.metrics.revenue / c.metrics.cost).toFixed(1) : '0'
      }
    }))
  }
}

function generateComparisonReport(metrics: any[]): Record<string, any> {
  // Group by date for trend analysis
  const byDate = metrics.reduce<Record<string, ReportTotals>>((acc, m) => {
    const date = m.date
    if (!acc[date]) {
      acc[date] = { impressions: 0, clicks: 0, cost: 0, leads: 0, revenue: 0 }
    }
    
    acc[date].impressions += m.impressions || 0
    acc[date].clicks += m.clicks || 0
    acc[date].cost += m.cost || 0
    acc[date].leads += m.leads || 0
    acc[date].revenue += m.revenue || 0
    
    return acc
  }, {} as Record<string, any>)

  // Calculate period comparisons
  const dates = Object.keys(byDate).sort()
  const midPoint = Math.floor(dates.length / 2)
  const firstHalf = dates.slice(0, midPoint)
  const secondHalf = dates.slice(midPoint)

  const firstHalfMetrics = calculatePeriodMetrics(firstHalf, byDate)
  const secondHalfMetrics = calculatePeriodMetrics(secondHalf, byDate)

  return {
    type: 'comparison',
    periods: {
      first: {
        start: firstHalf[0],
        end: firstHalf[firstHalf.length - 1],
        metrics: firstHalfMetrics
      },
      second: {
        start: secondHalf[0],
        end: secondHalf[secondHalf.length - 1],
        metrics: secondHalfMetrics
      }
    },
    changes: calculateChanges(firstHalfMetrics, secondHalfMetrics),
    dailyTrends: Object.entries(byDate).map(([date, metrics]) => ({
      date,
      ...metrics
    }))
  }
}

function calculatePeriodMetrics(dates: string[], byDate: Record<string, ReportTotals>): ReportTotals {
  return dates.reduce<ReportTotals>((acc, date) => {
    const dayMetrics = byDate[date]
    return {
      impressions: acc.impressions + dayMetrics.impressions,
      clicks: acc.clicks + dayMetrics.clicks,
      cost: acc.cost + dayMetrics.cost,
      leads: acc.leads + dayMetrics.leads,
      revenue: acc.revenue + dayMetrics.revenue
    }
  }, { impressions: 0, clicks: 0, cost: 0, leads: 0, revenue: 0 })
}

function calculateChanges(first: ReportTotals, second: ReportTotals): Record<string, string> {
  return {
    impressions: calculatePercentChange(first.impressions, second.impressions),
    clicks: calculatePercentChange(first.clicks, second.clicks),
    cost: calculatePercentChange(first.cost, second.cost),
    leads: calculatePercentChange(first.leads, second.leads),
    revenue: calculatePercentChange(first.revenue, second.revenue)
  }
}

function calculatePercentChange(oldValue: number, newValue: number): string {
  if (oldValue === 0) return newValue > 0 ? '+100' : '0'
  const change = ((newValue - oldValue) / oldValue * 100)
  return (change >= 0 ? '+' : '') + change.toFixed(1)
}

function convertToCSV(report: any): string {
  const lines: string[] = []
  
  // Header
  lines.push(`Report Type: ${report.type}`)
  lines.push(`Company: ${report.company.name}`)
  lines.push(`Period: ${report.period.start} to ${report.period.end}`)
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push('')

  // Based on report type, format data differently
  if (report.type === 'summary') {
    lines.push('Metric,Value')
    lines.push(`Total Impressions,${report.totals.impressions}`)
    lines.push(`Total Clicks,${report.totals.clicks}`)
    lines.push(`Total Cost,${report.totals.cost}`)
    lines.push(`Total Leads,${report.totals.leads}`)
    lines.push(`Total Revenue,${report.totals.revenue}`)
    lines.push('')
    lines.push('KPI,Value')
    lines.push(`CTR,${report.kpis.ctr}%`)
    lines.push(`CPC,R$ ${report.kpis.cpc}`)
    lines.push(`CPL,R$ ${report.kpis.cpl}`)
    lines.push(`ROAS,${report.kpis.roas}x`)
  } else if (report.type === 'detailed') {
    lines.push('Campaign,Platform,Impressions,Clicks,Cost,Leads,Revenue,CTR,CPC,CPL,ROAS')
    report.campaigns.forEach((c: any) => {
      lines.push([
        c.campaign.name,
        c.campaign.platform,
        c.metrics.impressions,
        c.metrics.clicks,
        c.metrics.cost,
        c.metrics.leads,
        c.metrics.revenue,
        c.kpis.ctr,
        c.kpis.cpc,
        c.kpis.cpl,
        c.kpis.roas
      ].join(','))
    })
  }

  return lines.join('\n')
}