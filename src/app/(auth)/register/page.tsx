'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        setError('Erro ao criar conta. Este email pode já estar em uso.')
        return
      }

      if (authData.user) {
        // Create company
        const companySlug = formData.companyName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')

        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: formData.companyName,
            slug: companySlug,
          })
          .select()
          .single()

        if (companyError) {
          console.error('Company creation error:', companyError)
          setError('Erro ao criar empresa')
          return
        }

        // Update user profile
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            name: formData.name,
            company_id: company.id,
            role: 'admin'
          })

        if (userError) {
          console.error('User profile error:', userError)
          setError('Erro ao criar perfil')
          return
        }

        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crie sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              entre com uma conta existente
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Nome da Empresa
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Minha Empresa"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Seu Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="João Silva"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Digite a senha novamente"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Criar Conta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}