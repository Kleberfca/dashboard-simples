'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, Target, AlertCircle } from 'lucide-react'
import PlatformSelector from '@/components/ui/PlatformSelector'
import DatePicker from '@/components/ui/DatePicker'

interface Campaign {
  id?: string
  name: string
  platform: string
  budget: number
  start_date: string
  end_date: string
  status: 'active' | 'paused' | 'completed'
  description?: string
}

interface CampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (campaign: Campaign) => void
  campaign?: Campaign | null
  loading?: boolean
}

export default function CampaignModal({ 
  isOpen, 
  onClose, 
  onSave, 
  campaign = null, 
  loading = false 
}: CampaignModalProps) {
  const [formData, setFormData] = useState<Campaign>({
    name: '',
    platform: '',
    budget: 0,
    start_date: '',
    end_date: '',
    status: 'active',
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isMobile, setIsMobile] = useState(false)

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Preencher dados quando editando
  useEffect(() => {
    if (campaign) {
      setFormData({
        ...campaign,
        start_date: campaign.start_date || '',
        end_date: campaign.end_date || ''
      })
    } else {
      setFormData({
        name: '',
        platform: '',
        budget: 0,
        start_date: '',
        end_date: '',
        status: 'active',
        description: ''
      })
    }
    setErrors({})
  }, [campaign, isOpen])

  // Prevenir scroll do body quando modal aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da campanha é obrigatório'
    }

    if (!formData.platform) {
      newErrors.platform = 'Plataforma é obrigatória'
    }

    if (!formData.budget || formData.budget <= 0) {
      newErrors.budget = 'Orçamento deve ser maior que zero'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Data de início é obrigatória'
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Data de fim é obrigatória'
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      
      if (endDate <= startDate) {
        newErrors.end_date = 'Data de fim deve ser posterior à data de início'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleInputChange = (field: keyof Campaign, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpar erro do campo quando usuário edita
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative w-full max-w-lg bg-gray-900 bg-opacity-95 backdrop-blur-xl 
            rounded-xl shadow-2xl border border-white border-opacity-20 
            ${isMobile ? 'mx-4 max-h-[90vh] overflow-y-auto' : ''}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white border-opacity-10">
            <h2 className="text-xl font-bold text-white">
              {campaign ? 'Editar Campanha' : 'Nova Campanha'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Nome da Campanha */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome da Campanha *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`
                  w-full px-4 py-3 bg-white bg-opacity-10 border rounded-lg 
                  text-white placeholder-gray-400 transition-all
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.name ? 'border-red-500' : 'border-white border-opacity-20'}
                `}
                placeholder="Ex: Black Friday 2024"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Plataforma - Corrigido para não quebrar layout */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plataforma *
              </label>
              <PlatformSelector
                value={formData.platform}
                onChange={(value) => handleInputChange('platform', value)}
                className={errors.platform ? 'border-red-500' : ''}
              />
              {errors.platform && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.platform}
                </p>
              )}
            </div>

            {/* Orçamento */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Orçamento (R$) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget || ''}
                  onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                  className={`
                    w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border rounded-lg 
                    text-white placeholder-gray-400 transition-all
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${errors.budget ? 'border-red-500' : 'border-white border-opacity-20'}
                  `}
                  placeholder="5000.00"
                />
              </div>
              {errors.budget && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.budget}
                </p>
              )}
            </div>

            {/* Datas - Layout responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data de Início *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className={`
                      w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border rounded-lg 
                      text-white transition-all
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.start_date ? 'border-red-500' : 'border-white border-opacity-20'}
                    `}
                  />
                </div>
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.start_date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data de Fim *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    className={`
                      w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border rounded-lg 
                      text-white transition-all
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.end_date ? 'border-red-500' : 'border-white border-opacity-20'}
                    `}
                  />
                </div>
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.end_date}
                  </p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as any)}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active" className="bg-gray-800">Ativa</option>
                <option value="paused" className="bg-gray-800">Pausada</option>
                <option value="completed" className="bg-gray-800">Concluída</option>
              </select>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição (Opcional)
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Descrição da campanha..."
              />
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-white border-opacity-30 text-white rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>{campaign ? 'Atualizar' : 'Criar'} Campanha</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}