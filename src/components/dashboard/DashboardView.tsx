import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Users, MousePointer, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { KPIMetric, DateRange, DashboardFilters } from '@/types';

interface DashboardViewProps {
  companyId: string;
}

function KPICard({ metric }: { metric: KPIMetric }) {
  const isPositiveChange = metric.changeType === 'increase';
  const Icon = isPositiveChange ? TrendingUp : TrendingDown;
  
  const iconMap: Record<string, any> = {
    'Investimento': DollarSign,
    'Leads': Users,
    'Cliques': MousePointer,
    'Impressões': Eye,
  };
  
  const CardIcon = iconMap[metric.label] || DollarSign;
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{metric.label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {metric.prefix}{metric.value}{metric.suffix}
          </p>
          {metric.change !== undefined && (
            <div className="mt-2 flex items-center text-sm">
              <Icon className={`h-4 w-4 ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`ml-1 ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(metric.change)}%
              </span>
              <span className="ml-1 text-gray-500">vs período anterior</span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <CardIcon className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardView({ companyId }: DashboardViewProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<KPIMetric[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      start: new Date(new Date().setDate(new Date().getDate() - 30)),
      end: new Date(),
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, [companyId, filters]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/metrics/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, filters }),
      });

      const data = await response.json();
      
      // Mock data for demonstration
      setMetrics([
        { 
          label: 'Investimento', 
          value: 'R$ 54.898,50', 
          change: 200.0, 
          changeType: 'increase',
          prefix: '',
          suffix: ''
        },
        { 
          label: 'Leads', 
          value: '186', 
          change: 200.0, 
          changeType: 'increase',
          prefix: '',
          suffix: ''
        },
        { 
          label: 'Custo por Lead', 
          value: 'R$ 295,15', 
          change: 48.1, 
          changeType: 'increase',
          prefix: '',
          suffix: ''
        },
        { 
          label: 'Receita', 
          value: 'R$ 65.000,00', 
          change: 0, 
          changeType: 'increase',
          prefix: '',
          suffix: ''
        },
        { 
          label: 'CTR', 
          value: '0,44%', 
          change: 17.5, 
          changeType: 'increase',
          prefix: '',
          suffix: ''
        },
        { 
          label: 'CPM', 
          value: 'R$ 53,06', 
          change: -24.6, 
          changeType: 'decrease',
          prefix: '',
          suffix: ''
        },
        { 
          label: 'Cliques no link', 
          value: '4.565', 
          change: 592.7, 
          changeType: 'increase',
          prefix: '',
          suffix: ''
        },
        { 
          label: 'ROAS', 
          value: '1,2', 
          change: 0, 
          changeType: 'increase',
          prefix: '',
          suffix: ''
        },
      ]);

      // Mock chart data
      const dates = [];
      const chartPoints = [];
      for (let i = 14; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        chartPoints.push({
          date: date.toLocaleDateString('pt-BR', { day: '2d', month: 'short' }),
          cpc: Math.floor(Math.random() * 10) + 8,
          leads: Math.floor(Math.random() * 10) + 5,
        });
      }
      setChartData(chartPoints);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Filter */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Calendar className="h-4 w-4 mr-2" />
            {filters.dateRange.start.toLocaleDateString('pt-BR')} - {filters.dateRange.end.toLocaleDateString('pt-BR')}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <KPICard key={index} metric={metric} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPC Evolution Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Evolução do CPC</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="cpc" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leads Evolution Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Leads Gerados</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Sincronizações Recentes</h3>
        </div>
        <div className="px-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Google Ads</p>
                <p className="text-sm text-gray-500">Última sincronização há 5 minutos</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Sucesso
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Facebook Ads</p>
                <p className="text-sm text-gray-500">Última sincronização há 1 hora</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Sucesso
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}