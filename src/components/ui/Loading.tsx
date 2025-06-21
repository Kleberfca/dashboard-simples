// src/components/ui/Loading.tsx
import { RefreshCw } from 'lucide-react'

interface LoadingProps {
  fullScreen?: boolean
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Loading({ fullScreen = false, text = 'Carregando...', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 rounded-full"></div>
          <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20">
            <div className="flex flex-col items-center">
              <RefreshCw className={`${sizeClasses[size]} animate-spin text-blue-400 mb-4`} />
              <p className={`${textSizeClasses[size]} text-gray-300`}>{text}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center">
        <RefreshCw className={`${sizeClasses[size]} animate-spin text-blue-400 mb-2`} />
        <p className={`${textSizeClasses[size]} text-gray-300`}>{text}</p>
      </div>
    </div>
  )
}