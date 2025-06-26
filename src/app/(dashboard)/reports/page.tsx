'use client'

import { useState } from 'react'
import { FileText, BarChart3, PieChart, Download, RefreshCw, Calendar, Settings, Filter } from 'lucide-react'
import ReportPreview from '@/components/reports/ReportPreview'

type ReportType = 'summary' | 'detailed' | 'comparison'
type ReportFormat = 'pdf' | 'excel' | 'csv'

interface ReportPreview {
  type: ReportType
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
  const [showFilters, setShowFilters] = useState(false)

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

  const handleGeneratePreview = async () => {
    setGenerating(true)
    setPreview(null)

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock data baseado no tipo de relatório
      const mockPreview: ReportPreview = {
        type: selectedType,
        totals: {
          impressions: 387560,
          clicks: 12450,
          cost: 54898.5,
          leads: 186,
          revenue: 245680
        },
        kpis: {
          ctr: 3.21,
          cpc: 4.41,
          cpl: 294.61,
          roas: 4.48
        },
        byPlatform: {
          google_ads: { cost: 25000, leads: 89, revenue: 120000 },
          facebook_ads: { cost: 15000, leads: 52, revenue: 78000 },
          instagram_ads: { cost: 10000, leads: 31, revenue: 35000 },
          tiktok_ads: { cost: 4898.5, leads: 14, revenue: 12680 }
        }
      }

      if (selectedType === 'detailed') {
        mockPreview.campaigns = [
          {
            campaign: { id: '1', name: 'Black Friday 2024', platform: 'Google Ads' },
            metrics: { impressions: 50000, clicks: 1500, cost: 7500, leads: 45 },
            dailyData: [],
            kpis: { roas: '6.2' }
          },
          {
            campaign: { id: '2', name: 'Natal Premium', platform: 'Facebook Ads' },
            metrics: { impressions: 35000, clicks: 980, cost: 4900, leads: 28 },
            dailyData: [],
            kpis: { roas: '4.8' }
          }
        ]
      }

      if (selectedType === 'comparison') {
        mockPreview.periods = {
          first: {
            start: '2024-11-01',
            end: '2024-11-30',
            metrics: { cost: 30000, leads: 95, revenue: 135000 }
          },
          second: {
            start: '2024-12-01',
            end: '2024-12-31',
            metrics: { cost: 24898.5, leads: 91, revenue: 110680 }
          }
        }
        mockPreview.changes = {
          cost: -17.0,
          leads: -4.2,
          revenue: -18.0
        }
      }

      setPreview(mockPreview)
    } catch (error) {
      console.error('Error generating preview:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadReport = async (format: ReportFormat) => {
    setGenerating(true)

    try {
      // Simular download
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Aqui seria feita a chamada real para a API
      console.log(`Downloading ${selectedType} report in ${format} format`)
    } catch (error) {
      console.error('Error downloading report:', error)
    } finally {
      setGenerating(false)
    }
  }

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -m-4 sm:-m-6 p-4 sm:p-6">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Relatórios</h1>
            <p className="text-gray-300 mt-1 text-sm sm:text-base">Gere relatórios personalizados das suas campanhas</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all backdrop-blur-lg border border-white border-opacity-20"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Grid - Layout responsivo corrigido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sidebar - Configurações */}
          <div className={`lg:col-span-1 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            
            {/* Tipo de Relatório */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white border-opacity-20">
              <h3 className="text-lg font-semibold text-white mb-4">Tipo de Relatório</h3>
              <div className="space-y-3">
                {reportTypes.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => setSelectedType(type.type)}
                    className={`
                      w-full p-4 rounded-lg border transition-all text-left
                      ${selectedType === type.type
                        ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                        : 'border-white border-opacity-20 hover:border-opacity-40 hover:bg-white hover:bg-opacity-5'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        p-2 rounded-lg bg-gradient-to-r ${type.color}
                        ${selectedType === type.type ? 'opacity-100' : 'opacity-70'}
                      `}>
                        <div className="text-white">
                          {type.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm sm:text-base">{type.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-300 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros de Data */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white border-opacity-20">
              <h3 className="text-lg font-semibold text-white mb-4">Período</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Data Inicial</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Data Final</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros de Plataforma */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white border-opacity-20">
              <h3 className="text-lg font-semibold text-white mb-4">Plataformas</h3>
              <div className="space-y-2">
                {platforms.map((platform) => (
                  <label key={platform.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(platform.id)}
                      onChange={() => togglePlatform(platform.id)}
                      className="w-4 h-4 text-blue-600 bg-transparent border-white border-opacity-30 rounded focus:ring-blue-500"
                    />
                    <span className="text-lg">{platform.icon}</span>
                    <span className="text-white text-sm">{platform.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Deixe vazio para incluir todas as plataformas
              </p>
            </div>

            {/* Botão Gerar Prévia */}
            <button
              onClick={handleGeneratePreview}
              disabled={generating}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4" />
                  <span>Gerar Prévia</span>
                </>
              )}
            </button>
          </div>

          {/* Preview - Corrigido para mobile */}
          <div className="lg:col-span-2">
            <ReportPreview
              preview={preview}
              onDownload={handleDownloadReport}
              loading={generating}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}