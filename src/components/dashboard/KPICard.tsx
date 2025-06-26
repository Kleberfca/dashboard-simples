'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  title: string
  value: number | string
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: React.ReactNode
  prefix?: string
  suffix?: string
  color?: string
  className?: string
  showTrend?: boolean
}

export default function KPICard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  prefix = '',
  suffix = '',
  color = 'blue',
  className = '',
  showTrend = true
}: KPICardProps) {
  
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val
    
    // Formatação específica para valores monetários
    if (prefix === 'R$ ') {
      return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    
    // Formatação para números grandes
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`
    }
    
    // Formatação padrão
    return val.toLocaleString('pt-BR')
  }

  const getColorClasses = () => {
    const colors = {
      blue: {
        gradient: 'from-blue-600 to-cyan-600',
        icon: 'text-blue-400',
        bg: 'bg-blue-500'
      },
      purple: {
        gradient: 'from-purple-600 to-indigo-600',
        icon: 'text-purple-400',
        bg: 'bg-purple-500'
      },
      green: {
        gradient: 'from-green-600 to-emerald-600',
        icon: 'text-green-400',
        bg: 'bg-green-500'
      },
      orange: {
        gradient: 'from-orange-600 to-yellow-600',
        icon: 'text-orange-400',
        bg: 'bg-orange-500'
      },
      red: {
        gradient: 'from-red-600 to-pink-600',
        icon: 'text-red-400',
        bg: 'bg-red-500'
      }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-400'
      case 'decrease':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const colorClasses = getColorClasses()

  return (
    <div className={`relative group ${className}`}>
      {/* Gradient background blur effect */}
      <div className={`
        absolute -inset-0.5 bg-gradient-to-r ${colorClasses.gradient} 
        rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 
        transition duration-300
      `}></div>
      
      {/* Main card */}
      <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20 h-full">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-medium text-gray-300 truncate">
              {title}
            </h3>
          </div>
          {icon && (
            <div className={`
              flex-shrink-0 p-2 sm:p-3 rounded-lg ${colorClasses.bg} bg-opacity-20 ml-3
            `}>
              <div className={`h-4 w-4 sm:h-5 sm:w-5 ${colorClasses.icon}`}>
                {icon}
              </div>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2 sm:mb-3">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white break-words">
            {prefix}{formatValue(value)}{suffix}
          </p>
        </div>

        {/* Change indicator */}
        {showTrend && change !== undefined && (
          <div className="flex items-center gap-1">
            {changeType === 'increase' && (
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
            )}
            {changeType === 'decrease' && (
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
            )}
            <span className={`text-xs sm:text-sm font-medium ${getChangeColor()}`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-400 ml-1">
              vs período anterior
            </span>
          </div>
        )}

        {/* Subtle animation on hover */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 pointer-events-none"></div>
      </div>
    </div>
  )
}