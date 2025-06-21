// src/components/integrations/IntegrationConfig.tsx
'use client'

import { useState } from 'react'
import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import type { PlatformType, IntegrationCredentials } from '@/types'

interface IntegrationConfigProps {
  platform: PlatformType
  onSave: (credentials: IntegrationCredentials) => void
  onCancel: () => void
  initialValues?: IntegrationCredentials
}

const platformFields: Record<PlatformType, Array<{
  name: keyof IntegrationCredentials
  label: string
  type: string
  placeholder: string
  required: boolean
}>> = {
  google_ads: [
    { name: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Ex: 123456789', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', placeholder: '••••••••', required: true },
    { name: 'developer_token', label: 'Developer Token', type: 'password', placeholder: '••••••••', required: true },
    { name: 'customer_id', label: 'Customer ID', type: 'text', placeholder: 'Ex: 1234567890', required: true }
  ],
  facebook_ads: [
    { name: 'access_token', label: 'Access Token', type: 'password', placeholder: '••••••••', required: true },
    { name: 'app_id', label: 'App ID', type: 'text', placeholder: 'Ex: 123456789', required: true },
    { name: 'app_secret', label: 'App Secret', type: 'password', placeholder: '••••••••', required: true },
    { name: 'ad_account_id', label: 'Ad Account ID', type: 'text', placeholder: 'Ex: act_123456789', required: true }
  ],
  instagram_ads: [
    { name: 'access_token', label: 'Access Token', type: 'password', placeholder: '••••••••', required: true },
    { name: 'app_id', label: 'App ID', type: 'text', placeholder: 'Ex: 123456789', required: true },
    { name: 'app_secret', label: 'App Secret', type: 'password', placeholder: '••••••••', required: true },
    { name: 'ad_account_id', label: 'Ad Account ID', type: 'text', placeholder: 'Ex: act_123456789', required: true }
  ],
  tiktok_ads: [
    { name: 'tiktok_access_token', label: 'Access Token', type: 'password', placeholder: '••••••••', required: true },
    { name: 'tiktok_advertiser_id', label: 'Advertiser ID', type: 'text', placeholder: 'Ex: 123456789', required: true }
  ],
  analytics: [
    { name: 'property_id', label: 'Property ID', type: 'text', placeholder: 'Ex: 123456789', required: true },
    { name: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Ex: 123456789.apps.googleusercontent.com', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', placeholder: '••••••••', required: true }
  ]
}

const platformNames = {
  google_ads: 'Google Ads',
  facebook_ads: 'Facebook Ads',
  instagram_ads: 'Instagram Ads',
  tiktok_ads: 'TikTok Ads',
  analytics: 'Google Analytics'
}

export default function IntegrationConfig({ 
  platform, 
  onSave, 
  onCancel, 
  initialValues = {} 
}: IntegrationConfigProps) {
  const [credentials, setCredentials] = useState<IntegrationCredentials>(initialValues)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const fields = platformFields[platform] || []

  const handleChange = (fieldName: keyof IntegrationCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [fieldName]: value }))
    setTestResult(null)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, credentials })
      })

      const result = await response.json()
      
      setTestResult({
        success: result.success,
        message: result.success 
          ? 'Conexão realizada com sucesso!' 
          : result.error || 'Falha ao conectar. Verifique as credenciais.'
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro ao testar conexão. Tente novamente.'
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    // Validar campos obrigatórios
    const missingFields = fields
      .filter(field => field.required && !credentials[field.name])
      .map(field => field.label)

    if (missingFields.length > 0) {
      setTestResult({
        success: false,
        message: `Preencha os campos obrigatórios: ${missingFields.join(', ')}`
      })
      return
    }

    setSaving(true)
    onSave(credentials)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Configurar {platformNames[platform]}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={credentials[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}
      </div>

      {testResult && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          testResult.success 
            ? 'bg-green-500 bg-opacity-20 border border-green-500 border-opacity-40' 
            : 'bg-red-500 bg-opacity-20 border border-red-500 border-opacity-40'
        }`}>
          {testResult.success ? (
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          )}
          <p className={`text-sm ${testResult.success ? 'text-green-300' : 'text-red-300'}`}>
            {testResult.message}
          </p>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          onClick={handleTest}
          disabled={testing || saving}
          className="px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg hover:bg-opacity-20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {testing && <Loader2 className="h-4 w-4 animate-spin" />}
          Testar Conexão
        </button>
        <button
          onClick={handleSave}
          disabled={saving || testing}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar Integração
        </button>
      </div>

      <div className="mt-6 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10">
        <h3 className="text-sm font-semibold text-white mb-2">Como obter as credenciais?</h3>
        <ul className="space-y-1 text-xs text-gray-300">
          {platform === 'google_ads' && (
            <>
              <li>1. Acesse o <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Cloud Console</a></li>
              <li>2. Crie um novo projeto ou selecione um existente</li>
              <li>3. Ative a API do Google Ads</li>
              <li>4. Crie credenciais OAuth 2.0</li>
              <li>5. Obtenha o Developer Token no Centro de API do Google Ads</li>
            </>
          )}
          {(platform === 'facebook_ads' || platform === 'instagram_ads') && (
            <>
              <li>1. Acesse o <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Facebook for Developers</a></li>
              <li>2. Crie um novo app ou use um existente</li>
              <li>3. Configure as permissões de Marketing API</li>
              <li>4. Gere um token de acesso de longo prazo</li>
              <li>5. Copie o ID da conta de anúncios do Business Manager</li>
            </>
          )}
          {platform === 'tiktok_ads' && (
            <>
              <li>1. Acesse o <a href="https://ads.tiktok.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">TikTok Ads Manager</a></li>
              <li>2. Vá em Ferramentas → API de Marketing</li>
              <li>3. Crie um novo app</li>
              <li>4. Gere o token de acesso</li>
              <li>5. Copie o Advertiser ID da conta</li>
            </>
          )}
          {platform === 'analytics' && (
            <>
              <li>1. Acesse o <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Cloud Console</a></li>
              <li>2. Ative a Google Analytics Data API</li>
              <li>3. Crie credenciais OAuth 2.0</li>
              <li>4. Obtenha o Property ID no Google Analytics</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}