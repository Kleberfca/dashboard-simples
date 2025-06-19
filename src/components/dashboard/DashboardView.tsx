'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, DollarSign, Users, MousePointer, Eye, Activity, RefreshCw } from 'lucide-react'
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
    return <Loading fullScreen text="Carregando dashboard..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do desempenho das suas campanhas</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <KPICard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolução de Métricas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorInvestimento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="investimento" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorInvestimento)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#8B5CF6" 
                  fillOpacity={1} 
                  fill="url(#colorLeads)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Performance */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance por Plataforma</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Details */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Detalhamento por Plataforma</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Plataforma</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Investimento</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Leads</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">CPL</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {platformData.map((platform, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      {platform.name}
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 font-medium">R$ {platform.value.toLocaleString('pt-BR')}</td>
                  <td className="text-right py-4 px-4">{platform.leads}</td>
                  <td className="text-right py-4 px-4">R$ {(platform.value / platform.leads).toFixed(2)}</td>
                  <td className="text-right py-4 px-4 text-green-600 font-medium">
                    {(Math.random() * 3 + 2).toFixed(1)}x
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}