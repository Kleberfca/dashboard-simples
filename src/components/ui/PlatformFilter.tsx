// src/components/ui/PlatformFilter.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface PlatformFilterProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const platforms = [
  { value: 'all', label: 'Todas as Plataformas', icon: '🌐' },
  { value: 'google_ads', label: 'Google Ads', icon: '🔍' },
  { value: 'facebook_ads', label: 'Facebook Ads', icon: '📘' },
  { value: 'instagram_ads', label: 'Instagram Ads', icon: '📷' },
  { value: 'tiktok_ads', label: 'TikTok Ads', icon: '🎵' }
]

export default function PlatformFilter({ value, onChange, className = '' }: PlatformFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedPlatform = platforms.find(p => p.value === value) || platforms[0]

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto px-4 py-2.5 bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white flex items-center justify-between gap-2 hover:bg-opacity-20 transition-all"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{selectedPlatform.icon}</span>
          <span className="text-sm sm:text-base">{selectedPlatform.label}</span>
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full sm:w-64 bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-xl shadow-2xl border border-white border-opacity-20 overflow-hidden">
          <div className="py-2">
            {platforms.map((platform) => (
              <button
                key={platform.value}
                onClick={() => {
                  onChange(platform.value)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white hover:bg-opacity-10 transition-all ${
                  value === platform.value ? 'bg-white bg-opacity-5' : ''
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">{platform.icon}</span>
                  <span className="text-white text-sm">{platform.label}</span>
                </span>
                {value === platform.value && (
                  <Check className="h-4 w-4 text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}