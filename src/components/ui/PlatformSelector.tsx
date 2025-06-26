'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Platform {
  value: string
  label: string
  icon: string
  color: string
}

interface PlatformSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

const platforms: Platform[] = [
  { 
    value: 'google_ads', 
    label: 'Google Ads', 
    icon: '🔍',
    color: 'bg-blue-500'
  },
  { 
    value: 'facebook_ads', 
    label: 'Facebook Ads', 
    icon: '📘',
    color: 'bg-blue-600'
  },
  { 
    value: 'instagram_ads', 
    label: 'Instagram Ads', 
    icon: '📷',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  { 
    value: 'tiktok_ads', 
    label: 'TikTok Ads', 
    icon: '🎵',
    color: 'bg-black'
  }
]

export default function PlatformSelector({ 
  value, 
  onChange, 
  className = '',
  placeholder = 'Selecione uma plataforma'
}: PlatformSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const selectedPlatform = platforms.find(p => p.value === value)

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calcular posição do dropdown para evitar overflow
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownHeight = platforms.length * 60 + 16 // altura estimada
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      
      // Se não há espaço suficiente embaixo e há mais espaço acima, abrir para cima
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
  }, [isOpen])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (platform: Platform) => {
    onChange(platform.value)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botão do seletor */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg 
          text-left flex items-center justify-between hover:bg-opacity-20 transition-all
          ${isOpen ? 'border-blue-500 bg-opacity-20' : ''}
        `}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedPlatform ? (
            <>
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0
                ${selectedPlatform.color}
              `}>
                {selectedPlatform.icon}
              </div>
              <span className="text-white truncate">{selectedPlatform.label}</span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown responsivo */}
      {isOpen && (
        <>
          {/* Backdrop para mobile */}
          {isMobile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
          )}
          
          {/* Lista de plataformas */}
          <div 
            className={`
              ${isMobile 
                ? 'fixed left-4 right-4 z-50 max-h-[70vh] overflow-y-auto' 
                : `absolute z-50 w-full ${dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`
              }
              bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-xl shadow-2xl border border-white border-opacity-20 overflow-hidden
            `}
            style={isMobile ? { 
              top: '50%', 
              transform: 'translateY(-50%)' 
            } : {}}
          >
            {/* Header para mobile */}
            {isMobile && (
              <div className="bg-white bg-opacity-5 p-4 border-b border-white border-opacity-10 sticky top-0">
                <h3 className="text-white font-semibold text-center">Selecionar Plataforma</h3>
              </div>
            )}

            {/* Lista de opções */}
            <div className="py-2">
              {platforms.map((platform) => (
                <button
                  key={platform.value}
                  onClick={() => handleSelect(platform)}
                  className={`
                    w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white hover:bg-opacity-10 transition-all
                    ${value === platform.value ? 'bg-white bg-opacity-5' : ''}
                  `}
                >
                  {/* Ícone da plataforma */}
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0
                    ${platform.color}
                  `}>
                    {platform.icon}
                  </div>

                  {/* Nome da plataforma */}
                  <span className="text-white flex-1">{platform.label}</span>

                  {/* Indicador de seleção */}
                  {value === platform.value && (
                    <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Footer para mobile */}
            {isMobile && (
              <div className="bg-white bg-opacity-5 p-4 border-t border-white border-opacity-10 sticky bottom-0">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-2 border border-white border-opacity-30 text-white rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}