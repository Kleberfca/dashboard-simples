'use client'

import { BarChart3, TrendingUp, Activity } from 'lucide-react'

interface ChartTypeSelectorProps {
  value: 'line' | 'area' | 'bar'
  onChange: (type: 'line' | 'area' | 'bar') => void
  className?: string
}

export default function ChartTypeSelector({ value, onChange, className = '' }: ChartTypeSelectorProps) {
  const chartTypes = [
    {
      type: 'line' as const,
      icon: <TrendingUp className="h-4 w-4" />,
      label: 'Linha',
      description: 'Gráfico de linha'
    },
    {
      type: 'area' as const,
      icon: <Activity className="h-4 w-4" />,
      label: 'Área',
      description: 'Gráfico de área'
    },
    {
      type: 'bar' as const,
      icon: <BarChart3 className="h-4 w-4" />,
      label: 'Barras',
      description: 'Gráfico de barras'
    }
  ]

  return (
    <div className={`flex items-center gap-1 bg-white bg-opacity-10 rounded-lg p-1 ${className}`}>
      {chartTypes.map((chart) => (
        <button
          key={chart.type}
          onClick={() => onChange(chart.type)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm
            ${value === chart.type 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
            }
          `}
          title={chart.description}
        >
          {chart.icon}
          <span className="hidden sm:inline">{chart.label}</span>
        </button>
      ))}
    </div>
  )
}