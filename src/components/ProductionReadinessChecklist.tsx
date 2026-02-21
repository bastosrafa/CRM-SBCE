import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Database, 
  Shield, 
  MessageSquare, 
  Bell, 
  Users, 
  Settings, 
  Cloud,
  Key,
  Globe,
  Smartphone,
  Mail,
  Calendar,
  BarChart3,
  FileText,
  Lock,
  Zap
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'error' | 'not-configured';
  priority: 'critical' | 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  action?: string;
  documentation?: string;
}

const ProductionReadinessChecklist: React.FC = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const items: ChecklistItem[] = [
      // Database & Backend
      {
        id: 'database',
        category: 'Backend',
        title: 'Banco de Dados',
        description: 'Configurar banco de dados real (PostgreSQL, MySQL, ou Supabase)',
        status: 'not-configured',
        priority: 'critical',
        icon: <Database className="w-5 h-5" />,
        action: 'Implementar DatabaseService com conexão real',
        documentation: 'https://supabase.com/docs'
      },
      {
        id: 'api-endpoints',
        category: 'Backend',
        title: 'API Endpoints',
        description: 'Implementar endpoints REST para CRUD de leads, tarefas e usuários',
        status: 'not-configured',
        priority: 'critical',
        icon: <Globe className="w-5 h-5" />,
        action: 'Criar backend com Express.js ou Next.js API routes'
      },
      {
        id: 'authentication',
        category: 'Segurança',
        title: 'Autenticação',
        description: 'Sistema de login/logout com JWT ou OAuth',
        status: 'not-configured',
        priority: 'critical',
        icon: <Shield className="w-5 h-5" />,
        action: 'Implementar AuthService com backend real'
      },
      {
        id: 'authorization',
        category: 'Segurança',
        title: 'Autorização',
        description: 'Controle de acesso baseado em roles (Admin, Manager, Closer)',
        status: 'not-configured',
        priority: 'high',
        icon: <Lock className="w-5 h-5" />,
        action: 'Implementar sistema de permissões'
      },

      // WhatsApp Integration
      {
        id: 'whatsapp-api',
        category: 'Integrações',
        title: 'WhatsApp Business API',
        description: 'Configurar WhatsApp Business API para envio/recebimento de mensagens',
        status: 'not-configured',
        priority: 'high',
        icon: <MessageSquare className="w-5 h-5" />,
        action: 'Configurar WhatsApp Business Account e webhook',
        documentation: 'https://developers.facebook.com/docs/whatsapp'
      },
      {
        id: 'whatsapp-webhook',
        category: 'Integrações',
        title: 'WhatsApp Webhook',
        description: 'Endpoint para receber mensagens do WhatsApp em tempo real',
        status: 'not-configured',
        priority: 'high',
        icon: <Zap className="w-5 h-5" />,
        action: 'Implementar /api/whatsapp/webhook'
      },

      // Notifications
      {
        id: 'real-time-notifications',
        category: 'Notificações',
        title: 'Notificações em Tempo Real',
        description: 'WebSockets ou Server-Sent Events para notificações instantâneas',
        status: 'not-configured',
        priority: 'medium',
        icon: <Bell className="w-5 h-5" />,
        action: 'Implementar NotificationService com WebSocket'
      },
      {
        id: 'browser-notifications',
        category: 'Notificações',
        title: 'Notificações do Browser',
        description: 'Push notifications para alertas importantes',
        status: 'pending',
        priority: 'medium',
        icon: <Smartphone className="w-5 h-5" />,
        action: 'Implementar Notification API'
      },

      // Email Integration
      {
        id: 'email-service',
        category: 'Integrações',
        title: 'Serviço de Email',
        description: 'SMTP ou serviço como SendGrid para envio de emails',
        status: 'not-configured',
        priority: 'medium',
        icon: <Mail className="w-5 h-5" />,
        action: 'Configurar SendGrid ou SMTP'
      },

      // Analytics & Reporting
      {
        id: 'analytics',
        category: 'Analytics',
        title: 'Analytics e Métricas',
        description: 'Coleta e cálculo de métricas de performance em tempo real',
        status: 'pending',
        priority: 'medium',
        icon: <BarChart3 className="w-5 h-5" />,
        action: 'Implementar MetricsCalculator com dados reais'
      },
      {
        id: 'reporting',
        category: 'Analytics',
        title: 'Relatórios',
        description: 'Geração de relatórios em PDF/Excel',
        status: 'not-configured',
        priority: 'low',
        icon: <FileText className="w-5 h-5" />,
        action: 'Implementar geração de relatórios'
      },

      // Infrastructure
      {
        id: 'hosting',
        category: 'Infraestrutura',
        title: 'Hospedagem',
        description: 'Deploy em produção (Vercel, Netlify, AWS, etc.)',
        status: 'not-configured',
        priority: 'critical',
        icon: <Cloud className="w-5 h-5" />,
        action: 'Configurar CI/CD e deploy'
      },
      {
        id: 'environment-variables',
        category: 'Infraestrutura',
        title: 'Variáveis de Ambiente',
        description: 'Configurar todas as chaves de API e secrets',
        status: 'pending',
        priority: 'critical',
        icon: <Key className="w-5 h-5" />,
        action: 'Configurar .env para produção'
      },

      // User Management
      {
        id: 'user-management',
        category: 'Usuários',
        title: 'Gestão de Usuários',
        description: 'CRUD de usuários, perfis e permissões',
        status: 'not-configured',
        priority: 'high',
        icon: <Users className="w-5 h-5" />,
        action: 'Implementar interface de administração'
      },
      {
        id: 'user-preferences',
        category: 'Usuários',
        title: 'Preferências do Usuário',
        description: 'Configurações personalizadas por usuário',
        status: 'pending',
        priority: 'low',
        icon: <Settings className="w-5 h-5" />,
        action: 'Implementar sistema de preferências'
      }
    ];

    // Simulate status check
    setChecklist(items.map(item => ({
      ...item,
      status: Math.random() > 0.7 ? 'completed' : 
              Math.random() > 0.5 ? 'pending' : 'not-configured'
    })));
  }, []);

  const categories = ['all', ...Array.from(new Set(checklist.map(item => item.category)))];
  
  const filteredChecklist = selectedCategory === 'all' 
    ? checklist 
    : checklist.filter(item => item.category === selectedCategory);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      case 'pending': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error': return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'pending': return 'Em Progresso';
      case 'error': return 'Erro';
      default: return 'Não Configurado';
    }
  };

  const stats = {
    total: checklist.length,
    completed: checklist.filter(item => item.status === 'completed').length,
    pending: checklist.filter(item => item.status === 'pending').length,
    notConfigured: checklist.filter(item => item.status === 'not-configured').length,
    critical: checklist.filter(item => item.priority === 'critical').length
  };

  const completionPercentage = Math.round((stats.completed / stats.total) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Checklist para Produção
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Itens necessários para tornar o CRM funcional em produção
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {completionPercentage}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Completo
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Concluídos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Em Progresso</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {stats.notConfigured}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Não Config.</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.critical}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Críticos</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category === 'all' ? 'Todas' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {filteredChecklist.map(item => (
          <div
            key={item.id}
            className={`border rounded-xl p-6 ${getStatusColor(item.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <div className="text-gray-600 dark:text-gray-400">
                    {item.icon}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                      {item.priority === 'critical' ? 'Crítico' :
                       item.priority === 'high' ? 'Alto' :
                       item.priority === 'medium' ? 'Médio' : 'Baixo'}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {item.description}
                  </p>
                  
                  {item.action && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Ação Necessária:
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.action}
                      </p>
                      {item.documentation && (
                        <a
                          href={item.documentation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm underline mt-1 inline-block"
                        >
                          Ver Documentação
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {getStatusText(item.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Critical Items Alert */}
      {stats.critical > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-200">
                ⚠️ Itens Críticos Pendentes
              </h4>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                Existem {stats.critical} itens críticos que precisam ser resolvidos antes do deploy em produção.
                Estes itens são essenciais para o funcionamento básico do CRM.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionReadinessChecklist;