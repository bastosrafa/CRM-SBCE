import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  TrendingUp, 
  Phone, 
  Calendar, 
  Target,
  DollarSign,
  Clock,
  MessageSquare,
  MoreVertical,
  Filter,
  Download
} from 'lucide-react';
import { Closer, PerformanceData } from '../utils/types';

interface TeamManagementProps {
  closers: Closer[];
  performanceData: PerformanceData[];
}

const TeamManagement: React.FC<TeamManagementProps> = ({ closers, performanceData }) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('today');
  const [sortBy, setSortBy] = useState<string>('conversion');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'busy': return 'Ocupado';
      case 'away': return 'Ausente';
      default: return 'Offline';
    }
  };

  const teams = ['all', ...Array.from(new Set(closers.map(c => c.team)))];
  
  const filteredClosers = closers.filter(closer => 
    selectedTeam === 'all' || closer.team === selectedTeam
  );

  const sortedClosers = [...filteredClosers].sort((a, b) => {
    switch (sortBy) {
      case 'conversion':
        return b.performance.conversionRate - a.performance.conversionRate;
      case 'revenue':
        return b.performance.revenue - a.performance.revenue;
      case 'calls':
        return b.performance.callsToday - a.performance.callsToday;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const totalRevenue = filteredClosers.reduce((sum, closer) => sum + closer.performance.revenue, 0);
  const avgConversion = filteredClosers.reduce((sum, closer) => sum + closer.performance.conversionRate, 0) / filteredClosers.length;
  const totalCalls = filteredClosers.reduce((sum, closer) => sum + closer.performance.callsToday, 0);
  const totalMeetings = filteredClosers.reduce((sum, closer) => sum + closer.performance.meetingsScheduled, 0);

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Gestão da Equipe Comercial
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitore e gerencie a performance de todos os closers
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Equipes</option>
              {teams.slice(1).map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="quarter">Este Trimestre</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="conversion">Conversão</option>
              <option value="revenue">Receita</option>
              <option value="calls">Ligações</option>
              <option value="name">Nome</option>
            </select>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Closers Ativos</p>
              <p className="text-3xl font-bold">{filteredClosers.length}</p>
              <p className="text-blue-100 text-sm">
                {filteredClosers.filter(c => c.status === 'online').length} online agora
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Receita Total</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-green-100 text-sm">
                Média: {formatCurrency(totalRevenue / filteredClosers.length)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Conversão Média</p>
              <p className="text-3xl font-bold">{avgConversion.toFixed(1)}%</p>
              <p className="text-purple-100 text-sm">
                Meta: 35%
              </p>
            </div>
            <Target className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Atividade Hoje</p>
              <p className="text-3xl font-bold">{totalCalls}</p>
              <p className="text-orange-100 text-sm">
                {totalMeetings} reuniões agendadas
              </p>
            </div>
            <Phone className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Detailed Team Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Detalhada da Equipe
          </h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-600 dark:text-gray-400">Closer</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 dark:text-gray-400">Equipe</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 dark:text-gray-400">Leads</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 dark:text-gray-400">Conversão</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 dark:text-gray-400">Receita</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 dark:text-gray-400">Atividade</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600 dark:text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedClosers.map((closer) => (
                <tr key={closer.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {closer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{closer.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{closer.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 ${getStatusColor(closer.status)} rounded-full`} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getStatusText(closer.status)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-full">
                      {closer.team}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {closer.performance.leadsConverted}/{closer.performance.leadsAssigned}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {closer.performance.leadsAssigned} atribuídos
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(closer.performance.conversionRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {closer.performance.conversionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(closer.performance.revenue)}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="flex items-center space-x-1 mb-1">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {closer.performance.callsToday} ligações
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {closer.performance.meetingsScheduled} reuniões
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Melhores Performances
            </h4>
          </div>
          
          <div className="space-y-3">
            {sortedClosers.slice(0, 3).map((closer, index) => (
              <div key={closer.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{closer.name}</span>
                </div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {closer.performance.conversionRate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Award className="w-5 h-5 text-blue-500" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Metas e Objetivos
            </h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Meta de Conversão</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">35%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((avgConversion / 35) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Meta de Receita</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">R$ 500k</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((totalRevenue / 500000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;