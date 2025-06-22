// src/app/(dashboard)/campaigns/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, DollarSign, Users, Activity, Filter, RefreshCw, Eye, Pause, Play, MoreVertical, Plus, Edit, Trash2, X } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import DatePicker from '@/components/ui/DatePicker'

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
  const avgROAS = totals.spent > 0 ? ((totals.spent * 4.5) / totals.spent).toFixed(1) : '0'

  // Generate chart data from campaigns
  const performanceData = campaigns.reduce((acc, campaign) => {
    const date = new Date(campaign.metadata?.startDate || Date.now()).toLocaleDateString('pt-BR')
    const existing = acc.find(d => d.date === date)
    
    if (existing) {
      existing.impressoes += campaign.impressions
      existing.cliques += campaign.clicks
      existing.leads += campaign.leads
    } else {
      acc.push({
        date,
        impressoes: campaign.impressions,
        cliques: campaign.clicks,
        leads: campaign.leads
      })
    }
    
    return acc
  }, [] as any[]).slice(-7) // Last 7 data points

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
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <Plus className="h-4 w-4" />
              Nova Campanha
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all backdrop-blur-lg border border-white border-opacity-20"
            >
              <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
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
        {performanceData.length > 0 && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Performance ao Longo do Tempo</h3>
              <div className="h-64 sm:h-72 lg:h-80">
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
                        backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#e2e8f0' }}
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
                          <span>
                            {new Date(campaign.metadata?.startDate).toLocaleDateString('pt-BR')} - 
                            {new Date(campaign.metadata?.endDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-300 mb-1">
                        <span>Orçamento utilizado</span>
                        <span>{((campaign.spent / (campaign.metadata?.budget || 1)) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((campaign.spent / (campaign.metadata?.budget || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-300 mt-1">
                        <span>R$ {(campaign.spent / 1000).toFixed(1)}k</span>
                        <span>R$ {((campaign.metadata?.budget || 0) / 1000).toFixed(1)}k</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-white border-opacity-20">
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
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 [&>option]:text-gray-900"
                  disabled={showEditModal}
                >
                  <option value="google_ads">Google Ads</option>
                  <option value="facebook_ads">Facebook Ads</option>
                  <option value="instagram_ads">Instagram Ads</option>
                  <option value="tiktok_ads">TikTok Ads</option>
                </select>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data Início
                  </label>
                  <DatePicker 
                    value={formData.startDate}
                    onChange={(date) => setFormData({ ...formData, startDate: date })}
                    placeholder="Selecione a data"
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