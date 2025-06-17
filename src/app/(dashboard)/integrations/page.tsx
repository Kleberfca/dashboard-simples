'use client'

import { useState, useEffect } from 'react'
import { Plus, Settings, Trash2, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
import IntegrationConfig from '@/components/integrations/IntegrationConfig'
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
      
      // Refresh integrations to show updated status
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
        <p className="mt-1 text-sm text-gray-500">
          Conecte suas plataformas de marketing para sincronizar dados automaticamente
        </p>
      </div>

      {/* Active Integrations */}
      {integrations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Integrações Ativas</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {integrations.map((integration) => (
                <li key={integration.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {platformIcons[integration.platform]}
                      </span>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {integration.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {integration.last_sync_at 
                            ? `Última sincronização: ${new Date(integration.last_sync_at).toLocaleString('pt-BR')}`
                            : 'Nunca sincronizado'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(integration.last_sync_status)}
                      <button
                        onClick={() => handleSync(integration.id)}
                        disabled={syncing === integration.id}
                        className="p-2 text-gray-400 hover:text-blue-600 disabled:opacity-50"
                        title="Sincronizar agora"
                      >
                        <RefreshCw className={`h-5 w-5 ${syncing === integration.id ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(integration.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Remover integração"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Add New Integration */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Adicionar Nova Integração</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(platformNames).map(([platform, name]) => {
            const isConnected = integrations.some(i => i.platform === platform)
            return (
              <button
                key={platform}
                onClick={() => !isConnected && handleAddIntegration(platform as PlatformType)}
                disabled={isConnected}
                className={`relative rounded-lg border p-6 text-left hover:border-gray-400 ${
                  isConnected ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{platformIcons[platform as PlatformType]}</span>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {isConnected ? 'Conectado' : 'Clique para conectar'}
                    </p>
                  </div>
                </div>
                {isConnected && (
                  <CheckCircle className="absolute top-4 right-4 h-5 w-5 text-green-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfig && selectedPlatform && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
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