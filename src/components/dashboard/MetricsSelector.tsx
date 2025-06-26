'use client'

import { useState, useRef, useEffect } from 'react'
import { Settings, Check, X } from 'lucide-react'

interface Metric {
  id: string
  label: string
  icon: React.ReactNode
  category: 'financial' | 'conversion' | 'performance'
  prefix?: string
  suffix?: string
  color: string
}

interface MetricsSelectorProps {
  selectedMetrics: string[]
  onMetricsChange: (metrics: string[]) => void
  availableMetrics: Metric[]
  maxMetrics?: number
}

export default function MetricsSelector({ 
  selectedMetrics, 
  onMetricsChange, 
  availableMetrics, 
  maxMetrics = 4 
}: MetricsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [tempSelected, setTempSelected] = useState<string[]>(selectedMetrics)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Sincronizar seleção temporária com props
  useEffect(() => {
    setTempSelected(selectedMetrics)
  }, [selectedMetrics])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setTempSelected(selectedMetrics) // Resetar seleção temporária
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedMetrics])

  // Agrupar métricas por categoria
  const metricsByCategory = availableMetrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = []
    }
    acc[metric.category].push(metric)
    return acc
  }, {} as Record<string, Metric[]>)

  const categoryLabels = {
    financial: 'Financeiro',
    conversion: 'Conversão', 
    performance: 'Performance'
  }

  const handleMetricToggle = (metricId: string) => {
    const isSelected = tempSelected.includes(metricId)
    
    if (isSelected) {
      // Remover métrica
      setTempSelected(prev => prev.filter(id => id !== metricId))
    } else {
      // Adicionar métrica se não atingiu o limite
      if (tempSelected.length < maxMetrics) {
        setTempSelected(prev => [...prev, metricId])
      }
    }
  }

  const handleSave = () => {
    onMetricsChange(tempSelected)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTempSelected(selectedMetrics)
    setIsOpen(false)
  }

  const isMetricSelected = (metricId: string) => tempSelected.includes(metricId)
  const canSelectMore = tempSelected.length < maxMetrics

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão para abrir o seletor */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg border border-white border-opacity-20 text-white hover:bg-opacity-20 transition-all text-sm whitespace-nowrap"
        title="Personalizar Métricas"
      >
        <Settings className="h-4 w-4 flex-shrink-0" />
        <span className="hidden sm:inline">Métricas</span>
      </button>

      {/* Modal/Dropdown responsivo */}
      {isOpen && (
        <div 
          className={`
            ${isMobile 
              ? 'fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50' 
              : 'absolute right-0 top-full mt-2 z-50'
            }
          `}
        >
          <div 
            className={`
              ${isMobile 
                ? 'w-full max-w-lg rounded-t-xl max-h-[85vh]' 
                : 'w-80 rounded-xl'
              }
              bg-gray-900 bg-opacity-95 backdrop-blur-xl shadow-2xl border border-white border-opacity-20 overflow-hidden
            `}
          >
            {/* Header */}
            <div className="bg-white bg-opacity-5 p-4 border-b border-white border-opacity-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Personalizar Métricas</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Selecione até {maxMetrics} métricas para exibir no dashboard
                  </p>
                </div>
                {isMobile && (
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-white transition-colors ml-2"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {/* Contador de métricas selecionadas */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  {tempSelected.length} de {maxMetrics} métricas selecionadas
                </span>
                {tempSelected.length > 0 && (
                  <button
                    onClick={() => setTempSelected([])}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Limpar tudo
                  </button>
                )}
              </div>
            </div>

            {/* Lista de métricas por categoria */}
            <div className={`${isMobile ? 'max-h-[50vh] overflow-y-auto' : ''} p-4 space-y-4`}>
              {Object.entries(metricsByCategory).map(([category, metrics]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </h4>
                  <div className="space-y-2">
                    {metrics.map((metric) => {
                      const isSelected = isMetricSelected(metric.id)
                      const canSelect = canSelectMore || isSelected
                      
                      return (
                        <button
                          key={metric.id}
                          onClick={() => canSelect && handleMetricToggle(metric.id)}
                          disabled={!canSelect}
                          className={`
                            w-full p-3 rounded-lg border transition-all text-left flex items-center gap-3
                            ${isSelected
                              ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                              : canSelect
                                ? 'border-white border-opacity-20 hover:border-opacity-40 hover:bg-white hover:bg-opacity-5'
                                : 'border-white border-opacity-10 opacity-50 cursor-not-allowed'
                            }
                          `}
                        >
                          {/* Ícone da métrica */}
                          <div className={`
                            flex-shrink-0 p-2 rounded-lg
                            ${isSelected ? 'bg-blue-500' : 'bg-white bg-opacity-10'}
                          `}>
                            <div className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                              {metric.icon}
                            </div>
                          </div>

                          {/* Informações da métrica */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                              {metric.label}
                            </p>
                            <p className="text-xs text-gray-400">
                              {metric.prefix && `Prefixo: ${metric.prefix}`}
                              {metric.suffix && `Sufixo: ${metric.suffix}`}
                              {!metric.prefix && !metric.suffix && 'Valor numérico'}
                            </p>
                          </div>

                          {/* Indicador de seleção */}
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <Check className="h-4 w-4 text-blue-400" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer com botões de ação */}
            <div className="bg-white bg-opacity-5 p-4 border-t border-white border-opacity-10">
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-white border-opacity-30 text-white rounded-lg hover:bg-white hover:bg-opacity-10 transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={tempSelected.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}