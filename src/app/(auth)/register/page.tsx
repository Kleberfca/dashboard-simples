'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, Lock, Building, User, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    name: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    if (!formData.companyName.trim()) {
      setError('Nome da empresa é obrigatório')
      setLoading(false)
      return
    }

    if (!formData.name.trim()) {
      setError('Seu nome é obrigatório')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            company_name: formData.companyName
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        if (authError.message.includes('already registered')) {
          setError('Este email já está em uso. Tente fazer login ou use outro email.')
        } else if (authError.message.includes('invalid email')) {
          setError('Email inválido. Verifique o formato do email.')
        } else {
          setError(authError.message || 'Erro ao criar conta. Tente novamente.')
        }
        return
      }

      if (!authData.user) {
        setError('Erro ao criar usuário. Tente novamente.')
        return
      }

      // Create company slug
      const companySlug = formData.companyName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 50)

      console.log('Creating company:', {
        name: formData.companyName,
        slug: companySlug,
        user_id: authData.user.id
      })

      // Wait for auth propagation
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.companyName.trim(),
          slug: companySlug,
          is_active: true,
          settings: {},
          created_by: authData.user.id
        })
        .select()
        .single()

      if (companyError) {
        console.error('Company creation error:', companyError)
        
        // Cleanup auth user if company creation fails
        try {
          await supabase.auth.signOut()
        } catch (signOutError) {
          console.error('Error signing out:', signOutError)
        }
        
        if (companyError.code === '23505') {
          setError('Uma empresa com este nome já existe. Tente outro nome.')
        } else if (companyError.code === '42501') {
          setError('Erro de permissão. Verifique as configurações do banco de dados.')
        } else if (companyError.message.includes('violates row-level security policy')) {
          setError('Erro de permissão. Aguarde alguns segundos e tente novamente.')
        } else {
          setError(`Erro ao criar empresa: ${companyError.message}`)
        }
        return
      }

      if (!company) {
        setError('Erro ao criar empresa. Tente novamente.')
        return
      }

      console.log('Company created successfully:', company)

      // Create user profile
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          name: formData.name.trim(),
          company_id: company.id,
          role: 'admin',
          is_active: true
        })

      if (userError) {
        console.error('User profile creation error:', userError)
        
        // Cleanup: delete company and sign out user
        try {
          await supabase.from('companies').delete().eq('id', company.id)
          await supabase.auth.signOut()
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError)
        }
        
        if (userError.code === '23505') {
          setError('Este usuário já existe.')
        } else if (userError.message.includes('violates row-level security policy')) {
          setError('Erro de permissão. Aguarde alguns segundos e tente novamente.')
        } else {
          setError(`Erro ao criar perfil: ${userError.message}`)
        }
        return
      }

      console.log('Registration completed successfully!')
      
      // Success - redirect to dashboard
      router.push('/dashboard')
      router.refresh()
      
    } catch (err) {
      console.error('Unexpected registration error:', err)
      setError('Erro inesperado ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 rounded-full"></div>
              <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-2xl">
                <Activity className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">Dashboard Tryum</h1>
        </div>

        <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Crie sua conta grátis
          </h2>
          
          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-200 mb-2">
                Nome da Empresa
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  className="pl-10 w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="Minha Empresa"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                Seu Nome
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="pl-10 w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10 w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="pl-10 w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="pl-10 w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}