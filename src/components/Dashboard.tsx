import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Phone, 
  Calendar,
  MousePointer,
  MessageSquare,
  CheckCircle,
  CreditCard,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  UserX
} from 'lucide-react';
import { Closer, FunnelMetrics } from '../utils/types';
import { useFunnelData } from '../hooks/useFunnelData';

interface DashboardProps {
  closers: Closer[];
  funnelMetrics: FunnelMetrics;
  isManager: boolean;
  currentCloserId?: string;
}

type PeriodFilter = 'today' | 'week' | 'month' | 'custom';

const Dashboard: React.FC<DashboardProps> = ({ 
  closers, 
  funnelMetrics: mockFunnelMetrics, 
  isManager, 
  currentCloserId 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('today');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Calculate date range based on selected period
  const getDateRange = () => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (selectedPeriod) {
      case 'today':
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = new Date();
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        }
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Use the hook to fetch real-time data
  const { funnelMetrics: realTimeFunnelMetrics, loading, error, refetch } = useFunnelData(
    getDateRange(),
    [] // TODO: Pass actual leads data
  );

  // Use real-time data if available, otherwise fall back to mock data
  const displayMetrics = realTimeFunnelMetrics || mockFunnelMetrics;

  const formatCurrency = (value: number | string | null | undefined) => {
    const numValue = Number(value) || 0;
    if (isNaN(numValue) || !isFinite(numValue)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatPercentage = (value: number | string | null | undefined) => {
    const numValue = Number(value) || 0;
    if (isNaN(numValue) || !isFinite(numValue)) {
      return '0.0%';
    }
    return `${numValue.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return 'Hoje';
      case 'week': return 'Última Semana';
      case 'month': return 'Último Mês';
      case 'custom': 
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate).toLocaleDateString('pt-BR');
          const end = new Date(customEndDate).toLocaleDateString('pt-BR');
          return `${start} - ${end}`;
        }
        return 'Período Personalizado';
      default: return 'Hoje';
    }
  };

  const handlePeriodChange = (period: PeriodFilter) => {
    setSelectedPeriod(period);
    if (period === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
    }
  };

  const applyCustomPeriod = () => {
    if (customStartDate && customEndDate) {
      setShowCustomDatePicker(false);
    }
  };

  // Filter data based on user role
  const displayClosers = isManager ? closers : closers.filter(c => c.id === currentCloserId);

  const topPerformers = [...closers]
    .sort((a, b) => b.performance.conversionRate - a.performance.conversionRate)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Period Filter Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Funil de Vendas - {isManager ? 'Visão Geral' : 'Minha Performance'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Período: {getPeriodLabel()}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Atualizando dados...</span>
                </>
              ) : error ? (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-500">Erro ao carregar</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Dados em tempo real</span>
                </>
              )}
            </div>
            
            <button
              onClick={refetch}
              disabled={loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <div className="relative">
              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => handlePeriodChange('today')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedPeriod === 'today'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => handlePeriodChange('week')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedPeriod === 'week'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Última Semana
                </button>
                <button
                  onClick={() => handlePeriodChange('month')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedPeriod === 'month'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Último Mês
                </button>
                <button
                  onClick={() => handlePeriodChange('custom')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedPeriod === 'custom'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Personalizado</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Date Picker */}
        {showCustomDatePicker && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Final
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={applyCustomPeriod}
                  disabled={!customStartDate || !customEndDate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Aplicar
                </button>
                <button
                  onClick={() => setShowCustomDatePicker(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-red-300">
              Erro ao carregar dados: {error}
            </p>
            <button
              onClick={refetch}
              className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Funnel Overview */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        {/* Traffic & Lead Generation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Gasto com Anúncios</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(displayMetrics.adSpendMeta + displayMetrics.adSpendGoogle)}
                </p>
                <p className="text-blue-100 text-xs">
                  Meta: {formatCurrency(displayMetrics.adSpendMeta)} | Google: {formatCurrency(displayMetrics.adSpendGoogle)}
                </p>
              </div>
              <MousePointer className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Visitas na LP</p>
                <p className="text-2xl font-bold">{displayMetrics.landingPageVisits.toLocaleString()}</p>
                <p className="text-purple-100 text-xs">
                  CV: {formatPercentage(displayMetrics.landingPageConversion)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total de Leads</p>
                <p className="text-2xl font-bold">{displayMetrics.totalLeads}</p>
                <p className="text-green-100 text-xs">
                  CPL Médio: {formatCurrency(displayMetrics.averageCPL)}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Contatados</p>
                <p className="text-2xl font-bold">{displayMetrics.contacted}</p>
                <p className="text-orange-100 text-xs">
                  {formatPercentage(displayMetrics.contactedPercentage)} dos leads
                </p>
              </div>
              <Phone className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Engagement & Meetings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Taxa de Resposta</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayMetrics.responded}</p>
                <p className="text-gray-500 text-xs">
                  {formatPercentage(displayMetrics.responseRate)} taxa de resposta
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Reuniões Agendadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {displayMetrics.totalMeetingsScheduled}
                </p>
                <p className="text-gray-500 text-xs">
                  Manual: {displayMetrics.meetingsScheduledManual} | Auto: {displayMetrics.meetingsScheduledAuto}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Reuniões Realizadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayMetrics.meetingsHeld}</p>
                <p className="text-gray-500 text-xs">
                  {formatPercentage(displayMetrics.meetingsHeldPercentage)} comparecimento
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">No Show</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {displayMetrics.noShows || (displayMetrics.totalMeetingsScheduled || 0) - (displayMetrics.meetingsHeld || 0)}
                </p>
                <p className="text-gray-500 text-xs">
                  {formatPercentage((displayMetrics.totalMeetingsScheduled || 0) > 0 ? ((displayMetrics.noShows || ((displayMetrics.totalMeetingsScheduled || 0) - (displayMetrics.meetingsHeld || 0))) / (displayMetrics.totalMeetingsScheduled || 1)) * 100 : 0)} das agendadas
                </p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Sales & Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Vendas Confirmadas</p>
                <p className="text-2xl font-bold">{displayMetrics.totalSales || 0}</p>
                <p className="text-emerald-100 text-xs">
                  Meta: {displayMetrics.salesMeta || 0} | Outros: {displayMetrics.salesOthers || 0}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-emerald-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm">Reunião → Venda</p>
                <p className="text-2xl font-bold">{formatPercentage(displayMetrics.meetingToSaleConversion || 0)}</p>
                <p className="text-teal-100 text-xs">Taxa de fechamento</p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-teal-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Total Leads x Vendas</p>
                <p className="text-2xl font-bold">{formatPercentage(displayMetrics.leadToSaleConversion || 0)}</p>
                <p className="text-yellow-100 text-xs">
                  Ticket: {formatCurrency(displayMetrics.averageTicket || 0)}
                </p>
              </div>
              <Target className="w-8 h-8 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Receita Assinada</p>
                <p className="text-2xl font-bold">{formatCurrency(displayMetrics.revenueContracted || 0)}</p>
                <p className="text-indigo-100 text-xs">
                  Líquida: {formatCurrency(displayMetrics.revenueNet || 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-indigo-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance (Manager Only) */}
      {isManager && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Status */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status da Equipe</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Ao vivo</span>
              </div>
            </div>

            <div className="space-y-4">
              {closers.map((closer) => (
                <div key={closer.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {closer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(closer.status)} rounded-full border-2 border-white dark:border-gray-800`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{closer.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{closer.team}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {(() => {
                        const rate = Number(closer.performance.conversionRate) || 0;
                        return isNaN(rate) ? '0' : Math.round(rate).toString();
                      })()}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {isNaN(closer.performance.callsToday) ? '0' : closer.performance.callsToday.toString()} ligações hoje
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Target className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performers</h3>
            </div>

            <div className="space-y-4">
              {topPerformers.map((closer, index) => (
                <div key={closer.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{closer.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(isNaN(closer.performance.revenue) ? 0 : closer.performance.revenue)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {(() => {
                        const rate = Number(closer.performance.conversionRate) || 0;
                        return isNaN(rate) ? '0' : Math.round(rate).toString();
                      })()}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {isNaN(closer.performance.leadsConverted) ? '0' : closer.performance.leadsConverted.toString()}/{isNaN(closer.performance.leadsAssigned) ? '0' : closer.performance.leadsAssigned.toString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Individual Performance (Closer Only) */}
      {!isManager && currentCloserId && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Minha Performance Individual
          </h3>
          
          {(() => {
            const currentCloser = closers.find(c => c.id === currentCloserId);
            if (!currentCloser) return null;
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                    {(() => {
                      const rate = Number(currentCloser.performance.conversionRate) || 0;
                      return isNaN(rate) ? '0' : Math.round(rate).toString();
                    })()}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conversão</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isNaN(currentCloser.performance.leadsConverted) ? '0' : currentCloser.performance.leadsConverted.toString()}/{isNaN(currentCloser.performance.leadsAssigned) ? '0' : currentCloser.performance.leadsAssigned.toString()} leads
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-3">
                    R$
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receita Gerada</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(currentCloser.performance.revenue || 0)}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                    {isNaN(currentCloser.performance.callsToday) ? '0' : currentCloser.performance.callsToday.toString()}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ligações Hoje</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isNaN(currentCloser.performance.meetingsScheduled) ? '0' : currentCloser.performance.meetingsScheduled.toString()} reuniões agendadas
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Dashboard;