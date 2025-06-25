'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown, Check, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface PeriodSelectorProps {
  value: string
  onChange: (value: string, customDates?: { start: string; end: string }) => void
  showCustom?: boolean
}

const periodOptions = [
  { value: 'daily', label: 'Hoje' },
  { value: '7', label: 'Últimos 7 dias' },
  { value: '15', label: 'Últimos 15 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '60', label: 'Últimos 60 dias' },
  { value: '90', label: 'Últimos 90 dias' }
]

export default function PeriodSelector({ value, onChange, showCustom = false }: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customDates, setCustomDates] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [selectingDate, setSelectingDate] = useState<'start' | 'end'>('start')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isMobile, setIsMobile] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = value === 'custom' 
    ? { value: 'custom', label: 'Período Personalizado' }
    : periodOptions.find(opt => opt.value === value) || periodOptions[3]

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        if (!showDatePicker) {
          setCustomDates({ start: '', end: '' })
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDatePicker])

  const handleSelect = (option: { value: string; label: string }) => {
    if (option.value === 'custom' && showCustom) {
      setShowDatePicker(true)
      setSelectingDate('start')
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

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    
    if (selectingDate === 'start') {
      setCustomDates({ ...customDates, start: dateStr })
      setSelectingDate('end')
    } else {
      if (customDates.start && new Date(dateStr) < new Date(customDates.start)) {
        // Se a data final for menor que a inicial, inverte
        setCustomDates({ start: dateStr, end: customDates.start })
      } else {
        setCustomDates({ ...customDates, end: dateStr })
      }
    }
  }

  const handleDateInputClick = (type: 'start' | 'end') => {
    setSelectingDate(type)
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Selecione'
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const days = getDaysInMonth(currentMonth)

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
            {showCustom && (
              <>
                <div className="border-t border-white border-opacity-10 my-2"></div>
                <button
                  onClick={() => handleSelect({ value: 'custom', label: 'Período Personalizado' })}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white hover:bg-opacity-10 transition-all ${
                    value === 'custom' ? 'bg-white bg-opacity-5' : ''
                  }`}
                >
                  <span className="text-white text-sm">Período Personalizado</span>
                  {value === 'custom' && (
                    <Check className="h-4 w-4 text-blue-400" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showDatePicker && (
        <div 
          className={`
            ${isMobile ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4' : 
                        'absolute right-0 mt-2 z-50'}
          `}
        >
          <div 
            className={`
              ${isMobile ? 'w-full max-w-sm' : 'w-96'}
              bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-xl shadow-2xl border border-white border-opacity-20 overflow-hidden
            `}
          >
            {/* Header do seletor de período */}
            <div className="bg-white bg-opacity-5 p-4 border-b border-white border-opacity-10">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Período Personalizado</h3>
                <button
                  onClick={() => {
                    setShowDatePicker(false)
                    setCustomDates({ start: '', end: '' })
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Seleção de datas */}
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Data Inicial</label>
                  <button
                    onClick={() => handleDateInputClick('start')}
                    className={`
                      w-full px-4 py-3 bg-white bg-opacity-5 border rounded-lg text-left
                      ${selectingDate === 'start' ? 'border-blue-500 bg-opacity-10' : 'border-white border-opacity-20'}
                      hover:bg-opacity-10 transition-all
                    `}
                  >
                    <span className={customDates.start ? 'text-white' : 'text-gray-400'}>
                      {customDates.start ? formatDate(customDates.start) : 'Selecione'}
                    </span>
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Data Final</label>
                  <button
                    onClick={() => handleDateInputClick('end')}
                    className={`
                      w-full px-4 py-3 bg-white bg-opacity-5 border rounded-lg text-left
                      ${selectingDate === 'end' ? 'border-blue-500 bg-opacity-10' : 'border-white border-opacity-20'}
                      hover:bg-opacity-10 transition-all
                    `}
                  >
                    <span className={customDates.end ? 'text-white' : 'text-gray-400'}>
                      {customDates.end ? formatDate(customDates.end) : 'Selecione'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Calendário */}
              <div className="bg-white bg-opacity-5 rounded-lg p-4">
                {/* Header do calendário */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => handleMonthChange('prev')}
                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all"
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </button>
                  <h4 className="text-white font-semibold capitalize text-center">
                    {monthNames[currentMonth.getMonth()]} de {currentMonth.getFullYear()}
                  </h4>
                  <button
                    onClick={() => handleMonthChange('next')}
                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all"
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </button>
                </div>

                {/* Dias da semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day, index) => (
                    <div key={index} className="text-center text-xs text-gray-400 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Dias do mês */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    const dateStr = day.date.toISOString().split('T')[0]
                    const isStartDate = customDates.start === dateStr
                    const isEndDate = customDates.end === dateStr
                    const isInRange = customDates.start && customDates.end && 
                      new Date(dateStr) > new Date(customDates.start) && 
                      new Date(dateStr) < new Date(customDates.end)
                    const isToday = day.date.toDateString() === new Date().toDateString()

                    return (
                      <button
                        key={index}
                        onClick={() => day.isCurrentMonth && handleDateSelect(day.date)}
                        disabled={!day.isCurrentMonth}
                        className={`
                          p-2 text-sm rounded-lg transition-all
                          ${!day.isCurrentMonth ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-white hover:bg-opacity-10'}
                          ${isStartDate || isEndDate ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                          ${isInRange && !isStartDate && !isEndDate ? 'bg-blue-500 bg-opacity-20' : ''}
                          ${isToday && !isStartDate && !isEndDate ? 'border border-blue-400' : ''}
                        `}
                      >
                        {day.date.getDate()}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDatePicker(false)
                    setCustomDates({ start: '', end: '' })
                  }}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApplyCustom}
                  disabled={Boolean(!customDates.start || !customDates.end)}
                  className="flex-1 px-4 py-2.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}