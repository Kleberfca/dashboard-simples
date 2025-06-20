'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, DollarSign, Users, MousePointer, Eye, Activity, RefreshCw, ArrowUpRight, Zap } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import KPICard from './KPICard'
import Loading from '@/components/ui/Loading'

interface DashboardViewProps {
  companyId: string
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']

export default function DashboardView({ companyId }: DashboardViewProps) {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [platformData, setPlatformData] = useState<any[]>([])
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    fetchDashboardData()
  }, [companyId, dateRange])

  const fetchDashboardData = async () => {
    if (!loading) setRefreshing(true)
    
    try {
      const response = await fetch('/api/metrics/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyId, 
          filters: {
            dateRange: {
              start: new Date(new Date().setDate(new Date().getDate() - parseInt(dateRange))),
              end: new Date()
            }
          }
        }),
      })

      const data = await response.json()
      
      // Mock data for demonstration
      const mockMetrics = [
        { 
          title: 'Investimento Total',
          value: 54898.50,
          change: 12.5,
          changeType: 'increase',
          icon: <DollarSign className="h-5 w-5" />,
          prefix: 'R$ ',
          color: 'blue'
        },
        { 
          title: 'Leads Gerados',
          value: 186,
          change: 23.4,
          changeType: 'increase',
          icon: <Users className="h-5 w-5" />,
          color: 'purple'
        },
        { 
          title: 'Taxa de Conversão',
          value: '3.2%',
          change: 5.7,
          changeType: 'increase',
          icon: <TrendingUp className="h-5 w-5" />,
          color: 'green'
        },
        { 
          title: 'ROAS Médio',
          value: '4.8x',
          change: -2.1,
          changeType: 'decrease',
          icon: <Activity className="h-5 w-5" />,
          color: 'orange'
        }
      ]
      
      setMetrics(mockMetrics)
      
      // Mock chart data
      const dates = []
      for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
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
  }

  const handleRefresh = () => {
    fetchDashboardData()
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
          
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 text-sm sm:text-base bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white [&>option]:text-gray-900"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
            
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
            <div key={index} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-300">{metric.title}</h3>
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
                    {metric.prefix}{metric.value}{metric.suffix}
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
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                </div>
                <div className="h-64 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
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
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.95)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(10px)',
                          fontSize: '12px'
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="investimento" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorInvestimento)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="leads" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorLeads)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Performance */}
          <div className="lg:col-span-1">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Performance por Plataforma</h3>
                <div className="h-64 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius="80%"
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.95)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(10px)',
                          fontSize: '12px'
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Details */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Detalhamento por Plataforma</h3>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white border-opacity-20">
                      <th className="text-left py-2 sm:py-3 px-4 font-medium text-gray-300 text-xs sm:text-sm">Plataforma</th>
                      <th className="text-right py-2 sm:py-3 px-4 font-medium text-gray-300 text-xs sm:text-sm hidden sm:table-cell">Investimento</th>
                      <th className="text-right py-2 sm:py-3 px-4 font-medium text-gray-300 text-xs sm:text-sm">Leads</th>
                      <th className="text-right py-2 sm:py-3 px-4 font-medium text-gray-300 text-xs sm:text-sm hidden md:table-cell">CPL</th>
                      <th className="text-right py-2 sm:py-3 px-4 font-medium text-gray-300 text-xs sm:text-sm">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformData.map((platform, index) => (
                      <tr key={index} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5 transition-colors">
                        <td className="py-3 sm:py-4 px-4">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2 sm:mr-3`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-white font-medium text-xs sm:text-sm">{platform.name}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 sm:py-4 px-4 font-medium text-white text-xs sm:text-sm hidden sm:table-cell">
                          R$ {platform.value.toLocaleString('pt-BR')}
                        </td>
                        <td className="text-right py-3 sm:py-4 px-4 text-gray-300 text-xs sm:text-sm">{platform.leads}</td>
                        <td className="text-right py-3 sm:py-4 px-4 text-gray-300 text-xs sm:text-sm hidden md:table-cell">
                          R$ {(platform.value / platform.leads).toFixed(2)}
                        </td>
                        <td className="text-right py-3 sm:py-4 px-4">
                          <span className="text-green-400 font-medium text-xs sm:text-sm">
                            {(Math.random() * 3 + 2).toFixed(1)}x
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm">Melhor Plataforma</p>
                  <p className="text-white text-lg sm:text-xl font-bold mt-1">Google Ads</p>
                  <p className="text-green-400 text-xs sm:text-sm mt-1">ROAS 5.2x</p>
                </div>
                <ArrowUpRight className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm">Campanha Top</p>
                  <p className="text-white text-lg sm:text-xl font-bold mt-1">Black Friday 2024</p>
                  <p className="text-cyan-400 text-xs sm:text-sm mt-1">186 conversões</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="relative group sm:col-span-2 lg:col-span-1">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm">Taxa de Crescimento</p>
                  <p className="text-white text-lg sm:text-xl font-bold mt-1">+34.2%</p>
                  <p className="text-pink-400 text-xs sm:text-sm mt-1">vs. período anterior</p>
                </div>
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-pink-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}