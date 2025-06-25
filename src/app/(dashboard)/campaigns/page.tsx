// src/app/(dashboard)/campaigns/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, DollarSign, Users, Activity, Filter, RefreshCw, Eye, Pause, Play, MoreVertical, Plus, Edit, Trash2, X } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import DatePicker from '@/components/ui/DatePicker'
import PlatformFilter from '@/components/ui/PlatformFilter'
import StatusFilter from '@/components/ui/StatusFilter'
import ChartTypeSelector from '@/components/ui/ChartTypeSelector'
import PlatformSelector from '@/components/ui/PlatformSelector'

interface Campaign {
  id: string
  name: string
  platform: 'google_ads' | 'facebook_ads' | 'instagram_ads' | 'tiktok_ads'
  status: 'active' | 'paused' | 'ended'
  metadata: {
    budget: number
    startDate: string
    endDate: string
  }
  impressions: number
  clicks: number
  spent: number
  leads: number
  revenue: number
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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [formData, setFormData] = useState({
    name: '',
    platform: 'google_ads',
    budget: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchCampaigns()
  }, [selectedPlatform, selectedStatus])

  const fetchCampaigns = async () => {
    if (!loading) setRefreshing(true)
    
    try {
      const params = new URLSearchParams()
      if (selectedPlatform !== 'all') params.append('platform', selectedPlatform)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      
      const response = await fetch(`/api/campaigns?${params}`)
      const data = await response.json()
      
      if (data.campaigns) {
        setCampaigns(data.campaigns)
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleCreateCampaign = async () => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          platform: formData.platform,
          budget: parseFloat(formData.budget),
          startDate: formData.startDate,
          endDate: formData.endDate
        })
      })

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({ name: '', platform: 'google_ads', budget: '', startDate: '', endDate: '' })
        await fetchCampaigns()
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  const handleUpdateCampaign = async () => {
    if (!selectedCampaign) return

    try {
      const response = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedCampaign.id,
          name: formData.name,
          metadata: {
            ...selectedCampaign.metadata,
            budget: parseFloat(formData.budget),
            startDate: formData.startDate,
            endDate: formData.endDate
          }
        })
      })

      if (response.ok) {
        setShowEditModal(false)
        setSelectedCampaign(null)
        await fetchCampaigns()
      }
    } catch (error) {
      console.error('Error updating campaign:', error)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta campanha?')) return

    try {
      const response = await fetch(`/api/campaigns?id=${campaignId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCampaigns()
      }
    } catch (error) {
      console.error('Error deleting campaign:', error)
    }
  }

  const handleStatusToggle = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    
    try {
      const response = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: campaign.id,
          status: newStatus
        })
      })

      if (response.ok) {
        await fetchCampaigns()
      }
    } catch (error) {
      console.error('Error updating campaign status:', error)
    }
  }

  const filteredCampaigns = campaigns

  const totals = filteredCampaigns.reduce((acc, campaign) => ({
    budget: acc.budget + (campaign.metadata?.budget || 0),
    spent: acc.spent + campaign.spent,
    impressions: acc.impressions + campaign.impressions,
    clicks: acc.clicks + campaign.clicks,
    leads: acc.leads + campaign.leads
  }), { budget: 0, spent: 0, impressions: 0, clicks: 0, leads: 0 })

  const avgCTR = totals.impressions > 0 ? (totals.clicks / totals.impressions * 100).toFixed(2) : '0'
  const avgCPL = totals.leads > 0 ? (totals.spent / totals.leads).toFixed(2) : '0'
  const avgROAS = totals.spent > 0 ? (filteredCampaigns.reduce((acc, c) => acc + c.revenue, 0) / totals.spent).toFixed(2) : '0'

  // Mock chart data
  const chartData = [
    { date: '01/01', impressoes: 45000, cliques: 1200 },
    { date: '02/01', impressoes: 52000, cliques: 1400 },
    { date: '03/01', impressoes: 48000, cliques: 1300 },
    { date: '04/01', impressoes: 61000, cliques: 1600 },
    { date: '05/01', impressoes: 58000, cliques: 1500 },
    { date: '06/01', impressoes: 65000, cliques: 1700 },
    { date: '07/01', impressoes: 72000, cliques: 1900 }
  ]

  // Mock data para gráfico de barras
  const barChartData = [
    { plataforma: 'Google Ads', investimento: 45000, leads: 120, roas: 4.5 },
    { plataforma: 'Facebook Ads', investimento: 35000, leads: 85, roas: 3.8 },
    { plataforma: 'Instagram Ads', investimento: 25000, leads: 65, roas: 3.2 },
    { plataforma: 'TikTok Ads', investimento: 15000, leads: 40, roas: 2.9 }
  ]

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
                {entry.name}: {entry.value.toLocaleString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando campanhas...</p>
        </div>
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Campanhas</h1>
            <p className="text-gray-300 mt-1 text-sm sm:text-base">Gerencie e acompanhe suas campanhas de marketing</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Campanha</span>
              <span className="sm:hidden">Nova</span>
            </button>
            
            <button
              onClick={fetchCampaigns}
              disabled={refreshing}
              className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all backdrop-blur-lg border border-white border-opacity-20"
            >
              <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <PlatformFilter
            value={selectedPlatform}
            onChange={setSelectedPlatform}
            className="w-full sm:w-auto"
          />
          
          <StatusFilter
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="w-full sm:w-auto"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white border-opacity-20">
            <p className="text-xs sm:text-sm text-gray-300">Campanhas</p>
            <p className="text-lg sm:text-xl font-bold text-white">{filteredCampaigns.length}</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white border-opacity-20">
            <p className="text-xs sm:text-sm text-gray-300">Orçamento Total</p>
            <p className="text-lg sm:text-xl font-bold text-white">R$ {totals.budget.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white border-opacity-20">
            <p className="text-xs sm:text-sm text-gray-300">Gasto Total</p>
            <p className="text-lg sm:text-xl font-bold text-white">R$ {totals.spent.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white border-opacity-20">
            <p className="text-xs sm:text-sm text-gray-300">Leads Totais</p>
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

        {/* Performance Charts */}
        {filteredCampaigns.length > 0 && (
          <>
            {/* Gráfico Principal - Evolução Temporal */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Performance Geral</h3>
                  <ChartTypeSelector value={chartType} onChange={setChartType} />
                </div>
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorImpr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
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
                    ) : (
                      <BarChart data={chartData}>
                        <defs>
                          <linearGradient id="colorBar1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.4}/>
                          </linearGradient>
                          <linearGradient id="colorBar2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar 
                          dataKey="impressoes" 
                          fill="url(#colorBar1)" 
                          name="Impressões"
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar 
                          dataKey="cliques" 
                          fill="url(#colorBar2)" 
                          name="Cliques"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Gráfico de Barras por Plataforma */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Comparativo por Plataforma</h3>
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <defs>
                        <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.4}/>
                        </linearGradient>
                        <linearGradient id="colorLeads2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.4}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="plataforma" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                      <Bar 
                        dataKey="investimento" 
                        fill="url(#colorInvest)" 
                        name="Investimento (R$)"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar 
                        dataKey="leads" 
                        fill="url(#colorLeads2)" 
                        name="Leads"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

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
                          <span>•</span>
                          <span>Orçamento: R$ {campaign.metadata?.budget?.toLocaleString('pt-BR') || '0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-300">Gasto</p>
                      <p className="text-sm sm:text-base font-semibold text-white">R$ {campaign.spent.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-300">CTR</p>
                      <p className="text-sm sm:text-base font-semibold text-white">{campaign.ctr}%</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-gray-300">Cliques</p>
                      <p className="text-sm sm:text-base font-semibold text-white">{campaign.clicks.toLocaleString('pt-BR')}</p>
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
                    {campaign.status !== 'ended' && (
                      <button
                        onClick={() => handleStatusToggle(campaign)}
                        className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all"
                        title={campaign.status === 'active' ? 'Pausar' : 'Ativar'}
                      >
                        {campaign.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCampaign(campaign)
                        setFormData({
                          name: campaign.name,
                          platform: campaign.platform,
                          budget: campaign.metadata?.budget.toString() || '',
                          startDate: campaign.metadata?.startDate || '',
                          endDate: campaign.metadata?.endDate || ''
                        })
                        setShowEditModal(true)
                      }}
                      className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="p-2 text-red-400 hover:bg-red-400 hover:bg-opacity-10 rounded-lg transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Nenhuma campanha encontrada</h3>
            <p className="text-gray-300 mb-4">Crie sua primeira campanha para começar a acompanhar o desempenho.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <Plus className="h-4 w-4" />
              Criar Campanha
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Campaign Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-white border-opacity-20 my-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                {showCreateModal ? 'Nova Campanha' : 'Editar Campanha'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                  setSelectedCampaign(null)
                  setFormData({ name: '', platform: 'google_ads', budget: '', startDate: '', endDate: '' })
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome da Campanha
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Black Friday 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plataforma
                </label>
                <PlatformSelector
                  value={formData.platform}
                  onChange={(value) => setFormData({ ...formData, platform: value })}
                  disabled={showEditModal}
                  compact={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Orçamento Total (R$)
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 50000"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data Início
                  </label>
                  <DatePicker 
                    value={formData.startDate}
                    onChange={(date) => setFormData({ ...formData, startDate: date })}
                    placeholder="Selecione a data"
                    className="relative z-[60]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data Fim
                  </label>
                  <DatePicker 
                    value={formData.endDate}
                    onChange={(date) => setFormData({ ...formData, endDate: date })}
                    placeholder="Selecione a data"
                    className="relative z-[60]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={showCreateModal ? handleCreateCampaign : handleUpdateCampaign}
                disabled={!formData.name || !formData.budget}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showCreateModal ? 'Criar Campanha' : 'Salvar Alterações'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                  setSelectedCampaign(null)
                  setFormData({ name: '', platform: 'google_ads', budget: '', startDate: '', endDate: '' })
                }}
                className="px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg hover:bg-opacity-20 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}