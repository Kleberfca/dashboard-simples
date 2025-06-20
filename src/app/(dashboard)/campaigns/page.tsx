import { TrendingUp, Calendar, DollarSign, Users, Activity } from 'lucide-react'

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -m-4 sm:-m-6 p-4 sm:p-6">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 space-y-6 sm:space-y-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8">Campanhas</h1>
        
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 border border-white border-opacity-20">
            <div className="text-center py-4 sm:py-8">
              <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500 blur-xl opacity-50 rounded-full"></div>
                  <div className="relative bg-gradient-to-br from-purple-400 to-purple-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                    <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">
                A visualização de campanhas estará disponível em breve
              </h3>
              <p className="text-sm sm:text-base text-gray-300 max-w-md mx-auto">
                Aqui você poderá ver o desempenho detalhado de cada campanha com métricas em tempo real.
              </p>
              
              {/* Preview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-12">
                <div className="bg-white bg-opacity-5 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white border-opacity-10">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-gray-300">Período</p>
                  <p className="text-white font-semibold text-sm sm:text-base">Análises</p>
                </div>
                <div className="bg-white bg-opacity-5 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white border-opacity-10">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-gray-300">Investimento</p>
                  <p className="text-white font-semibold text-sm sm:text-base">ROI</p>
                </div>
                <div className="bg-white bg-opacity-5 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white border-opacity-10">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-gray-300">Alcance</p>
                  <p className="text-white font-semibold text-sm sm:text-base">Público</p>
                </div>
                <div className="bg-white bg-opacity-5 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white border-opacity-10">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-gray-300">Performance</p>
                  <p className="text-white font-semibold text-sm sm:text-base">Métricas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}