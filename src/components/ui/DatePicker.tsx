// src/components/ui/DatePicker.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
}

export default function DatePicker({ value, onChange, placeholder = 'Selecione uma data', className = '' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedDate = value ? new Date(value) : null

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Calcular posição do calendário para evitar overflow
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const calendarHeight = 380 // altura aproximada do calendário
      const calendarWidth = 320 // largura do calendário
      
      let top = rect.bottom + 8
      let left = rect.left

      // Verificar se ultrapassa a borda inferior
      if (top + calendarHeight > window.innerHeight) {
        top = rect.top - calendarHeight - 8
      }

      // Verificar se ultrapassa a borda direita
      if (left + calendarWidth > window.innerWidth) {
        left = window.innerWidth - calendarWidth - 16
      }

      // Verificar se ultrapassa a borda esquerda
      if (left < 16) {
        left = 16
      }

      setPosition({ top, left })
    }
  }, [isOpen])

  // [... mantém as funções getDaysInMonth, handleDateSelect, handleMonthChange, formatDisplay ...]

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
    onChange(date.toISOString().split('T')[0])
    setIsOpen(false)
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

  const formatDisplay = () => {
    if (!selectedDate) return placeholder
    return selectedDate.toLocaleDateString('pt-BR')
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg text-white text-left flex items-center justify-between hover:bg-opacity-10 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
      >
        <span className={selectedDate ? 'text-white' : 'text-gray-400'}>
          {formatDisplay()}
        </span>
        <Calendar className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="fixed z-[70] w-80 bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-xl shadow-2xl border border-white border-opacity-20 overflow-hidden"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            maxWidth: 'calc(100vw - 32px)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white border-opacity-10">
            <button
              onClick={() => handleMonthChange('prev')}
              className="p-1 hover:bg-white hover:bg-opacity-10 rounded transition-all"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <h3 className="text-white font-semibold capitalize">
              {monthNames[currentMonth.getMonth()]} de {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={() => handleMonthChange('next')}
              className="p-1 hover:bg-white hover:bg-opacity-10 rounded transition-all"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Calendar */}
          <div className="p-4">
            {/* Week days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, index) => (
                <div key={index} className="text-center text-xs text-gray-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const isSelected = selectedDate && 
                  day.date.toDateString() === selectedDate.toDateString()
                const isToday = day.date.toDateString() === new Date().toDateString()

                return (
                  <button
                    key={index}
                    onClick={() => day.isCurrentMonth && handleDateSelect(day.date)}
                    disabled={!day.isCurrentMonth}
                    className={`
                      p-2 text-sm rounded-lg transition-all
                      ${!day.isCurrentMonth ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-white hover:bg-opacity-10'}
                      ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                      ${isToday && !isSelected ? 'border border-blue-400' : ''}
                    `}
                  >
                    {day.date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}