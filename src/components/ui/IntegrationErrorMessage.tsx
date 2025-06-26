'use client'

import { AlertTriangle, X, RefreshCw } from 'lucide-react'

interface IntegrationErrorMessageProps {
  message: string
  type?: 'error' | 'warning' | 'info'
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  autoHeight?: boolean
}

export default function IntegrationErrorMessage({ 
  message, 
  type = 'error',
  onRetry,
  onDismiss,
  className = '',
  autoHeight = true
}: IntegrationErrorMessageProps) {
  
  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-500 bg-opacity-20',
          border: 'border-red-500 border-opacity-50',
          text: 'text-red-300',
          icon: 'text-red-400'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-500 bg-opacity-20',
          border: 'border-yellow-500 border-opacity-50',
          text: 'text-yellow-300',
          icon: 'text-yellow-400'
        }
      case 'info':
        return {
          bg: 'bg-blue-500 bg-opacity-20',
          border: 'border-blue-500 border-opacity-50',
          text: 'text-blue-300',
          icon: 'text-blue-400'
        }
      default:
        return {
          bg: 'bg-gray-500 bg-opacity-20',
          border: 'border-gray-500 border-opacity-50',
          text: 'text-gray-300',
          icon: 'text-gray-400'
        }
    }
  }

  const typeStyles = getTypeStyles()

  return (
    <div className={`
      ${typeStyles.bg} ${typeStyles.border} ${typeStyles.text}
      border rounded-lg p-4 flex flex-col sm:flex-row items-start gap-3
      ${autoHeight ? 'min-h-0' : 'h-auto'}
      ${className}
    `}>
      {/* Ícone de alerta */}
      <div className="flex-shrink-0">
        <AlertTriangle className={`h-5 w-5 ${typeStyles.icon}`} />
      </div>

      {/* Conteúdo da mensagem */}
      <div className="flex-1 min-w-0">
        <div className="text-sm leading-relaxed break-words">
          {message}
        </div>

        {/* Links ou informações adicionais para erro de credenciais */}
        {type === 'error' && message.toLowerCase().includes('credenciais') && (
          <div className="mt-3 space-y-2">
            <p className="text-xs opacity-75">Como obter as credenciais:</p>
            <ol className="text-xs space-y-1 pl-4 list-decimal opacity-75">
              <li>Acesse o Google Cloud Console</li>
              <li>Crie um novo projeto ou selecione um existente</li>
              <li>Ative a API do Google Ads</li>
              <li>Crie credenciais OAuth 2.0</li>
              <li>Obtenha o Developer Token no Centro de API do Google Ads</li>
            </ol>
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-white bg-opacity-10 hover:bg-opacity-20 transition-all border border-white border-opacity-20"
            title="Tentar novamente"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Tentar Novamente</span>
            <span className="sm:hidden">Tentar</span>
          </button>
        )}

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex items-center justify-center p-1.5 rounded-md hover:bg-white hover:bg-opacity-10 transition-all"
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}