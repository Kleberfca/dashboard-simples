import { useState } from 'react';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';
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
}>> = {
  google_ads: [
    { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Your Google Client ID', required: true },
    { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Your Google Client Secret', required: true },
    { key: 'developer_token', label: 'Developer Token', type: 'password', placeholder: 'Your Developer Token', required: true },
    { key: 'customer_id', label: 'Customer ID', type: 'text', placeholder: 'Google Ads Customer ID', required: true },
  ],
  facebook_ads: [
    { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Your Facebook Access Token', required: true },
    { key: 'ad_account_id', label: 'Ad Account ID', type: 'text', placeholder: 'act_123456789', required: true },
  ],
  instagram_ads: [
    { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Your Instagram Access Token', required: true },
    { key: 'ad_account_id', label: 'Ad Account ID', type: 'text', placeholder: 'act_123456789', required: true },
  ],
  tiktok_ads: [
    { key: 'tiktok_access_token', label: 'Access Token', type: 'password', placeholder: 'Your TikTok Access Token', required: true },
    { key: 'tiktok_advertiser_id', label: 'Advertiser ID', type: 'text', placeholder: 'Your Advertiser ID', required: true },
  ],
  analytics: [
    { key: 'property_id', label: 'Property ID', type: 'text', placeholder: 'GA4 Property ID', required: true },
    { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Your Google Client ID', required: true },
    { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Your Google Client Secret', required: true },
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
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testError, setTestError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const fields = platformFields[platform] || [];

  const handleFieldChange = (key: keyof IntegrationCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
    setTestResult(null);
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
        setTestError(data.error || 'Connection test failed');
      }
    } catch (error) {
      setTestResult('error');
      setTestError('Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!testResult || testResult !== 'success') {
      setTestError('Please test the connection first');
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
        <h3 className="text-lg font-semibold text-gray-900">
          Configure {platformNames[platform]}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Enter your {platformNames[platform]} credentials below. All data is encrypted and stored securely.
        </p>
      </div>

      <div className="space-y-4">
        {fields.map(field => (
          <div key={field.key}>
            <label htmlFor={field.key} className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              id={field.key}
              value={credentials[field.key] || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required={field.required}
            />
          </div>
        ))}
      </div>

      {testResult && (
        <div className={`rounded-md p-4 ${
          testResult === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {testResult === 'success' ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <X className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                testResult === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult === 'success' ? 'Connection successful!' : 'Connection failed'}
              </p>
              {testError && (
                <p className="mt-1 text-sm text-red-700">{testError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={!isValid || testing}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Testing...
            </>
          ) : (
            'Test Connection'
          )}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || testResult !== 'success' || saving}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Saving...
            </>
          ) : (
            'Save Integration'
          )}
        </button>
      </div>
    </div>
  );
}