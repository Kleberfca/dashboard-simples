'use client'

import { FileText, Download, Eye, BarChart3 } from 'lucide-react'

interface ReportPreviewData {
  type: 'summary' | 'detailed' | 'comparison'
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
  }
  byPlatform?: Record<string, any>
  campaigns?: Array<{
    campaign: any
    metrics: any
    kpis: any
  }>
  periods?: {
    first: any
    second: any
  }
  changes?: Record<string, string | number>
}

interface ReportPreviewProps {
  preview: ReportPreviewData | null
  onDownload: (format: 'pdf' | 'excel' | 'csv') => void
  loading?: boolean
  className?: string
}

export default function ReportPreview({ 
  preview, 
  onDownload, 
  loading = false,
  className = '' 
}: ReportPreviewProps) {
  
  if (!preview) {
    return (
      <div className={`
        bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 sm:p-8 
        border border-white border-opacity-20 ${className}
      `}>
        <div className="text-center text-gray-400">
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Prévia do Relatório</p>
          <p className="text-sm">Configure os parâmetros e clique em "Gerar Prévia" para visualizar o relatório</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`
        bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 sm:p-8 
        border border-white border-opacity-20 ${className}
      `}>
        <div className="text-center text-gray-400">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium">Gerando prévia...</p>
        </div>
      </div>
    )
  }

  const getReportTypeInfo = () => {
    switch (preview.type) {
      case 'summary':
        return {
          title: 'Relatório Resumido',
          icon: <FileText className="h-5 w-5" />,
          color: 'text-blue-400'
        }
      case 'detailed':
        return {
          title: 'Relatório Detalhado',
          icon: <BarChart3 className="h-5 w-5" />,
          color: 'text-purple-400'
        }
      case 'comparison':
        return {
          title: 'Relatório Comparativo',
          icon: <BarChart3 className="h-5 w-5" />,
          color: 'text-green-400'
        }
      default:
        return {
          title: 'Relatório',
          icon: <FileText className="h-5 w-5" />,
          color: 'text-gray-400'
        }
    }
  }

  const typeInfo = getReportTypeInfo()

  return (
    <div className={`
      bg-white bg-opacity-10 backdrop-blur-lg rounded-xl border border-white border-opacity-20 
      ${className}
    `}>
      {/* Header da prévia */}
      <div className="p-4 sm:p-6 border-b border-white border-opacity-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`${typeInfo.color}`}>
              {typeInfo.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{typeInfo.title}</h3>
              <p className="text-sm text-gray-400">Prévia dos dados</p>
            </div>
          </div>

          {/* Botões de download - Responsivos */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onDownload('pdf')}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 bg-opacity-20 text-red-300 rounded-lg hover:bg-opacity-30 transition-all text-sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={() => onDownload('excel')}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 bg-opacity-20 text-green-300 rounded-lg hover:bg-opacity-30 transition-all text-sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={() => onDownload('csv')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 bg-opacity-20 text-blue-300 rounded-lg hover:bg-opacity-30 transition-all text-sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo da prévia - Responsivo */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-96 sm:max-h-[500px] overflow-y-auto">
        
        {/* Resumo Geral */}
        {preview.type === 'summary' && preview.totals && (
          <div>
            <h4 className="text-white font-semibold mb-4">Resumo Geral</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white bg-opacity-5 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-400">Total Investido</p>
                <p className="text-lg sm:text-xl font-bold text-white">
                  R$ {(preview.totals.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white bg-opacity-5 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-400">Leads Gerados</p>
                <p className="text-lg sm:text-xl font-bold text-white">
                  {(preview.totals.leads || 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="bg-white bg-opacity-5 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-400">Receita Total</p>
                <p className="text-lg sm:text-xl font-bold text-white">
                  R$ {(preview.totals.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* KPIs */}
            {preview.kpis && (
              <div className="mt-4 sm:mt-6">
                <h5 className="text-white font-medium mb-3">Principais KPIs</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white bg-opacity-5 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">CTR</p>
                    <p className="text-base sm:text-lg font-semibold text-white">
                      {preview.kpis.ctr.toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-5 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">CPC</p>
                    <p className="text-base sm:text-lg font-semibold text-white">
                      R$ {preview.kpis.cpc.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-5 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">CPL</p>
                    <p className="text-base sm:text-lg font-semibold text-white">
                      R$ {preview.kpis.cpl.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-5 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">ROAS</p>
                    <p className="text-base sm:text-lg font-semibold text-white">
                      {preview.kpis.roas.toFixed(1)}x
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance por Plataforma */}
        {preview.byPlatform && Object.keys(preview.byPlatform).length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-4">Performance por Plataforma</h4>
            <div className="space-y-2 sm:space-y-3">
              {Object.entries(preview.byPlatform).map(([platform, data]: [string, any]) => (
                <div key={platform} className="bg-white bg-opacity-5 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <span className="text-white font-medium text-sm sm:text-base">
                        {platform.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="text-gray-300">
                        <span className="text-gray-400">Custo:</span> R$ {data.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-gray-300">
                        <span className="text-gray-400">Leads:</span> {data.leads}
                      </div>
                      {data.revenue && (
                        <div className="text-gray-300">
                          <span className="text-gray-400">Receita:</span> R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campanhas Detalhadas */}
        {preview.type === 'detailed' && preview.campaigns && (
          <div>
            <h4 className="text-white font-semibold mb-4">Campanhas ({preview.campaigns.length})</h4>
            <div className="space-y-3 sm:space-y-4">
              {preview.campaigns.slice(0, 5).map((campaign: any, index: number) => (
                <div key={index} className="bg-white bg-opacity-5 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-white font-medium truncate">{campaign.campaign.name}</h5>
                      <p className="text-xs text-gray-400 mt-1">{campaign.campaign.platform}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-sm font-medium text-green-400">
                        ROAS {campaign.kpis.roas}x
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400">Impressões</p>
                      <p className="text-white">{campaign.metrics.impressions?.toLocaleString('pt-BR') || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Cliques</p>
                      <p className="text-white">{campaign.metrics.clicks?.toLocaleString('pt-BR') || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Custo</p>
                      <p className="text-white">R$ {campaign.metrics.cost?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Leads</p>
                      <p className="text-white">{campaign.metrics.leads || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {preview.campaigns.length > 5 && (
                <div className="text-center text-gray-400 text-sm">
                  + {preview.campaigns.length - 5} campanhas adicionais no relatório completo
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comparação de Períodos */}
        {preview.type === 'comparison' && preview.periods && (
          <div>
            <h4 className="text-white font-semibold mb-4">Comparação de Períodos</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-5 rounded-lg p-4">
                <h5 className="text-blue-400 font-medium mb-2">Primeiro Período</h5>
                <p className="text-xs text-gray-400 mb-3">
                  {preview.periods.first.start} - {preview.periods.first.end}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Investimento:</span>
                    <span className="text-white">R$ {preview.periods.first.metrics?.cost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Leads:</span>
                    <span className="text-white">{preview.periods.first.metrics?.leads || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-5 rounded-lg p-4">
                <h5 className="text-purple-400 font-medium mb-2">Segundo Período</h5>
                <p className="text-xs text-gray-400 mb-3">
                  {preview.periods.second.start} - {preview.periods.second.end}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Investimento:</span>
                    <span className="text-white">R$ {preview.periods.second.metrics?.cost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Leads:</span>
                    <span className="text-white">{preview.periods.second.metrics?.leads || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Variações */}
            {preview.changes && (
              <div className="mt-4 bg-white bg-opacity-5 rounded-lg p-4">
                <h5 className="text-white font-medium mb-3">Variações</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {Object.entries(preview.changes).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                      <span className={`font-medium ${
                        typeof value === 'number' 
                          ? value > 0 ? 'text-green-400' : 'text-red-400'
                          : 'text-white'
                      }`}>
                        {typeof value === 'number' ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%` : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}