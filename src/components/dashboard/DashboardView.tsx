'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, TrendingUp, DollarSign, Users, MousePointer, Eye, Activity, RefreshCw, ArrowUpRight, Zap, Target, ShoppingBag, CreditCard, BarChart3 } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import KPICard from './KPICard'
import Loading from '@/components/ui/Loading'
import PeriodSelector from '@/components/ui/PeriodSelector'
import ChartTypeSelector from '@/components/ui/ChartTypeSelector'
import MetricsSelector from './MetricsSelector'

interface DashboardViewProps {
  companyId: string
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']

// Todas as métricas disponíveis
const availableMetrics = [
  { 
    id: 'total_investment',
    label: 'Investimento Total',
    icon: <DollarSign className="h-5 w-5" />,
    category: 'financial' as const,
    prefix: 'R$ ',
    color: 'blue'
  },
  { 
    id: 'total_revenue',
    label: 'Receita Total',
    icon: <CreditCard className="h-5 w-5" />,
    category: 'financial' as const,
    prefix: 'R$ ',
    color: 'green'
  },
  { 
    id: 'leads_generated',
    label: 'Leads Gerados',
    icon: <Users className="h-5 w-5" />,
    category: 'conversion' as const,
    color: 'purple'
  },
  { 
    id: 'conversion_rate',
    label: 'Taxa de Conversão',
    icon: <TrendingUp className="h-5 w-5" />,
    category: 'conversion' as const,
    suffix: '%',
    color: 'green'
  },
  { 
    id: 'avg_roas',
    label: 'ROAS Médio',
    icon: <Activity className="h-5 w-5" />,
    category: 'performance' as const,
    suffix: 'x',
    color: 'orange'
  },
  { 
    id: 'total_clicks',
    label: 'Cliques Totais',
    icon: <MousePointer className="h-5 w-5" />,
    category: 'performance' as const,
    color: 'blue'
  },
  { 
    id: 'total_impressions',
    label: 'Impressões Totais',
    icon: <Eye className="h-5 w-5" />,
    category: 'performance' as const,
    color: 'purple'
  },
  { 
    id: 'avg_ctr',
    label: 'CTR Médio',
    icon: <Target className="h-5 w-5" />,
    category: 'performance' as const,
    suffix: '%',
    color: 'green'
  },
  { 
    id: 'deals_closed',
    label: 'Negócios Fechados',
    icon: <ShoppingBag className="h-5 w-5" />,
    category: 'conversion' as const,
    color: 'purple'
  }
]

export default function DashboardView({ companyId }: DashboardViewProps) {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [platformData, setPlatformData] = useState<any[]>([])
  const [dateRange, setDateRange] = useState('30')
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'total_investment',
    'leads_generated',
    'conversion_rate',
    'avg_roas'
  ])

  const fetchDashboardData = useCallback(async () => {
    if (!loading) setRefreshing(true)
    
    try {
      const response = await fetch('/api/metrics/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyId, 
          filters: {
            dateRange: {
              type: dateRange,
              customDates: dateRange === 'custom' ? customDateRange : undefined,
              start: dateRange === 'custom' ? customDateRange.start : new Date(new Date().setDate(new Date().getDate() - parseInt(dateRange))),
              end: dateRange === 'custom' ? customDateRange.end : new Date()
            }
          }
        }),
      })

      const data = await response.json()
      
      // Mock data for selected metrics
      const mockMetricsData = {
        total_investment: { value: 54898.50, change: 12.5, changeType: 'increase' },
        total_revenue: { value: 263152.40, change: 18.3, changeType: 'increase' },
        leads_generated: { value: 186, change: 23.4, changeType: 'increase' },
        conversion_rate: { value: 3.2, change: 5.7, changeType: 'increase' },
        avg_roas: { value: 4.8, change: -2.1, changeType: 'decrease' },
        total_clicks: { value: 5823, change: 15.2, changeType: 'increase' },
        total_impressions: { value: 182456, change: 8.9, changeType: 'increase' },
        avg_ctr: { value: 3.2, change: 6.1, changeType: 'increase' },
        deals_closed: { value: 42, change: 10.5, changeType: 'increase' }
      }

      // Build metrics array based on selected metrics
      const selectedMetricsData = selectedMetrics.map(metricId => {
        const metricConfig = availableMetrics.find(m => m.id === metricId)!
        const metricData = mockMetricsData[metricId as keyof typeof mockMetricsData]
        
        return {
          ...metricConfig,
          value: metricData.value,
          change: metricData.change,
          changeType: metricData.changeType
        }
      })
      
      setMetrics(selectedMetricsData)
      
      // Mock chart data
      const dates = []
      const days = dateRange === 'daily' ? 1 : parseInt(dateRange) || 30
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dates.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          investimento: Math.floor(Math.random() * 2000) + 1000,
          leads: Math.floor(Math.random() * 20) + 5,
          conversoes: Math.floor(Math.random() * 10) + 2
        })
      }
      setChartData(dates)
      
      // Mock platform data
      setPlatformData([
        { name: 'Google Ads', value: 45000, leads: 120 },
        { name: 'Facebook Ads', value: 35000, leads: 85 },
        { name: 'Instagram Ads', value: 25000, leads: 65 },
        { name: 'TikTok Ads', value: 15000, leads: 40 }
      ])
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [companyId, dateRange, customDateRange, selectedMetrics, loading])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleRefresh = () => {
    fetchDashboardData()
  }

  const handleDateRangeChange = (range: string, customDates?: { start: string; end: string }) => {
    setDateRange(range)
    if (customDates) {
      setCustomDateRange(customDates)
    }
  }

  const handleMetricsChange = (newMetrics: string[]) => {
    setSelectedMetrics(newMetrics)
  }

  // Custom tooltip para os gráficos
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 bg-opacity-95 backdrop-blur-sm p-3 rounded-lg border border-white border-opacity-20 shadow-xl">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-white text-sm">
                {entry.name}: {
                  entry.name === 'Investimento' 
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

  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180)
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loading fullScreen text="Carregando dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -m-4 sm:-m-6 p-4 sm:p-6">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-300 mt-1 text-sm sm:text-base">Visão geral do desempenho das suas campanhas</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <PeriodSelector 
              value={dateRange}
              onChange={handleDateRangeChange}
              showCustom={true}
            />
            
            <MetricsSelector
              selectedMetrics={selectedMetrics}
              onMetricsChange={handleMetricsChange}
              availableMetrics={availableMetrics}
            />
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all backdrop-blur-lg border border-white border-opacity-20"
            >
              <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {metrics.map((metric, index) => (
            <div key={metric.id} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-300">{metric.label}</h3>
                  <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${
                    metric.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    metric.color === 'purple' ? 'from-purple-500 to-purple-600' :
                    metric.color === 'green' ? 'from-green-500 to-green-600' :
                    'from-orange-500 to-orange-600'
                  }`}>
                    <div className="text-white scale-75 sm:scale-100">
                      {metric.icon}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-baseline justify-between">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    {metric.prefix}{typeof metric.value === 'number' ? metric.value.toLocaleString('pt-BR') : metric.value}{metric.suffix}
                  </p>
                  {metric.change !== undefined && (
                    <div className={`flex items-center text-xs sm:text-sm ${metric.changeType === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
                      <TrendingUp className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${metric.changeType === 'decrease' ? 'rotate-180' : ''}`} />
                      <span>{Math.abs(metric.change)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Chart - 2 columns */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Evolução de Métricas</h3>
                  <div className="flex items-center gap-3">
                    <ChartTypeSelector value={chartType} onChange={setChartType} />
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                  </div>
                </div>
                <div className="h-64 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorInvestimento" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="investimento" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorInvestimento)" name="Investimento" />
                        <Area type="monotone" dataKey="leads" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" name="Leads" />
                      </AreaChart>
                    ) : (
                      <BarChart data={chartData}>
                        <defs>
                          <linearGradient id="colorBar1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          </linearGradient>
                          <linearGradient id="colorBar2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="investimento" fill="url(#colorBar1)" name="Investimento" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="leads" fill="url(#colorBar2)" name="Leads" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Performance por Plataforma - 1 column */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Performance por Plataforma</h3>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={500}
                    >
                      {platformData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          style={{ outline: 'none' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={<CustomTooltip />}
                      formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {platformData.map((platform, index) => (
                  <div key={platform.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-gray-300 truncate">{platform.name}</span>
                    <span className="text-xs text-white ml-auto">
                      {((platform.value / platformData.reduce((sum, p) => sum + p.value, 0)) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-300">Taxa de Cliques (CTR)</h4>
                <MousePointer className="h-4 w-4 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">3.2%</p>
              <p className="text-xs text-gray-400 mt-1">Média do período</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-300">Custo por Lead (CPL)</h4>
                <Users className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">R$ 294,61</p>
              <p className="text-xs text-gray-400 mt-1">-8.3% vs período anterior</p>
            </div>
          </div>

          <div className="relative group sm:col-span-2 lg:col-span-1">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-300">Melhor Plataforma</h4>
                <BarChart3 className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">Google Ads</p>
              <p className="text-xs text-gray-400 mt-1">ROAS 5.2x | 120 leads</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}