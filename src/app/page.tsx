import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BarChart3, Zap, Shield, ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Marketing Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            Todas suas métricas de marketing
            <span className="block text-blue-600 mt-2">em um só lugar</span>
          </h2>
          <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
            Conecte Google Ads, Facebook, Instagram e TikTok. 
            Visualize todos seus dados em tempo real com sincronização automática.
          </p>
          <div className="mt-10">
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <Zap className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Sincronização Automática</h3>
              <p className="mt-2 text-gray-500">
                Dados atualizados a cada hora sem nenhuma ação manual
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <BarChart3 className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Métricas Unificadas</h3>
              <p className="mt-2 text-gray-500">
                KPIs de todas as plataformas em dashboards intuitivos
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Segurança Total</h3>
              <p className="mt-2 text-gray-500">
                Credenciais criptografadas e dados isolados por empresa
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900">
            Pronto para unificar suas métricas?
          </h3>
          <p className="mt-4 text-xl text-gray-500">
            Configure em minutos, visualize resultados imediatamente.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Criar Conta Grátis
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}