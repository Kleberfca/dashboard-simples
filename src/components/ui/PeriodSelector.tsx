'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown, Check, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface PeriodSelectorProps {
  value: string
  onChange: (value: string, customDates?: { start: string; end: string }) => void
  showCustom?: boolean
}

// Ordem corrigida dos períodos conforme solicitado
const periodOptions = [
  { value: 'daily', label: 'Hoje' },
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: 'custom', label: 'Personalizado' }
]

export default function PeriodSelector({ value, onChange, showCustom = false }: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customDates, setCustomDates] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [selectingDate, setSelectingDate] = useState<'start' | 'end'>('start')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isMobile, setIsMobile] = useState(false)
  const [calendarPosition, setCalendarPosition] = useState<'top' | 'bottom'>('bottom')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  const selectedOption = value === 'custom' 
    ? { value: 'custom', label: 'Período Personalizado' }
    : periodOptions.find(opt => opt.value === value) || periodOptions[2] // Default to 30 dias

  // Detectar mobile e ajustar comportamento
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640
      setIsMobile(mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calcular posição do calendário para evitar overflow
  useEffect(() => {
    if (showDatePicker && calendarRef.current && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      const calendarHeight = 500 // altura estimada do calendário
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      
      // Se não há espaço suficiente embaixo, abrir para cima
      if (spaceBelow < calendarHeight && spaceAbove > calendarHeight) {
        setCalendarPosition('top')
      } else {
        setCalendarPosition('bottom')
      }
    }
  }, [showDatePicker])

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

  // Nomes dos meses e dias da semana em português
  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  const handleSelect = (option: { value: string; label: string }) => {
    if (option.value === 'custom' && showCustom) {
      setShowDatePicker(true)
      setSelectingDate('start')
      setIsOpen(false)
    } else {
      onChange(option.value)
      setIsOpen(false)
      setShowDatePicker(false)
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
    
    // Adicionar dias do mês anterior para preencher a primeira semana
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false
      })
    }

    // Adicionar dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      })
    }

    // Adicionar dias do próximo mês para completar a grade
    const totalCells = Math.ceil(days.length / 7) * 7
    for (let day = 1; days.length < totalCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      })
    }

    return days
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    
    if (selectingDate === 'start') {
      setCustomDates({ ...customDates, start: dateStr, end: '' })
      setSelectingDate('end')
    } else {
      const newDates = { ...customDates, end: dateStr }
      
      // Garantir que a data final é depois da inicial
      if (new Date(newDates.end) < new Date(newDates.start)) {
        newDates.start = dateStr
        newDates.end = customDates.start
      }
      
      setCustomDates(newDates)
      
      // Se ambas as datas estão selecionadas, aplicar e fechar
      if (newDates.start && newDates.end) {
        onChange('custom', newDates)
        setShowDatePicker(false)
      }
    }
  }

  const handleDateInputClick = (type: 'start' | 'end') => {
    setSelectingDate(type)
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

  const handleCancelCustomDate = () => {
    setShowDatePicker(false)
    setCustomDates({ start: '', end: '' })
    setSelectingDate('start')
  }

  const handleApplyCustomDate = () => {
    if (customDates.start && customDates.end) {
      onChange('custom', customDates)
      setShowDatePicker(false)
    }
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do selector de período */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg border border-white border-opacity-20 text-white hover:bg-opacity-20 transition-all text-sm whitespace-nowrap"
      >
        <Calendar className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown de opções de período */}
      {isOpen && !showDatePicker && (
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

      {/* Calendário personalizado - Responsivo */}
      {showDatePicker && (
        <div 
          className={`
            ${isMobile 
              ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4' 
              : `absolute ${calendarPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 z-50`
            }
          `}
        >
          <div 
            ref={calendarRef}
            className={`
              ${isMobile ? 'w-full max-w-sm max-h-[90vh] overflow-y-auto' : 'w-96'}
              bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-xl shadow-2xl border border-white border-opacity-20 overflow-hidden
            `}
          >
            {/* Header do calendário */}
            <div className="bg-white bg-opacity-5 p-4 border-b border-white border-opacity-10">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Período Personalizado</h3>
                <button
                  onClick={handleCancelCustomDate}
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

              {/* Indicador da data sendo selecionada */}
              <div className="text-center">
                <p className="text-sm text-blue-400">
                  Selecione a {selectingDate === 'start' ? 'data inicial' : 'data final'}
                </p>
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
                  <h4 className="text-white font-semibold capitalize text-center min-w-0 flex-1">
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
                    <div key={index} className="text-center text-xs text-gray-400 py-1 font-medium">
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
                          p-2 text-sm rounded-lg transition-all aspect-square flex items-center justify-center
                          ${!day.isCurrentMonth 
                            ? 'text-gray-600 cursor-not-allowed' 
                            : isStartDate || isEndDate
                              ? 'bg-blue-500 text-white'
                              : isInRange
                                ? 'bg-blue-500 bg-opacity-30 text-white'
                                : isToday
                                  ? 'bg-white bg-opacity-20 text-white border border-white border-opacity-50'
                                  : 'text-white hover:bg-white hover:bg-opacity-10'
                          }
                        `}
                      >
                        {day.date.getDate()}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancelCustomDate}
                  className="flex-1 px-4 py-2 border border-white border-opacity-30 text-white rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApplyCustomDate}
                  disabled={!customDates.start || !customDates.end}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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