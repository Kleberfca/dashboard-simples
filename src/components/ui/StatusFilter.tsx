// src/components/ui/StatusFilter.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Activity, Pause, XCircle, Circle } from 'lucide-react'

interface StatusFilterProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const statuses = [
  { value: 'all', label: 'Todos os Status', icon: Circle, color: 'text-gray-400' },
  { value: 'active', label: 'Ativas', icon: Activity, color: 'text-green-400' },
  { value: 'paused', label: 'Pausadas', icon: Pause, color: 'text-yellow-400' },
  { value: 'ended', label: 'Finalizadas', icon: XCircle, color: 'text-red-400' }
]

export default function StatusFilter({ value, onChange, className = '' }: StatusFilterProps) {
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

  const selectedStatus = statuses.find(s => s.value === value) || statuses[0]
  const Icon = selectedStatus.icon

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto px-4 py-2.5 bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white flex items-center justify-between gap-2 hover:bg-opacity-20 transition-all"
      >
        <span className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${selectedStatus.color}`} />
          <span className="text-sm sm:text-base">{selectedStatus.label}</span>
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full sm:w-56 bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-xl shadow-2xl border border-white border-opacity-20 overflow-hidden">
          <div className="py-2">
            {statuses.map((status) => {
              const StatusIcon = status.icon
              return (
                <button
                  key={status.value}
                  onClick={() => {
                    onChange(status.value)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white hover:bg-opacity-10 transition-all ${
                    value === status.value ? 'bg-white bg-opacity-5' : ''
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <StatusIcon className={`h-4 w-4 ${status.color}`} />
                    <span className="text-white text-sm">{status.label}</span>
                  </span>
                  {value === status.value && (
                    <Check className="h-4 w-4 text-blue-400" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}