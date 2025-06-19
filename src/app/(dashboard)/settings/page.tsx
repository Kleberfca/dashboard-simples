'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, LogOut, User, Building, Mail, Shield, Bell, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UserData {
  company_name: string
  name: string
  email: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [userData, setUserData] = useState<UserData>({
    company_name: '',
    name: '',
    email: ''
  })

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

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, email, company_id')
        .eq('id', user.id)
        .single()

      if (userData && userData.company_id) {
        // Buscar dados da empresa separadamente
        const { data: companyData } = await supabase
          .from('companies')
          .select('name')
          .eq('id', userData.company_id)
          .single()

        setUserData({
          company_name: companyData?.name || '',
          name: userData.name || '',
          email: userData.email
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { error } = await supabase
        .from('users')
        .update({ name: userData.name })
        .eq('id', user.id)

      if (error) {
        setMessage('Erro ao salvar alterações')
      } else {
        setMessage('Alterações salvas com sucesso!')
      }
    } catch (error) {
      setMessage('Erro ao salvar alterações')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -m-6 p-6">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Configurações</h1>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Company Information */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
              <div className="flex items-center mb-6">
                <Building className="h-6 w-6 text-blue-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">Informações da Empresa</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={userData.company_name}
                  disabled
                  className="w-full px-4 py-3 bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 cursor-not-allowed"
                />
                <p className="mt-2 text-sm text-gray-400">
                  O nome da empresa não pode ser alterado
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
              <div className="flex items-center mb-6">
                <User className="h-6 w-6 text-purple-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">Informações Pessoais</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={userData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    O email não pode ser alterado
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-green-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">Segurança</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 text-yellow-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">Notificações de Segurança</p>
                      <p className="text-sm text-gray-400">Receba alertas sobre atividades suspeitas</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg border ${
              message.includes('sucesso') 
                ? 'bg-green-500 bg-opacity-20 border-green-400 text-green-300' 
                : 'bg-red-500 bg-opacity-20 border-red-400 text-red-300'
            }`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center px-6 py-3 bg-red-500 bg-opacity-20 hover:bg-opacity-30 border border-red-400 border-opacity-50 text-red-300 font-medium rounded-lg transition-all"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sair da Conta
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-5 w-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Helper component for loading state
function Loading({ fullScreen = false, text = 'Carregando...' }: { fullScreen?: boolean, text?: string }) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="text-gray-300">{text}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}