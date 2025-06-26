import Link from 'next/link'
import { ArrowRight, Activity, BarChart3, TrendingUp, Users, Shield, Zap, Clock } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            {/* Logo */}
            <div className="flex items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 p-2 sm:p-3 rounded-xl">
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
              <span className="ml-3 text-lg sm:text-xl font-bold text-white">Dashboard Tryum</span>
            </div>

            {/* Navigation - Responsivo */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/login"
                className="px-3 py-2 sm:px-4 sm:py-2 text-white hover:text-gray-300 transition-colors text-sm sm:text-base"
              >
                Entrar
              </Link>
              
              {/* Botão Cadastre-se - Corrigido para mobile */}
              <Link
                href="/register"
                className="
                  inline-flex items-center justify-center gap-2
                  px-3 py-2 sm:px-4 sm:py-2
                  bg-gradient-to-r from-blue-500 to-purple-600 
                  hover:from-blue-600 hover:to-purple-700
                  text-white font-medium rounded-lg 
                  transition-all transform hover:scale-105
                  text-sm sm:text-base
                  min-w-[100px] sm:min-w-[120px]
                  whitespace-nowrap
                "
              >
                <span>Cadastre-se</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-20 pb-16">
        <div className="text-center">
          {/* Ícone principal */}
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-50 rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-400 to-purple-600 p-4 rounded-2xl">
                <Activity className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
              </div>
            </div>
          </div>
          
          {/* Título principal - Responsivo */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Todas suas métricas de marketing
            <span className="block bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mt-2">
              em um só lugar
            </span>
          </h1>
          
          {/* Subtítulo */}
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Conecte Google Ads, Facebook, Instagram e TikTok. 
            Visualize todos seus dados em tempo real com sincronização automática.
          </p>
          
          {/* CTA Principal - Corrigido para mobile */}
          <div className="mt-8 sm:mt-10">
            <Link
              href="/register"
              className="
                inline-flex items-center justify-center gap-3
                px-6 py-3 sm:px-8 sm:py-4
                border border-transparent
                text-lg font-medium rounded-xl
                text-white bg-gradient-to-r from-blue-500 to-purple-600
                hover:from-blue-600 hover:to-purple-700
                transition-all transform hover:scale-105
                shadow-2xl
                w-full sm:w-auto
                max-w-xs sm:max-w-none
                mx-auto
              "
            >
              <span>Começar Agora</span>
              <ArrowRight className="h-5 w-5 flex-shrink-0" />
            </Link>
          </div>

          {/* Trusted by - Ajustado para mobile */}
          <div className="mt-8 sm:mt-12">
            <p className="text-sm text-gray-400 mb-4">Para sua empresa</p>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 opacity-50">
              <div className="text-white text-sm">🏢 Tech Corp</div>
              <div className="text-white text-sm">🚀 StartupX</div>
              <div className="text-white text-sm">💼 Business Inc</div>
              <div className="text-white text-sm">🌟 Agency Pro</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white border-opacity-20 h-full">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500 p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg sm:text-xl font-bold text-white">Métricas Unificadas</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Visualize dados de todas as plataformas em um dashboard único. 
                  Compare performance e otimize investimentos com insights integrados.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white border-opacity-20 h-full">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-500 p-3 rounded-xl">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg sm:text-xl font-bold text-white">Sincronização Automática</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Dados atualizados automaticamente das APIs oficiais. 
                  Configure uma vez e receba insights em tempo real sem intervenção manual.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white border-opacity-20 h-full">
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 p-3 rounded-xl">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg sm:text-xl font-bold text-white">Seguro e Confiável</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Criptografia de ponta a ponta para suas credenciais. 
                  Multi-tenancy com isolamento total de dados entre empresas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Números que impressionam</h3>
            <p className="text-gray-300">Resultados reais de empresas que confiam em nossa plataforma</p>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-30"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 sm:p-12 border border-white border-opacity-20">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
                <div>
                  <div className="text-2xl sm:text-4xl font-bold text-white mb-2">500+</div>
                  <div className="text-sm sm:text-base text-gray-300">Empresas Ativas</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-4xl font-bold text-white mb-2">50M+</div>
                  <div className="text-sm sm:text-base text-gray-300">Dados Processados</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-4xl font-bold text-white mb-2">99.9%</div>
                  <div className="text-sm sm:text-base text-gray-300">Uptime</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-4xl font-bold text-white mb-2">24/7</div>
                  <div className="text-sm sm:text-base text-gray-300">Suporte</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-30"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 sm:p-12 border border-white border-opacity-20">
              <h3 className="text-2xl sm:text-4xl font-bold text-white mb-4">
                Pronto para unificar suas métricas?
              </h3>
              <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
                Configure em minutos, visualize resultados imediatamente.
              </p>
              
              {/* CTA Buttons - Responsivos */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/register"
                  className="
                    inline-flex items-center justify-center gap-3
                    px-6 py-3 sm:px-8 sm:py-4
                    border border-transparent
                    text-lg font-medium rounded-xl
                    text-white bg-gradient-to-r from-blue-500 to-purple-600
                    hover:from-blue-600 hover:to-purple-700
                    transition-all transform hover:scale-105
                    shadow-2xl
                    w-full sm:w-auto
                    max-w-xs sm:max-w-none
                  "
                >
                  <span>Cadastre-se</span>
                  <ArrowRight className="h-5 w-5 flex-shrink-0" />
                </Link>
                
                <Link
                  href="/login"
                  className="
                    inline-flex items-center justify-center
                    px-6 py-3 sm:px-8 sm:py-4
                    border border-white border-opacity-30
                    text-lg font-medium rounded-xl
                    text-white hover:bg-white hover:bg-opacity-10
                    transition-all
                    w-full sm:w-auto
                    max-w-xs sm:max-w-none
                  "
                >
                  Já tem conta?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white border-opacity-10 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p className="text-sm sm:text-base">
              © 2024 Dashboard Tryum. Todas suas métricas de marketing em um só lugar.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}