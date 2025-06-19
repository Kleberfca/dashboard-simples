import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BarChart3, Zap, Shield, ArrowRight, Activity, TrendingUp, Users, DollarSign } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="ml-3 text-xl font-bold text-white">Dashboard Tryum</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-lg"
              >
                Cadastre-se
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-50 rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-400 to-purple-600 p-4 rounded-2xl">
                <Activity className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="text-5xl sm:text-6xl font-extrabold text-white">
            Todas suas métricas de marketing
            <span className="block bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mt-2">
              em um só lugar
            </span>
          </h2>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
            Conecte Google Ads, Facebook, Instagram e TikTok. 
            Visualize todos seus dados em tempo real com sincronização automática.
          </p>
          <div className="mt-10">
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl"
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Trusted by */}
          <div className="mt-12">
            <p className="text-sm text-gray-400 mb-4">Para a sua empresa</p>
            <div className="flex justify-center items-center space-x-8 opacity-50">
              <div className="text-white">🏢 Tech Corp</div>
              <div className="text-white">🚀 StartupX</div>
              <div className="text-white">💼 Business Inc</div>
              <div className="text-white">🌟 Agency Pro</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white text-center mb-2">
                  Sincronização Automática
                </h3>
                <p className="text-gray-300 text-center">
                  Dados atualizados a cada hora sem nenhuma ação manual
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white text-center mb-2">
                  Métricas Unificadas
                </h3>
                <p className="text-gray-300 text-center">
                  KPIs de todas as plataformas em dashboards intuitivos
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white text-center mb-2">
                  Segurança Total
                </h3>
                <p className="text-gray-300 text-center">
                  Credenciais criptografadas e dados isolados por empresa
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20"></div>
            <div className="relative bg-white bg-opacity-5 backdrop-blur-lg rounded-3xl p-12 border border-white border-opacity-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-white mb-2">500+</div>
                  <div className="text-gray-300">Empresas Ativas</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">50M+</div>
                  <div className="text-gray-300">Dados Processados</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                  <div className="text-gray-300">Uptime</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">24/7</div>
                  <div className="text-gray-300">Suporte</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-30"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-12 border border-white border-opacity-20">
              <h3 className="text-4xl font-bold text-white mb-4">
                Pronto para unificar suas métricas?
              </h3>
              <p className="text-xl text-gray-300 mb-8">
                Configure em minutos, visualize resultados imediatamente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl"
                >
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center px-8 py-4 border border-white border-opacity-30 text-lg font-medium rounded-xl text-white hover:bg-white hover:bg-opacity-10 transition-all"
                >
                  Já tem conta? Entre aqui
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="ml-3 text-white font-semibold">Dashboard Tryum</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 Dashboard Tryum. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}