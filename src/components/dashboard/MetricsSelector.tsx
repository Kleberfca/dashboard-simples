'use client'

import { useState } from 'react'
import { Settings, Check, X } from 'lucide-react'

interface Metric {
  id: string
  label: string
  icon: React.ReactNode
  category: 'financial' | 'performance' | 'conversion'
}

interface MetricsSelectorProps {
  selectedMetrics: string[]
  onMetricsChange: (metrics: string[]) => void
  availableMetrics: Metric[]
}

export default function MetricsSelector({ 
  selectedMetrics, 
  onMetricsChange, 
  availableMetrics 
}: MetricsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempSelection, setTempSelection] = useState<string[]>(selectedMetrics)

  const categories = {
    financial: 'Financeiro',
    performance: 'Performance',
    conversion: 'Conversão'
  }

  const handleToggleMetric = (metricId: string) => {
    if (tempSelection.includes(metricId)) {
      setTempSelection(tempSelection.filter(id => id !== metricId))
    } else if (tempSelection.length < 4) {
      setTempSelection([...tempSelection, metricId])
    }
  }

  const handleSave = () => {
    onMetricsChange(tempSelection)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTempSelection(selectedMetrics)
    setIsOpen(false)
  }

  const groupedMetrics = availableMetrics.reduce((acc, metric) => {
    if (!acc[metric.category]) acc[metric.category] = []
    acc[metric.category].push(metric)
    return acc
  }, {} as Record<string, Metric[]>)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all backdrop-blur-lg border border-white border-opacity-20"
        title="Personalizar métricas"
      >
        <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white border-opacity-20 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white border-opacity-10">
              <h2 className="text-xl font-semibold text-white">Personalizar Métricas</h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 180px)' }}>
              <p className="text-gray-300 mb-6">
                Selecione até 4 métricas para exibir no dashboard. As métricas selecionadas aparecerão como cards principais.
              </p>

              <div className="space-y-6">
                {Object.entries(groupedMetrics).map(([category, metrics]) => (
                  <div key={category}>
                    <h3 className="text-white font-semibold mb-3">{categories[category as keyof typeof categories]}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {metrics.map((metric) => (
                        <label
                          key={metric.id}
                          className={`
                            flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all
                            ${tempSelection.includes(metric.id)
                              ? 'bg-blue-500 bg-opacity-20 border-blue-500'
                              : 'bg-white bg-opacity-5 border-white border-opacity-20 hover:bg-opacity-10'
                            }
                            ${!tempSelection.includes(metric.id) && tempSelection.length >= 4
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={tempSelection.includes(metric.id)}
                            onChange={() => handleToggleMetric(metric.id)}
                            disabled={!tempSelection.includes(metric.id) && tempSelection.length >= 4}
                            className="sr-only"
                          />
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                            ${tempSelection.includes(metric.id)
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-400'
                            }
                          `}>
                            {tempSelection.includes(metric.id) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-gray-400">{metric.icon}</div>
                              <span className="text-white font-medium">{metric.label}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-white border-opacity-10">
              <p className="text-sm text-gray-400">
                {tempSelection.length} de 4 métricas selecionadas
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={tempSelection.length === 0}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}