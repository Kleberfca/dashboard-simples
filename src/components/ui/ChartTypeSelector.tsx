'use client'

import { useState } from 'react'
import { LineChart, BarChart3 } from 'lucide-react'

interface ChartTypeSelectorProps {
  value: 'line' | 'bar'
  onChange: (type: 'line' | 'bar') => void
}

export default function ChartTypeSelector({ value, onChange }: ChartTypeSelectorProps) {
  return (
    <div className="flex gap-1 bg-white bg-opacity-5 rounded-lg p-1">
      <button
        onClick={() => onChange('line')}
        className={`p-2 rounded transition-all ${
          value === 'line' 
            ? 'bg-white bg-opacity-20 text-white' 
            : 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-10'
        }`}
        title="Gráfico de Linha"
      >
        <LineChart className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange('bar')}
        className={`p-2 rounded transition-all ${
          value === 'bar' 
            ? 'bg-white bg-opacity-20 text-white' 
            : 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-10'
        }`}
        title="Gráfico de Barras"
      >
        <BarChart3 className="h-4 w-4" />
      </button>
    </div>
  )
}