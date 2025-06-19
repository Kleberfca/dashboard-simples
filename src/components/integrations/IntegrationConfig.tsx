import { useState } from 'react';
import { Check, X, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import type { PlatformType, IntegrationCredentials } from '@/types';

interface IntegrationConfigProps {
  platform: PlatformType;
  onSave: (credentials: IntegrationCredentials) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<IntegrationCredentials>;
}

const platformFields: Record<PlatformType, Array<{
  key: keyof IntegrationCredentials;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  helper?: string;
}>> = {
  google_ads: [
    { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Seu Google Client ID', required: true },
    { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Seu Google Client Secret', required: true },
    { key: 'developer_token', label: 'Developer Token', type: 'password', placeholder: 'Seu Developer Token', required: true },
    { key: 'customer_id', label: 'Customer ID', type: 'text', placeholder: '1234567890', required: true, helper: 'ID de 10 dígitos' },
  ],
  facebook_ads: [
    { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Seu Facebook Access Token', required: true },
    { key: 'ad_account_id', label: 'Ad Account ID', type: 'text', placeholder: 'act_123456789', required: true, helper: 'Deve começar com "act_"' },
  ],
  instagram_ads: [
    { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Seu Instagram Access Token', required: true },
    { key: 'ad_account_id', label: 'Ad Account ID', type: 'text', placeholder: 'act_123456789', required: true, helper: 'Deve começar com "act_"' },
  ],
  tiktok_ads: [
    { key: 'tiktok_access_token', label: 'Access Token', type: 'password', placeholder: 'Seu TikTok Access Token', required: true },
    { key: 'tiktok_advertiser_id', label: 'Advertiser ID', type: 'text', placeholder: 'Seu Advertiser ID', required: true },
  ],
  analytics: [
    { key: 'property_id', label: 'Property ID', type: 'text', placeholder: 'GA4 Property ID', required: true },
    { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Seu Google Client ID', required: true },
    { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Seu Google Client Secret', required: true },
  ],
};

const platformNames: Record<PlatformType, string> = {
  google_ads: 'Google Ads',
  facebook_ads: 'Facebook Ads',
  instagram_ads: 'Instagram Ads',
  tiktok_ads: 'TikTok Ads',
  analytics: 'Google Analytics',
};

export default function IntegrationConfig({
  platform,
  onSave,
  onCancel,
  initialData = {}
}: IntegrationConfigProps) {
  const [credentials, setCredentials] = useState<IntegrationCredentials>(initialData);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testError, setTestError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const fields = platformFields[platform] || [];

  const handleFieldChange = (key: keyof IntegrationCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
    setTestResult(null);
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPassword(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setTestError('');

    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, credentials }),
      });

      const data = await response.json();

      if (data.success) {
        setTestResult('success');
      } else {
        setTestResult('error');
        setTestError(data.error || 'Falha ao testar conexão');
      }
    } catch (error) {
      setTestResult('error');
      setTestError('Erro ao testar conexão');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!testResult || testResult !== 'success') {
      setTestError('Por favor, teste a conexão primeiro');
      return;
    }

    setSaving(true);
    try {
      await onSave(credentials);
    } finally {
      setSaving(false);
    }
  };

  const isValid = fields.every(field => 
    !field.required || credentials[field.key]
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">
          Configurar {platformNames[platform]}
        </h3>
        <p className="mt-2 text-gray-600">
          Insira suas credenciais abaixo. Todos os dados são criptografados.
        </p>
      </div>

      <div className="space-y-4">
        {fields.map(field => (
          <div key={field.key}>
            <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword[field.key] ? 'text' : field.type}
                id={field.key}
                value={credentials[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required={field.required}
              />
              {field.type === 'password' && (
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(field.key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword[field.key] ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
            {field.helper && (
              <p className="mt-1 text-sm text-gray-500">{field.helper}</p>
            )}
          </div>
        ))}
      </div>

      {testResult && (
        <div className={`rounded-lg p-4 ${
          testResult === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {testResult === 'success' ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                testResult === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult === 'success' ? 'Conexão bem-sucedida!' : 'Falha na conexão'}
              </p>
              {testError && (
                <p className="mt-1 text-sm text-red-700">{testError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={!isValid || testing}
          className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {testing ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Testando...
            </>
          ) : (
            'Testar Conexão'
          )}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || testResult !== 'success' || saving}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Salvando...
            </>
          ) : (
            'Salvar Integração'
          )}
        </button>
      </div>
    </div>
  );
}