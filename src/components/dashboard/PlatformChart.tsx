'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PlatformData {
  name: string
  value: number
  leads: number
}

interface PlatformChartProps {
  data: PlatformData[]
  title?: string
  className?: string
}

// Função para truncar nomes longos de plataforma
const truncatePlatformName = (name: string, maxLength: number = 12) => {
  if (name.length <= maxLength) return name
  
  // Substituições específicas para plataformas conhecidas
  const replacements: Record<string, string> = {
    'Google Ads': 'Google',
    'Facebook Ads': 'Facebook', 
    'Instagram Ads': 'Instagram',
    'TikTok Ads': 'TikTok',
    'LinkedIn Ads': 'LinkedIn',
    'Twitter Ads': 'Twitter',
    'Pinterest Ads': 'Pinterest',
    'Snapchat Ads': 'Snapchat'
  }
  
  if (replacements[name]) {
    return replacements[name]
  }
  
  // Truncar genérico
  return name.slice(0, maxLength - 3) + '...'
}

export default function PlatformChart({ data, title = "Comparativo por Plataforma", className = "" }: PlatformChartProps) {
  // Processar dados para garantir que os nomes não sejam cortados
  const processedData = data.map(item => ({
    ...item,
    shortName: truncatePlatformName(item.name),
    fullName: item.name // Manter nome completo para tooltip
  }))

  // Custom tooltip para mostrar informações completas
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900 bg-opacity-95 backdrop-blur-sm p-4 rounded-lg border border-white border-opacity-20 shadow-xl">
          <p className="text-white font-semibold mb-2">{data.fullName}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-white text-sm">
                {entry.name === 'value' ? 'Investimento' : entry.name}: {
                  entry.name === 'value' 
                    ? `R$ ${entry.value.toLocaleString('pt-BR')}` 
                    : entry.value
                }
              </p>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Custom label para o eixo X que garante que o texto seja visível
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill="rgba(255,255,255,0.7)" 
          fontSize="12"
          fontWeight="500"
        >
          {payload.value}
        </text>
      </g>
    )
  }

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
      <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20 h-full">
        {/* Header do gráfico */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>
          <div className="text-xs text-gray-400">
            {data.length} plataforma{data.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Gráfico de barras */}
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 40 // Aumentar margem inferior para acomodar labels
              }}
              barCategoryGap="20%"
            >
              <defs>
                <linearGradient id="colorPlatformBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)" 
                vertical={false}
              />
              
              <XAxis 
                dataKey="shortName"
                stroke="rgba(255,255,255,0.5)"
                tick={<CustomXAxisTick />}
                axisLine={false}
                tickLine={false}
                interval={0} // Garantir que todos os labels sejam mostrados
                height={50} // Altura fixa para o eixo X
              />
              
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              />
              
              <Bar 
                dataKey="value" 
                fill="url(#colorPlatformBar)"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
                animationBegin={200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda adicional para dispositivos muito pequenos */}
        <div className="mt-4 sm:hidden">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {processedData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-300 truncate">{item.fullName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo das métricas */}
        <div className="mt-4 pt-4 border-t border-white border-opacity-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">Total Investido</p>
              <p className="text-sm font-semibold text-white">
                R$ {data.reduce((acc, item) => acc + item.value, 0).toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Leads</p>
              <p className="text-sm font-semibold text-white">
                {data.reduce((acc, item) => acc + item.leads, 0)}
              </p>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-gray-400">Melhor ROI</p>
              <p className="text-sm font-semibold text-white">
                {data.length > 0 ? data.reduce((best, current) => 
                  (current.leads / current.value) > (best.leads / best.value) ? current : best
                ).name.split(' ')[0] : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}