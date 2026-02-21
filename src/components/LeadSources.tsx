import React, { useState } from 'react';
import { MessageSquare, FileText, Upload, Settings, BarChart3 } from 'lucide-react';
import WhatsAppIntegration from './WhatsAppIntegration';
import FormGenerator from './FormGenerator';
import ExcelImporter from './ExcelImporter';
import { leadAutoCreationService } from '../services/leadAutoCreationService';
import { useInstance } from '../contexts/InstanceContext';

interface LeadSourcesProps {
  onLeadCreated?: (lead: any) => void;
}

const LeadSources: React.FC<LeadSourcesProps> = ({ onLeadCreated }) => {
  const { currentInstance } = useInstance();
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'forms' | 'excel' | 'stats'>('whatsapp');
  const [stats, setStats] = useState<any>(null);

  const loadStats = async () => {
    if (!currentInstance) return;

    try {
      const statsData = await leadAutoCreationService.getLeadStatsBySource(currentInstance.id);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, [currentInstance]);

  const tabs = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageSquare,
      description: 'Integração com Evolution Manager',
    },
    {
      id: 'forms',
      name: 'Formulários',
      icon: FileText,
      description: 'Gerador de formulários para landing pages',
    },
    {
      id: 'excel',
      name: 'Excel',
      icon: Upload,
      description: 'Importação de arquivos Excel/CSV',
    },
    {
      id: 'stats',
      name: 'Estatísticas',
      icon: BarChart3,
      description: 'Análise de fontes de leads',
    },
  ];

  const handleWhatsAppInstanceAdded = (instance: any) => {
    console.log('✅ WhatsApp instance added:', instance);
    loadStats(); // Refresh stats
  };

  const handleWhatsAppInstanceRemoved = (instanceId: string) => {
    console.log('✅ WhatsApp instance removed:', instanceId);
    loadStats(); // Refresh stats
  };

  const handleFormCreated = (form: any) => {
    console.log('✅ Form created:', form);
    loadStats(); // Refresh stats
  };

  const handleFormUpdated = (form: any) => {
    console.log('✅ Form updated:', form);
    loadStats(); // Refresh stats
  };

  const handleImportComplete = (result: any) => {
    console.log('✅ Import completed:', result);
    loadStats(); // Refresh stats
    onLeadCreated?.(result);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Fontes de Leads
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gerencie todas as formas de captação de leads do seu CRM
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'whatsapp' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Integração WhatsApp
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Configure suas instâncias do WhatsApp via Evolution Manager para captação automática de leads
              </p>
            </div>
            <WhatsAppIntegration
              onInstanceAdded={handleWhatsAppInstanceAdded}
              onInstanceRemoved={handleWhatsAppInstanceRemoved}
            />
          </div>
        )}

        {activeTab === 'forms' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Gerador de Formulários
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Crie formulários personalizados para suas landing pages e capture leads automaticamente
              </p>
            </div>
            <FormGenerator
              onFormCreated={handleFormCreated}
              onFormUpdated={handleFormUpdated}
            />
          </div>
        )}

        {activeTab === 'excel' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Importação Excel
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Importe leads de arquivos Excel ou CSV com mapeamento flexível de colunas
              </p>
            </div>
            <ExcelImporter onImportComplete={handleImportComplete} />
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Estatísticas de Fontes
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Análise de performance das diferentes fontes de leads
              </p>
            </div>

            {stats ? (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Leads</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(stats.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Auto-Criados</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(stats.autoCreated)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getPercentage(stats.autoCreated, stats.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Manuais</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(stats.manual)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getPercentage(stats.manual, stats.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fontes Ativas</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {Object.keys(stats.bySource).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Source Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Distribuição por Fonte
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(stats.bySource).map(([source, count]) => (
                      <div key={source} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {source === 'whatsapp' ? 'WhatsApp' : 
                             source === 'form' ? 'Formulários' :
                             source === 'excel' ? 'Excel' : 
                             source === 'manual' ? 'Manual' : source}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatNumber(count as number)} leads
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {getPercentage(count as number, stats.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Auto-Leads */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Leads Auto-Criados Recentes
                  </h3>
                  <RecentAutoLeads instanceId={currentInstance?.id} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Carregando estatísticas...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Component for recent auto-leads
const RecentAutoLeads: React.FC<{ instanceId?: string }> = ({ instanceId }) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (instanceId) {
      loadRecentLeads();
    }
  }, [instanceId]);

  const loadRecentLeads = async () => {
    try {
      setLoading(true);
      const recentLeads = await leadAutoCreationService.getRecentAutoLeads(instanceId!, 10);
      setLeads(recentLeads);
    } catch (error) {
      console.error('❌ Error loading recent leads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
        Nenhum lead auto-criado encontrado
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lead.source === 'whatsapp' ? 'WhatsApp' : 
                 lead.source === 'form' ? 'Formulário' :
                 lead.source === 'excel' ? 'Excel' : lead.source}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeadSources;



