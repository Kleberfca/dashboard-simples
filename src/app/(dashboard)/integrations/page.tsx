'use client'

import { useState, useEffect } from 'react'
import { Plus, Settings, Trash2, RefreshCw, CheckCircle, XCircle, Clock, Zap } from 'lucide-react'
import IntegrationConfig from '@/components/integrations/IntegrationConfig'
import Loading from '@/components/ui/Loading'
import type { IntegrationConfig as IntegrationType, PlatformType } from '@/types'

const platformIcons = {
  google_ads: '🔍',
  facebook_ads: '📘',
  instagram_ads: '📷',
  tiktok_ads: '🎵',
  analytics: '📊'
}

const platformNames = {
  google_ads: 'Google Ads',
  facebook_ads: 'Facebook Ads',
  instagram_ads: 'Instagram Ads',
  tiktok_ads: 'TikTok Ads',
  analytics: 'Google Analytics'
}

const platformColors = {
  google_ads: 'from-blue-500 to-blue-600',
  facebook_ads: 'from-blue-600 to-indigo-600',
  instagram_ads: 'from-pink-500 to-purple-600',
  tiktok_ads: 'from-gray-800 to-black',
  analytics: 'from-orange-500 to-red-600'
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationType[]>([])
  const [showConfig, setShowConfig] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations')
      const data = await response.json()
      setIntegrations(data.integrations || [])
    } catch (error) {
      console.error('Error fetching integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddIntegration = (platform: PlatformType) => {
    setSelectedPlatform(platform)
    setShowConfig(true)
  }

  const handleSaveIntegration = async (credentials: any) => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          credentials,
          name: platformNames[selectedPlatform!]
        })
      })

      if (response.ok) {
        await fetchIntegrations()
        setShowConfig(false)
        setSelectedPlatform(null)
      }
    } catch (error) {
      console.error('Error saving integration:', error)
    }
  }

  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId)
    try {
      await fetch('/api/sync/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId })
      })
      
      await fetchIntegrations()
    } catch (error) {
      console.error('Error syncing:', error)
    } finally {
      setSyncing(null)
    }
  }

  const handleDelete = async (integrationId: string) => {
    if (!confirm('Tem certeza que deseja remover esta integração?')) return

    try {
      await fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE'
      })
      await fetchIntegrations()
    } catch (error) {
      console.error('Error deleting integration:', error)
    }
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-400" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-400 animate-pulse" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loading fullScreen text="Carregando integrações..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -m-6 p-6">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white">Integrações</h1>
          <p className="mt-2 text-gray-300">
            Conecte suas plataformas de marketing para sincronizar dados automaticamente
          </p>
        </div>

        {/* Active Integrations */}
        {integrations.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Integrações Ativas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">
                          {platformIcons[integration.platform]}
                        </span>
                        <div>
                          <h3 className="font-semibold text-white">
                            {integration.name}
                          </h3>
                          <p className="text-sm text-gray-300">
                            {integration.last_sync_at 
                              ? `Última sync: ${new Date(integration.last_sync_at).toLocaleDateString('pt-BR')}`
                              : 'Nunca sincronizado'}
                          </p>
                        </div>
                      </div>
                      {getStatusIcon(integration.last_sync_status)}
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleSync(integration.id)}
                        disabled={syncing === integration.id}
                        className="flex items-center px-3 py-1 bg-blue-500 bg-opacity-20 hover:bg-opacity-30 text-blue-300 rounded-lg transition-all text-sm"
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${syncing === integration.id ? 'animate-spin' : ''}`} />
                        Sincronizar
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-white transition-colors">
                          <Settings className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(integration.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Integration */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Adicionar Nova Integração</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Object.entries(platformNames).map(([platform, name]) => {
              const isConnected = integrations.some(i => i.platform === platform)
              return (
                <button
                  key={platform}
                  onClick={() => !isConnected && handleAddIntegration(platform as PlatformType)}
                  disabled={isConnected}
                  className={`relative group ${
                    isConnected 
                      ? 'cursor-not-allowed' 
                      : 'hover:scale-105'
                  } transition-all duration-200`}
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${platformColors[platform as PlatformType]} rounded-2xl blur ${
                    isConnected ? 'opacity-10' : 'opacity-30 group-hover:opacity-50'
                  } transition duration-300`}></div>
                  <div className={`relative ${
                    isConnected 
                      ? 'bg-gray-800 bg-opacity-50' 
                      : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  } backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 transition-all`}>
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-4xl mb-3">{platformIcons[platform as PlatformType]}</span>
                      {isConnected && (
                        <CheckCircle className="h-5 w-5 text-green-400 absolute top-2 right-2" />
                      )}
                      <h3 className="font-semibold text-white">{name}</h3>
                      <p className="text-sm text-gray-300 mt-1">
                        {isConnected ? 'Conectado' : 'Clique para conectar'}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfig && selectedPlatform && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white border-opacity-20">
            <IntegrationConfig
              platform={selectedPlatform}
              onSave={handleSaveIntegration}
              onCancel={() => {
                setShowConfig(false)
                setSelectedPlatform(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}