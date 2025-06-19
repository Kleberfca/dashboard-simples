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
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  if (loading) {
    return <Loading fullScreen text="Carregando integrações..." />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrações</h1>
        <p className="mt-2 text-gray-600">
          Conecte suas plataformas de marketing para sincronizar dados automaticamente
        </p>
      </div>

      {/* Active Integrations */}
      {integrations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Integrações Ativas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">
                        {platformIcons[integration.platform]}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {integration.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {integration.last_sync_at 
                            ? `Sincronizado ${new Date(integration.last_sync_at).toLocaleString('pt-BR')}`
                            : 'Nunca sincronizado'}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(integration.last_sync_status)}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSync(integration.id)}
                      disabled={syncing === integration.id}
                      className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${syncing === integration.id ? 'animate-spin' : ''}`} />
                      Sincronizar
                    </button>
                    <button
                      onClick={() => handleDelete(integration.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Integration */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Adicionar Nova Integração</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(platformNames).map(([platform, name]) => {
            const isConnected = integrations.some(i => i.platform === platform)
            return (
              <button
                key={platform}
                onClick={() => !isConnected && handleAddIntegration(platform as PlatformType)}
                disabled={isConnected}
                className={`group relative rounded-2xl p-6 text-left transition-all ${
                  isConnected 
                    ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                    : 'bg-white hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition duration-300 rounded-2xl blur"
                  style={{
                    background: `linear-gradient(to right, ${platformColors[platform as PlatformType].split(' ')[1]}, ${platformColors[platform as PlatformType].split(' ')[3]})`
                  }}
                ></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl">{platformIcons[platform as PlatformType]}</span>
                    {isConnected && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {isConnected ? 'Conectado' : 'Clique para conectar'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfig && selectedPlatform && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
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