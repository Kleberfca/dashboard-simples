// src/components/ui/PlatformSelector.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface PlatformSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  compact?: boolean
}

const platforms = [
  { value: 'google_ads', label: 'Google Ads', icon: '🔍', color: 'from-blue-500 to-blue-600' },
  { value: 'facebook_ads', label: 'Facebook Ads', icon: '📘', color: 'from-blue-600 to-indigo-600' },
  { value: 'instagram_ads', label: 'Instagram Ads', icon: '📷', color: 'from-pink-500 to-purple-600' },
  { value: 'tiktok_ads', label: 'TikTok Ads', icon: '🎵', color: 'from-gray-800 to-black' }
]

export default function PlatformSelector({ value, onChange, disabled = false, compact = false }: PlatformSelectorProps) {
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
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 bg-white bg-opacity-10 border border-white border-opacity-20 
          rounded-lg text-white text-left flex items-center justify-between gap-2 
          ${!disabled ? 'hover:bg-opacity-20 cursor-pointer' : 'opacity-50 cursor-not-allowed'} 
          transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none
        `}
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{selectedPlatform.icon}</span>
          <span className="text-sm">{selectedPlatform.label}</span>
        </span>
        {!disabled && <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 w-full bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-xl shadow-2xl border border-white border-opacity-20 overflow-hidden">
          <div className="py-2">
            {platforms.map((platform) => (
              <button
                key={platform.value}
                onClick={() => {
                  onChange(platform.value)
                  setIsOpen(false)
                }}
                className={`
                  w-full px-4 py-3 text-left flex items-center gap-3 
                  hover:bg-white hover:bg-opacity-10 transition-all
                  ${value === platform.value ? 'bg-white bg-opacity-5' : ''}
                `}
              >
                <span className="text-lg">{platform.icon}</span>
                <span className="text-white text-sm flex-1">{platform.label}</span>
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