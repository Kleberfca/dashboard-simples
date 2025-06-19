import { FileText, Download, FileSpreadsheet, BarChart3, PieChart } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -m-6 p-6">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 space-y-8">
        <h1 className="text-4xl font-bold text-white mb-8">Relatórios</h1>
        
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-12 border border-white border-opacity-20">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 blur-xl opacity-50 rounded-full"></div>
                  <div className="relative bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-2xl">
                    <FileText className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-semibold text-white mb-4">
                A geração de relatórios estará disponível em breve
              </h3>
              <p className="text-gray-300 max-w-md mx-auto">
                Aqui você poderá exportar relatórios personalizados em PDF e Excel com análises detalhadas.
              </p>
              
              {/* Report Type Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="relative group/card">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-20 group-hover/card:opacity-40 transition duration-300"></div>
                  <div className="relative bg-white bg-opacity-5 backdrop-blur rounded-xl p-6 border border-white border-opacity-10 hover:bg-opacity-10 transition-all">
                    <FileText className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                    <h4 className="text-white font-semibold mb-2">Relatório PDF</h4>
                    <p className="text-sm text-gray-300">Relatórios completos com gráficos e análises</p>
                    <div className="mt-4 flex items-center justify-center text-blue-400">
                      <Download className="h-4 w-4 mr-1" />
                      <span className="text-sm">Exportar</span>
                    </div>
                  </div>
                </div>

                <div className="relative group/card">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-20 group-hover/card:opacity-40 transition duration-300"></div>
                  <div className="relative bg-white bg-opacity-5 backdrop-blur rounded-xl p-6 border border-white border-opacity-10 hover:bg-opacity-10 transition-all">
                    <FileSpreadsheet className="h-8 w-8 text-green-400 mx-auto mb-3" />
                    <h4 className="text-white font-semibold mb-2">Planilha Excel</h4>
                    <p className="text-sm text-gray-300">Dados brutos para análises personalizadas</p>
                    <div className="mt-4 flex items-center justify-center text-green-400">
                      <Download className="h-4 w-4 mr-1" />
                      <span className="text-sm">Exportar</span>
                    </div>
                  </div>
                </div>

                <div className="relative group/card">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover/card:opacity-40 transition duration-300"></div>
                  <div className="relative bg-white bg-opacity-5 backdrop-blur rounded-xl p-6 border border-white border-opacity-10 hover:bg-opacity-10 transition-all">
                    <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                    <h4 className="text-white font-semibold mb-2">Dashboard Personalizado</h4>
                    <p className="text-sm text-gray-300">Crie visualizações interativas customizadas</p>
                    <div className="mt-4 flex items-center justify-center text-purple-400">
                      <PieChart className="h-4 w-4 mr-1" />
                      <span className="text-sm">Criar</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}