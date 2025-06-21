// src/components/dashboard/KPICard.tsx
import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease'
  icon: ReactNode
  prefix?: string
  suffix?: string
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink'
}

export default function KPICard({
  title,
  value,
  change,
  changeType,
  icon,
  prefix = '',
  suffix = '',
  color = 'blue'
}: KPICardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600'
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString('pt-BR')
    }
    return val
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
      <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-medium text-gray-300">{title}</h3>
          <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]} transform scale-75 sm:scale-100`}>
            {icon}
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            {prefix}{formatValue(value)}{suffix}
          </p>
          
          {change !== undefined && changeType && (
            <div className={`flex items-center text-xs sm:text-sm ${
              changeType === 'increase' ? 'text-green-400' : 'text-red-400'
            }`}>
              {changeType === 'increase' ? (
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}