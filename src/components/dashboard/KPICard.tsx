import { TrendingUp, TrendingDown } from 'lucide-react'
import { ReactNode } from 'react'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease'
  icon?: ReactNode
  prefix?: string
  suffix?: string
  color?: string
}

export default function KPICard({
  title,
  value,
  change,
  changeType = 'increase',
  icon,
  prefix = '',
  suffix = '',
  color = 'blue'
}: KPICardProps) {
  const isPositive = changeType === 'increase'
  const TrendIcon = isPositive ? TrendingUp : TrendingDown
  
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
      <div className="relative bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          {icon && (
            <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} bg-opacity-10`}>
              <div className="text-white">
                {icon}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-bold text-gray-900">
            {prefix}{value}{suffix}
          </p>
          {change !== undefined && (
            <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendIcon className="h-4 w-4 mr-1" />
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}