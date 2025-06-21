// src/app/(dashboard)/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building, User, Mail, Lock, Bell, Shield, Save, Loader2, Check, X } from 'lucide-react'
import Loading from '@/components/ui/Loading'

interface UserData {
  id: string
  email: string
  name: string
  company_id: string
  company_name: string
  role: string
}

interface Settings {
  notifications: {
    email: boolean
    syncErrors: boolean
    reports: boolean
  }
  security: {
    twoFactor: boolean
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      syncErrors: true,
      reports: false
    },
    security: {
      twoFactor: false
    }
  })

  // Form states
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Get user data with company info
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          *,
          companies!inner(name)
        `)
        .eq('id', user.id)
        .single()

      if (error || !userData) {
        console.error('Error fetching user data:', error)
        return
      }

      const formattedData: UserData = {
        id: userData.id,
        email: user.email || '',
        name: userData.name || '',
        company_id: userData.company_id,
        company_name: userData.companies?.name || '',
        role: userData.role
      }

      setUserData(formattedData)
      setName(formattedData.name)

      // Load saved settings from company metadata
      if (userData.companies?.settings) {
        setSettings(prev => ({
          ...prev,
          ...userData.companies.settings
        }))
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setMessage('')

    try {
      const supabase = createClient()

      // Update user name
      const { error: userError } = await supabase
        .from('users')
        .update({ name })
        .eq('id', userData?.id)

      if (userError) {
        setMessage('Erro ao atualizar perfil')
        return
      }

      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setMessage('As senhas não coincidem')
          return
        }

        if (newPassword.length < 6) {
          setMessage('A nova senha deve ter pelo menos 6 caracteres')
          return
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        })

        if (passwordError) {
          setMessage('Erro ao atualizar senha')
          return
        }

        // Clear password fields on success
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }

      setMessage('Alterações salvas com sucesso!')

      // Update local state
      if (userData) {
        setUserData({ ...userData, name })
      }
    } catch (error) {
      setMessage('Erro ao salvar alterações')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setMessage('')

    try {
      const supabase = createClient()

      // Save settings to company metadata
      const { error } = await supabase
        .from('companies')
        .update({
          settings: {
            ...settings
          }
        })
        .eq('id', userData?.company_id)

      if (error) {
        setMessage('Erro ao salvar configurações')
        return
      }

      setMessage('Configurações salvas com sucesso!')
    } catch (error) {
      setMessage('Erro ao salvar configurações')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loading fullScreen text="Carregando configurações..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -m-4 sm:-m-6 p-4 sm:p-6">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8">Configurações</h1>

        <div className="space-y-6">
          {/* Company Information */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
              <div className="flex items-center mb-4 sm:mb-6">
                <Building className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2 sm:mr-3" />
                <h2 className="text-lg sm:text-xl font-semibold text-white">Informações da Empresa</h2>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={userData?.company_name || ''}
                  disabled
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 cursor-not-allowed text-sm sm:text-base"
                />
                <p className="mt-2 text-xs sm:text-sm text-gray-400">
                  O nome da empresa não pode ser alterado
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
              <div className="flex items-center mb-4 sm:mb-6">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mr-2 sm:mr-3" />
                <h2 className="text-lg sm:text-xl font-semibold text-white">Informações Pessoais</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    <Mail className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={userData?.email || ''}
                    disabled
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 cursor-not-allowed text-sm sm:text-base"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar Perfil
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
              <div className="flex items-center mb-4 sm:mb-6">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mr-2 sm:mr-3" />
                <h2 className="text-lg sm:text-xl font-semibold text-white">Segurança</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm text-gray-300">
                    Mostrar senhas
                  </label>
                  <button
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {showPasswords ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                  </button>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Senha Atual
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Nova Senha
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white border-opacity-20">
              <div className="flex items-center mb-4 sm:mb-6">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mr-2 sm:mr-3" />
                <h2 className="text-lg sm:text-xl font-semibold text-white">Notificações</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm sm:text-base text-white">Notificações por Email</h4>
                    <p className="text-xs sm:text-sm text-gray-400">Receber atualizações importantes</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: !prev.notifications.email }
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.email ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm sm:text-base text-white">Erros de Sincronização</h4>
                    <p className="text-xs sm:text-sm text-gray-400">Alertas quando sincronizações falharem</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, syncErrors: !prev.notifications.syncErrors }
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.syncErrors ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.syncErrors ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm sm:text-base text-white">Relatórios Prontos</h4>
                    <p className="text-xs sm:text-sm text-gray-400">Avisar quando relatórios estiverem prontos</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, reports: !prev.notifications.reports }
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.reports ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.reports ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500 bg-opacity-20 text-red-300 rounded-lg hover:bg-opacity-30 transition-all font-medium"
            >
              Sair da Conta
            </button>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            message.includes('sucesso') 
              ? 'bg-green-500 bg-opacity-20 border border-green-500 border-opacity-40 text-green-300'
              : 'bg-red-500 bg-opacity-20 border border-red-500 border-opacity-40 text-red-300'
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}
      </div>
    </div>
  )
}