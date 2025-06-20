'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, DollarSign, Users, Activity, Filter, RefreshCw, Eye, Pause, Play, MoreVertical } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Campaign {
  id: string
  name: string
  platform: 'google_ads' | 'facebook_ads' | 'instagram_ads' | 'tiktok_ads'
  status: 'active' | 'paused' | 'ended'
  budget: number
  spent: number
  impressions: number
  clicks: number
  leads: number
  startDate: string
  endDate: string
  ctr: number
  cpl: number
  roas: number
}

const platformIcons = {
  google_ads: '🔍',
  facebook_ads: '📘',
  instagram_ads: '📷',
  tiktok_ads: '🎵'
}

const platformColors = {
  google_ads: 'from-blue-500 to-blue-600',
  facebook_ads: 'from-blue-600 to-indigo-600',
  instagram_ads: 'from-pink-500 to-purple-600',
  tiktok_ads: 'from-gray-800 to-black'
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    if (!loading) setRefreshing(true)
    
    try {
      // Simular busca de dados
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Black Friday 2024 - Search',
          platform: 'google_ads',
          status: 'active',
          budget: 50000,
          spent: 35420,
          impressions: 450000,
          clicks: 12500,
          leads: 186,
          startDate: '2024-11-01',
          endDate: '2024-11-30',
          ctr: 2.78,
          cpl: 190.43,
          roas: 5.2
        },
        {
          id: '2',
          name: 'Remarketing - Carrinho Abandonado',
          platform: 'facebook_ads',
          status: 'active',
          budget: 25000,
          spent: 18750,
          impressions: 320000,
          clicks: 8500,
          leads: 125,
          startDate: '2024-10-15',
          endDate: '2024-12-15',
          ctr: 2.66,
          cpl: 150,
          roas: 4.8
        },
        {
          id: '3',
          name: 'Stories - Lançamento Produto',
          platform: 'instagram_ads',
          status: 'paused',
          budget: 15000,
          spent: 8900,
          impressions: 180000,
          clicks: 4200,
          leads: 65,
          startDate: '2024-09-01',
          endDate: '2024-10-31',
          ctr: 2.33,
          cpl: 136.92,
          roas: 3.9
        },
        {
          id: '4',
          name: 'Trend Challenge #Dashboard',
          platform: 'tiktok_ads',
          status: 'active',
          budget: 20000,
          spent: 12400,
          impressions: 550000,
          clicks: 15000,
          leads: 95,
          startDate: '2024-11-10',
          endDate: '2024-12-10',
          ctr: 2.73,
          cpl: 130.53,
          roas: 4.2
        },
        {
          id: '5',
          name: 'Shopping - Categoria A',
          platform: 'google_ads',
          status: 'ended',
          budget: 30000,
          spent: 30000,
          impressions: 280000,
          clicks: 7800,
          leads: 110,
          startDate: '2024-08-01',
          endDate: '2024-09-30',
          ctr: 2.79,
          cpl: 272.73,
          roas: 3.5
        }
      ]
      
      setCampaigns(mockCampaigns)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    if (selectedPlatform !== 'all' && campaign.platform !== selectedPlatform) return false
    if (selectedStatus !== 'all' && campaign.status !== selectedStatus) return false
    return true
  })

  const totals = filteredCampaigns.reduce((acc, campaign) => ({
    budget: acc.budget + campaign.budget,
    spent: acc.spent + campaign.spent,
    impressions: acc.impressions + campaign.impressions,
    clicks: acc.clicks + campaign.clicks,
    leads: acc.leads + campaign.leads
  }), { budget: 0, spent: 0, impressions: 0, clicks: 0, leads: 0 })

  const avgCTR = totals.impressions > 0 ? (totals.clicks / totals.impressions * 100).toFixed(2) : '0'
  const avgCPL = totals.leads > 0 ? (totals.spent / totals.leads).toFixed(2) : '0'
  const avgROAS = totals.spent > 0 ? ((totals.spent * 4.5) / totals.spent).toFixed(1) : '0'

  // Mock chart data
  const performanceData = [
    { date: '01/11', impressoes: 15000, cliques: 450, leads: 6 },
    { date: '05/11', impressoes: 18000, cliques: 520, leads: 8 },
    { date: '10/11', impressoes: 22000, cliques: 680, leads: 12 },
    { date: '15/11', impressoes: 28000, cliques: 850, leads: 15 },
    { date: '20/11', impressoes: 35000, cliques: 1050, leads: 18 },
    { date: '25/11', impressoes: 42000, cliques: 1250, leads: 22 },
    { date: '30/11', impressoes: 45000, cliques: 1350, leads: 25 }
  ]

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCampaigns()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-300">Carregando campanhas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -m-4 sm:-m-6 p-4 sm:p-6">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Campanhas</h1>
            <p className="text-gray-300 mt-1 text-sm sm:text-base">Gerencie e acompanhe o desempenho de suas campanhas</p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all backdrop-blur-lg border border-white border-opacity-20"
          >
            <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 text-sm sm:text-base bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white [&>option]:text-gray-900"
          >
            <option value="all">Todas as Plataformas</option>
            <option value="google_ads">Google Ads</option>
            <option value="facebook_ads">Facebook Ads</option>
            <option value="instagram_ads">Instagram Ads</option>
            <option value="tiktok_ads">TikTok Ads</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm sm:text-base bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white [&>option]:text-gray-900"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativas</option>
            <option value="paused">Pausadas</option>
            <option value="ended">Finalizadas</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white border-opacity-20">
            <p className="text-xs sm:text-sm text-gray-300">Campanhas</p>
            <p className="text-lg sm:text-xl font-bold text-white">{filteredCampaigns.length}</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white border-opacity-20">
            <p className="text-xs sm:text-sm text-gray-300">Orçamento</p>
            <p className="text-lg sm:text-xl font-bold text-white">R$ {(totals.budget / 1000).toFixed(0)}k</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white border-opacity-20">
            <p className="text-xs sm:text-sm text-gray-300">Gasto</p>
            <p className="text-lg sm:text-xl font-bold text-white">R$ {(totals.spent / 1000).toFixed(0)}k</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white border-opacity-20">
            <p className="text-xs sm:text-sm text-gray-300">Leads</p>
            <p className="text-lg sm:text-xl font-bold text-white">{totals.leads}</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white border-opacity-20">
            <p className="text-xs sm:text-sm text-gray-300">CTR Médio</p>
            <p className="text-lg sm:text-xl font-bold text-white">{avgCTR}%</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white border-opacity-20">
            <p className="text-xs sm:text-sm text-gray-300">CPL Médio</p>
            <p className="text-lg sm:text-xl font-bold text-white">R$ {avgCPL}</p>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Performance Geral</h3>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorImpr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="impressoes" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorImpr)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cliques" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorClicks)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="relative group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${platformColors[campaign.platform]} rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300`}></div>
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Campaign Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{platformIcons[campaign.platform]}</span>
                      <div>
                        <h3 className="font-semibold text-white text-sm sm:text-base">{campaign.name}</h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            campaign.status === 'active' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                            campaign.status === 'paused' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
                            'bg-gray-500 bg-opacity-20 text-gray-300'
                          }`}>
                            {campaign.status === 'active' ? 'Ativa' : 
                             campaign.status === 'paused' ? 'Pausada' : 'Finalizada'}
                          </span>
                          <span>{new Date(campaign.startDate).toLocaleDateString('pt-BR')} - {new Date(campaign.endDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-300 mb-1">
                        <span>Orçamento utilizado</span>
                        <span>{((campaign.spent / campaign.budget) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-300 mt-1">
                        <span>R$ {(campaign.spent / 1000).toFixed(1)}k</span>
                        <span>R$ {(campaign.budget / 1000).toFixed(1)}k</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Metrics */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-300">Impressões</p>
                      <p className="text-sm sm:text-base font-semibold text-white">{(campaign.impressions / 1000).toFixed(0)}k</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-300">Cliques</p>
                      <p className="text-sm sm:text-base font-semibold text-white">{(campaign.clicks / 1000).toFixed(1)}k</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-300">CTR</p>
                      <p className="text-sm sm:text-base font-semibold text-white">{campaign.ctr}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-300">Leads</p>
                      <p className="text-sm sm:text-base font-semibold text-white">{campaign.leads}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-300">CPL</p>
                      <p className="text-sm sm:text-base font-semibold text-white">R$ {campaign.cpl}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-300">ROAS</p>
                      <p className="text-sm sm:text-base font-semibold text-green-400">{campaign.roas}x</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                      <Eye className="h-4 w-4" />
                    </button>
                    {campaign.status === 'active' ? (
                      <button className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                        <Pause className="h-4 w-4" />
                      </button>
                    ) : campaign.status === 'paused' ? (
                      <button className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                        <Play className="h-4 w-4" />
                      </button>
                    ) : null}
                    <button className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}