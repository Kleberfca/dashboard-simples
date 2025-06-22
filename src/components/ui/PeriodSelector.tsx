'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react'

interface PeriodOption {
  value: string
  label: string
  days?: number
}

interface PeriodSelectorProps {
  value: string
  onChange: (value: string, customDates?: { start: string; end: string }) => void
  showCustom?: boolean
}

const periodOptions: PeriodOption[] = [
  { value: 'daily', label: 'Diário' },
  { value: '7', label: 'Últimos 7 dias', days: 7 },
  { value: '30', label: 'Últimos 30 dias', days: 30 },
  { value: '90', label: 'Últimos 90 dias', days: 90 },
  { value: 'custom', label: 'Personalizado' }
]

export default function PeriodSelector({ value, onChange, showCustom = false }: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customDates, setCustomDates] = useState({ start: '', end: '' })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = periodOptions.find(opt => opt.value === value) || periodOptions[2] // Default to 30 days

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowDatePicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option: PeriodOption) => {
    if (option.value === 'custom') {
      setShowDatePicker(true)
      setIsOpen(false)
    } else {
      onChange(option.value)
      setIsOpen(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Dias do mês anterior
    for (let i = startingDayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, month, -i + 1)
      days.push({ date: prevDate, isCurrentMonth: false })
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }
    
    // Dias do próximo mês
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }
    
    return days
  }

  const handleDateSelect = (type: 'start' | 'end', date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    if (type === 'start') {
      setCustomDates({ ...customDates, start: dateStr })
    } else {
      setCustomDates({ ...customDates, end: dateStr })
    }
  }

  const handleApplyCustom = () => {
    if (customDates.start && customDates.end) {
      onChange('custom', customDates)
      setShowDatePicker(false)
    }
  }

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm sm:text-base bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-lg text-white hover:bg-opacity-20 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className="whitespace-nowrap">{selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-xl shadow-2xl border border-white border-opacity-20 overflow-hidden">
          <div className="py-2">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white hover:bg-opacity-10 transition-all ${
                  value === option.value ? 'bg-white bg-opacity-5' : ''
                }`}
              >
                <span className="text-white text-sm">{option.label}</span>
                {value === option.value && (
                  <Check className="h-4 w-4 text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {showDatePicker && (
        <div className="absolute right-0 z-50 mt-2 w-full sm:w-96 bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-xl shadow-2xl border border-white border-opacity-20 overflow-hidden">
          <div className="p-4 border-b border-white border-opacity-10">
            <h4 className="text-white font-semibold">Período Personalizado</h4>
          </div>
          
          <div className="p-4">
            {/* Date inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Data Inicial</label>
                <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-3 py-2 text-white text-sm">
                  {customDates.start || 'Selecione'}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Data Final</label>
                <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-3 py-2 text-white text-sm">
                  {customDates.end || 'Selecione'}
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white bg-opacity-5 rounded-lg p-3">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => handleMonthChange('prev')}
                  className="p-1 hover:bg-white hover:bg-opacity-10 rounded transition-all"
                >
                  <ChevronLeft className="h-4 w-4 text-white" />
                </button>
                <h5 className="text-white font-medium text-sm capitalize">
                  {monthNames[currentMonth.getMonth()]} de {currentMonth.getFullYear()}
                </h5>
                <button
                  onClick={() => handleMonthChange('next')}
                  className="p-1 hover:bg-white hover:bg-opacity-10 rounded transition-all"
                >
                  <ChevronRight className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Week days */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, index) => (
                  <div key={index} className="text-center text-xs text-gray-400 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((day, index) => {
                  const isSelected = 
                    (customDates.start && day.date.toISOString().split('T')[0] === customDates.start) ||
                    (customDates.end && day.date.toISOString().split('T')[0] === customDates.end)
                  const isInRange = 
                    customDates.start && customDates.end &&
                    day.date >= new Date(customDates.start) &&
                    day.date <= new Date(customDates.end)
                  const isToday = day.date.toDateString() === new Date().toDateString()

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (!day.isCurrentMonth) return
                        if (!customDates.start || (customDates.start && customDates.end)) {
                          setCustomDates({ start: day.date.toISOString().split('T')[0], end: '' })
                        } else {
                          handleDateSelect('end', day.date)
                        }
                      }}
                      disabled={!day.isCurrentMonth}
                      className={`
                        p-2 text-xs rounded-lg transition-all
                        ${!day.isCurrentMonth ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-white hover:bg-opacity-10'}
                        ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                        ${isInRange && !isSelected ? 'bg-blue-500 bg-opacity-20' : ''}
                        ${isToday && !isSelected ? 'border border-blue-400' : ''}
                      `}
                    >
                      {day.date.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowDatePicker(false)
                  setCustomDates({ start: '', end: '' })
                }}
                className="flex-1 px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyCustom}
                disabled={!customDates.start || !customDates.end}
                className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}