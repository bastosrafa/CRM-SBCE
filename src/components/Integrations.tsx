import React, { useState } from 'react';
import { Mail, Calendar, HardDrive as Drive, Video, Settings, CheckCircle, AlertCircle, RefreshCw, Key, Link, Shield, Users, FileText, Zap, Globe, Database, Cloud, Lock, Unlock, Eye, EyeOff, Copy, ExternalLink, Download, Upload, FolderSync as Sync, Bell, Activity } from 'lucide-react';
import GoogleCalendarAuth from './GoogleCalendarAuth';

interface IntegrationStatus {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync?: Date;
  permissions: string[];
  apiEndpoint?: string;
  webhookUrl?: string;
  credentials?: {
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
  };
}

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    {
      id: 'gmail',
      name: 'Gmail API',
      description: 'Integração com Gmail para monitoramento de emails e automação de respostas',
      icon: <Mail className="w-6 h-6" />,
      status: 'disconnected',
      permissions: [
        'gmail.readonly',
        'gmail.send',
        'gmail.modify',
        'gmail.compose'
      ],
      apiEndpoint: 'https://gmail.googleapis.com/gmail/v1/',
      webhookUrl: 'https://your-domain.com/webhooks/gmail'
    },
    {
      id: 'calendar',
      name: 'Google Calendar API',
      description: 'Sincronização de reuniões e agendamentos automáticos',
      icon: <Calendar className="w-6 h-6" />,
      status: 'disconnected',
      permissions: [
        'calendar.readonly',
        'calendar.events',
        'calendar.calendars'
      ],
      apiEndpoint: 'https://www.googleapis.com/calendar/v3/',
      webhookUrl: 'https://your-domain.com/webhooks/calendar',
      credentials: {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
        clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET ?? ''
      }
    },
    {
      id: 'meet',
      name: 'Google Meet API',
      description: 'Transcrição de reuniões e análise de performance com IA',
      icon: <Video className="w-6 h-6" />,
      status: 'disconnected',
      permissions: [
        'meet.readonly',
        'meet.recordings',
        'meet.transcripts'
      ],
      apiEndpoint: 'https://meet.googleapis.com/v2/',
      webhookUrl: 'https://your-domain.com/webhooks/meet',
      credentials: {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
        clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET ?? ''
      }
    },
    {
      id: 'drive',
      name: 'Google Drive API',
      description: 'Armazenamento de documentos, propostas e materiais de vendas',
      icon: <Drive className="w-6 h-6" />,
      status: 'disconnected',
      permissions: [
        'drive.readonly',
        'drive.file',
        'drive.metadata'
      ],
      apiEndpoint: 'https://www.googleapis.com/drive/v3/',
      webhookUrl: 'https://your-domain.com/webhooks/drive',
      credentials: {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
        clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET ?? ''
      }
    },
    {
      id: 'forms',
      name: 'Google Forms API',
      description: 'Captura de leads e formulários de matrícula automatizados',
      icon: <FileText className="w-6 h-6" />,
      status: 'disconnected',
      permissions: [
        'forms.readonly',
        'forms.responses.readonly'
      ],
      apiEndpoint: 'https://forms.googleapis.com/v1/',
      webhookUrl: 'https://your-domain.com/webhooks/forms',
      credentials: {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
        clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET ?? ''
      }
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [isConfiguring, setIsConfiguring] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'disconnected': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'disconnected': return <AlertCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'error': return 'Erro';
      case 'pending': return 'Configurando';
      default: return status;
    }
  };

  const handleConnect = (integrationId: string) => {
    setIsConfiguring(true);
    
    // Simulate OAuth flow
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { 
              ...integration, 
              status: 'connected' as const,
              lastSync: new Date(),
              credentials: {
                ...integration.credentials,
                accessToken: 'ya29.a0AfH6SMC...',
                refreshToken: '1//04...'
              }
            }
          : integration
      ));
      setIsConfiguring(false);
    }, 2000);
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === integrationId
        ? { 
            ...integration, 
            status: 'disconnected' as const,
            lastSync: undefined,
            credentials: {
              clientId: integration.credentials?.clientId,
              clientSecret: integration.credentials?.clientSecret
            }
          }
        : integration
    ));
  };

  const handleSync = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === integrationId
        ? { ...integration, lastSync: new Date() }
        : integration
    ));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins}min atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  const selectedIntegrationData = integrations.find(i => i.id === selectedIntegration);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span>Integrações Google Workspace - SBCE CRM</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Configure e gerencie as integrações com os serviços do Google para automação completa
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">
                {integrations.filter(i => i.status === 'connected').length} de {integrations.length} conectadas
              </span>
            </div>
            
            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              <span>Configurações Globais</span>
            </button>
          </div>
        </div>

        {/* Project Info */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <Cloud className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-300">
                Projeto Google Cloud: SBCE CRM
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID ? '••••••••' : '(configure VITE_GOOGLE_CLIENT_ID no .env)'}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                ✅ APIs Habilitadas: Google Calendar, Google Meet, Google Drive
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Calendar Integration - Featured */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Google Calendar - Integração Principal
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Conecte o Google Calendar para sincronizar reuniões automaticamente
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <GoogleCalendarAuth 
            onAuthSuccess={() => {
              setIntegrations(prev => prev.map(integration =>
                integration.id === 'calendar'
                  ? { ...integration, status: 'connected' as const, lastSync: new Date() }
                  : integration
              ));
            }}
            onAuthError={(error) => {
              console.error('Calendar auth error:', error);
              setIntegrations(prev => prev.map(integration =>
                integration.id === 'calendar'
                  ? { ...integration, status: 'error' as const }
                  : integration
              ));
            }}
          />
        </div>
      </div>

      {/* Other Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.filter(i => i.id !== 'calendar').map((integration) => (
          <div
            key={integration.id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  {integration.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {integration.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {integration.description}
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                {getStatusIcon(integration.status)}
                <span>{getStatusText(integration.status)}</span>
              </div>
            </div>

            {/* Status Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Última sincronização:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatLastSync(integration.lastSync)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Permissões:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {integration.permissions.length} configuradas
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Client ID:</span>
                <span className="text-gray-900 dark:text-white font-mono text-xs">
                  {integration.credentials?.clientId?.slice(0, 20)}...
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {integration.status === 'connected' ? (
                  <>
                    <button
                      onClick={() => handleSync(integration.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm rounded transition-colors"
                    >
                      <Sync className="w-3 h-3" />
                      <span>Sincronizar</span>
                    </button>
                    <button
                      onClick={() => handleDisconnect(integration.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-sm rounded transition-colors"
                    >
                      <Unlock className="w-3 h-3" />
                      <span>Desconectar</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(integration.id)}
                    disabled={isConfiguring}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 text-sm rounded transition-colors disabled:opacity-50"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Conectar</span>
                  </button>
                )}
              </div>
              
              <button
                onClick={() => setSelectedIntegration(
                  selectedIntegration === integration.id ? null : integration.id
                )}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded transition-colors"
              >
                <Settings className="w-3 h-3" />
                <span>Configurar</span>
              </button>
            </div>

            {/* Expanded Configuration */}
            {selectedIntegration === integration.id && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                {/* API Endpoint */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Endpoint
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={integration.apiEndpoint || ''}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(integration.apiEndpoint || '')}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Permissões Necessárias
                  </label>
                  <div className="space-y-2">
                    {integration.permissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {permission}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Connection */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="w-full flex items-center justify-center space-x-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <Activity className="w-4 h-4" />
                    <span>Testar Conexão</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Next Steps Guide */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Próximos Passos
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">
                ✅ Conectar Google Calendar
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Primeira integração configurada. Teste a conexão acima.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">
                Configurar Google Meet API
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Para transcrição e análise de reuniões com IA
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">
                Integrar Gmail e Google Drive
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Para automação completa de emails e documentos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;