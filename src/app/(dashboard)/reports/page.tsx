// src/app/(dashboard)/reports/page.tsx
'use client'

import { useState } from 'react'
import { FileText, Download, FileSpreadsheet, BarChart3, PieChart, Calendar, Filter, TrendingUp, DollarSign, Users } from 'lucide-react'
import DatePicker from '@/components/ui/DatePicker'

type ReportType = 'summary' | 'detailed' | 'comparison'
type ReportFormat = 'pdf' | 'excel' | 'csv'

interface ReportPreview {
  type: string
  company?: any
  period?: { start: string; end: string }
  generatedAt?: string
  totals?: {
    impressions: number
    clicks: number
    cost: number
    leads: number
    revenue: number
  }
  kpis?: {
    ctr: number
    cpc: number
    cpl: number
    roas: number
    conversionRate?: number
  }
  byPlatform?: Record<string, any>
  campaigns?: Array<{
    campaign: any
    metrics: any
    dailyData: any[]
    kpis: Record<string, string>
  }>
  periods?: {
    first: {
      start: string
      end: string
      metrics: any
    }
    second: {
      start: string
      end: string
      metrics: any
    }
  }
  changes?: Record<string, string | number>
  dailyTrends?: Array<any>
}

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<ReportType>('summary')
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('pdf')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState<ReportPreview | null>(null)

  const platforms = [
    { id: 'google_ads', name: 'Google Ads', icon: '🔍' },
    { id: 'facebook_ads', name: 'Facebook Ads', icon: '📘' },
    { id: 'instagram_ads', name: 'Instagram Ads', icon: '📷' },
    { id: 'tiktok_ads', name: 'TikTok Ads', icon: '🎵' }
  ]

  const reportTypes = [
    {
      type: 'summary' as ReportType,
      title: 'Relatório Resumido',
      description: 'Visão geral com principais KPIs e métricas',
      icon: <FileText className="h-8 w-8" />,
      color: 'from-blue-600 to-cyan-600'
    },
    {
      type: 'detailed' as ReportType,
      title: 'Relatório Detalhado',
      description: 'Análise completa por campanha e período',
      icon: <BarChart3 className="h-8 w-8" />,
      color: 'from-purple-600 to-pink-600'
    },
    {
      type: 'comparison' as ReportType,
      title: 'Relatório Comparativo',
      description: 'Compare períodos e identifique tendências',
      icon: <PieChart className="h-8 w-8" />,
      color: 'from-green-600 to-emerald-600'
    }
  ]

  const handleGenerateReport = async () => {
    setGenerating(true)
    setPreview(null)

    try {
      const params = new URLSearchParams({
        type: selectedType,
        format: 'json', // Always get JSON for preview
        startDate: dateRange.start,
        endDate: dateRange.end
      })

      if (selectedPlatforms.length > 0) {
        params.append('platforms', selectedPlatforms.join(','))
      }

      const response = await fetch(`/api/reports?${params}`)
      const data = await response.json()

      if (data.report) {
        setPreview(data.report)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadReport = async (format: ReportFormat) => {
    setGenerating(true)

    try {
      const params = new URLSearchParams({
        type: selectedType,
        format: format === 'excel' ? 'csv' : format,
        startDate: dateRange.start,
        endDate: dateRange.end
      })

      if (selectedPlatforms.length > 0) {
        params.append('platforms', selectedPlatforms.join(','))
      }

      const response = await fetch(`/api/reports?${params}`)
      
      if (format === 'csv' || format === 'excel') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio-${selectedType}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // For PDF, we'll need to implement PDF generation
        // For now, we'll just show an alert
        alert('Geração de PDF será implementada em breve!')
      }
    } catch (error) {
      console.error('Error downloading report:', error)
    } finally {
      setGenerating(false)
    }
  }

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -m-4 sm:-m-6 p-4 sm:p-6">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 space-y-6 sm:space-y-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8">Relatórios</h1>
        
        {/* Report Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {reportTypes.map((report) => (
            <button
              key={report.type}
              onClick={() => setSelectedType(report.type)}
              className={`relative group ${selectedType === report.type ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${report.color} rounded-lg sm:rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
              <div className="relative bg-white bg-opacity-5 backdrop-blur rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white border-opacity-10 hover:bg-opacity-10 transition-all">
                <div className={`text-${report.color.includes('blue') ? 'blue' : report.color.includes('purple') ? 'purple' : 'green'}-400 mx-auto mb-2 sm:mb-3`}>
                  {report.icon}
                </div>
                <h4 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{report.title}</h4>
                <p className="text-xs sm:text-sm text-gray-300">{report.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
            <div className="flex items-center mb-4">
              <Filter className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Filtros do Relatório</h3>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Início
                </label>
                <DatePicker 
                  value={dateRange.start}
                  onChange={(date) => setDateRange({ ...dateRange, start: date })}
                  placeholder="Selecione a data inicial"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Fim
                </label>
                <DatePicker 
                  value={dateRange.end}
                  onChange={(date) => setDateRange({ ...dateRange, end: date })}
                  placeholder="Selecione a data final"
                />
              </div>
            </div>

            {/* Platform Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Plataformas (deixe vazio para todas)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? 'bg-blue-500 bg-opacity-20 border-blue-500 text-blue-300'
                        : 'bg-white bg-opacity-5 border-white border-opacity-20 text-gray-300 hover:bg-opacity-10'
                    }`}
                  >
                    <span className="text-lg">{platform.icon}</span>
                    <span className="text-sm">{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {generating ? 'Gerando Relatório...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>

        {/* Report Preview */}
        {preview && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Prévia do Relatório</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadReport('pdf')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 bg-opacity-20 text-red-300 rounded-lg hover:bg-opacity-30 transition-all"
                  >
                    <FileText className="h-4 w-4" />
                    PDF
                  </button>
                  <button
                    onClick={() => handleDownloadReport('excel')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 bg-opacity-20 text-green-300 rounded-lg hover:bg-opacity-30 transition-all"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </button>
                  <button
                    onClick={() => handleDownloadReport('csv')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 bg-opacity-20 text-blue-300 rounded-lg hover:bg-opacity-30 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    CSV
                  </button>
                </div>
              </div>

              {/* Summary Report Preview */}
              {preview.type === 'summary' && (
                <div className="space-y-6">
                  {/* KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white bg-opacity-5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <DollarSign className="h-5 w-5 text-blue-400" />
                        <span className="text-xs text-green-400">+{preview.kpis?.roas || 0}x</span>
                      </div>
                      <p className="text-xs text-gray-300">Investimento Total</p>
                      <p className="text-lg font-bold text-white">
                        R$ {(preview.totals?.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        <span className="text-xs text-green-400">{preview.kpis?.ctr || 0}%</span>
                      </div>
                      <p className="text-xs text-gray-300">Cliques Totais</p>
                      <p className="text-lg font-bold text-white">{(preview.totals?.clicks || 0).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="bg-white bg-opacity-5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Users className="h-5 w-5 text-purple-400" />
                        <span className="text-xs text-purple-400">R$ {preview.kpis?.cpl || 0}</span>
                      </div>
                      <p className="text-xs text-gray-300">Leads Gerados</p>
                      <p className="text-lg font-bold text-white">{(preview.totals?.leads || 0).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="bg-white bg-opacity-5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="h-5 w-5 text-orange-400" />
                        <span className="text-xs text-orange-400">{preview.kpis?.conversionRate || 0}%</span>
                      </div>
                      <p className="text-xs text-gray-300">Receita Total</p>
                      <p className="text-lg font-bold text-white">
                        R$ {(preview.totals?.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* By Platform */}
                  {preview.byPlatform && Object.keys(preview.byPlatform).length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-3">Performance por Plataforma</h4>
                      <div className="space-y-2">
                        {Object.entries(preview.byPlatform).map(([platform, data]: [string, any]) => (
                          <div key={platform} className="bg-white bg-opacity-5 rounded-lg p-3 flex justify-between items-center">
                            <span className="text-white">{platform.replace('_', ' ').toUpperCase()}</span>
                            <div className="text-right">
                              <p className="text-sm text-gray-300">R$ {data.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                              <p className="text-xs text-gray-400">{data.leads} leads</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Detailed Report Preview */}
              {preview.type === 'detailed' && preview.campaigns && (
                <div className="space-y-4">
                  {preview.campaigns.slice(0, 3).map((campaign: any) => (
                    <div key={campaign.campaign.id} className="bg-white bg-opacity-5 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="text-white font-semibold">{campaign.campaign.name}</h5>
                          <p className="text-xs text-gray-300">{campaign.campaign.platform}</p>
                        </div>
                        <span className="text-sm text-green-400">ROAS {campaign.kpis.roas}x</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                        <div>
                          <p className="text-gray-400">Impressões</p>
                          <p className="text-white">{campaign.metrics.impressions.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Cliques</p>
                          <p className="text-white">{campaign.metrics.clicks.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Custo</p>
                          <p className="text-white">R$ {campaign.metrics.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Leads</p>
                          <p className="text-white">{campaign.metrics.leads}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {preview.campaigns.length > 3 && (
                    <p className="text-center text-gray-300 text-sm">
                      + {preview.campaigns.length - 3} campanhas no relatório completo
                    </p>
                  )}
                </div>
              )}

              {/* Comparison Report Preview */}
              {preview.type === 'comparison' && preview.periods && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white bg-opacity-5 rounded-lg p-4">
                      <h5 className="text-white font-semibold mb-3">Primeiro Período</h5>
                      <p className="text-xs text-gray-300 mb-2">
                        {new Date(preview.periods.first.start).toLocaleDateString('pt-BR')} - 
                        {new Date(preview.periods.first.end).toLocaleDateString('pt-BR')}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300">Investimento</span>
                          <span className="text-sm text-white">
                            R$ {preview.periods.first.metrics.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300">Leads</span>
                          <span className="text-sm text-white">{preview.periods.first.metrics.leads}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-5 rounded-lg p-4">
                      <h5 className="text-white font-semibold mb-3">Segundo Período</h5>
                      <p className="text-xs text-gray-300 mb-2">
                        {new Date(preview.periods.second.start).toLocaleDateString('pt-BR')} - 
                        {new Date(preview.periods.second.end).toLocaleDateString('pt-BR')}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300">Investimento</span>
                          <span className="text-sm text-white">
                            R$ {preview.periods.second.metrics.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-300">Leads</span>
                          <span className="text-sm text-white">{preview.periods.second.metrics.leads}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {preview.changes && (
                    <div>
                      <h5 className="text-white font-semibold mb-3">Variações</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {Object.entries(preview.changes).map(([metric, change]) => (
                          <div key={metric} className="text-center">
                            <p className="text-xs text-gray-300 capitalize">{metric}</p>
                            <p className={`text-lg font-semibold ${
                              (change as string).startsWith('+') ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {change}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}