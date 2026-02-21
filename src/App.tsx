import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InstanceProvider } from './contexts/InstanceContext';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import LeadKanban from './components/LeadKanban';
import FollowUp from './components/FollowUp';
import WhatsAppShadow from './components/WhatsAppShadow';
import Integrations from './components/Integrations';
import AIPerformance from './components/AIPerformance';
import TeamManagement from './components/TeamManagement';
import Meetings from './components/Meetings';
import ProductionReadinessChecklist from './components/ProductionReadinessChecklist';
import InstanceManagement from './components/InstanceManagement';
import { useInstanceLeads, useInstanceKanbanColumns } from './hooks/useInstanceData';
import { useInstance } from './contexts/InstanceContext';
import { useActiveState } from './hooks/useActiveState';
import { 
  mockClosers, 
  mockPerformanceData, 
  mockFunnelMetrics,
  mockLeads,
  mockColumns
} from './utils/data';
import { Lead, KanbanColumn } from './utils/types';

// MODO DESENVOLVIMENTO - Bypass do login
const DEVELOPMENT_MODE = false; // Mude para false quando quiser ativar o login

const AppContent: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { currentInstance, isLoading: instanceLoading, error: instanceError } = useInstance();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'followup' | 'whatsapp' | 'integrations' | 'ai-performance' | 'team' | 'meetings' | 'production-checklist' | 'instances'>('dashboard');
  
  // Hook para gerenciar estado ativo e evitar recarregamentos desnecessários
  useActiveState({
    onFocus: () => {
      console.log('🎯 App ganhou foco - mantendo estado atual');
    },
    onVisible: () => {
      console.log('👁️ App voltou a ser visível - mantendo estado atual');
    }
  });
  // const [editingLead, setEditingLead] = useState<Lead | null>(null);
  
  // Use mock data quando em modo desenvolvimento ou dados reais do Supabase
  const { leads: supabaseLeads, loading: leadsLoading, error: leadsError, createLead, updateLead, updateNotes, deleteLead: deleteLeadFromSupabase } = useInstanceLeads();
  const { columns: supabaseColumns, loading: columnsLoading, error: columnsError, createColumn, updateColumn, deleteColumn, reorderColumns } = useInstanceKanbanColumns();
  
  // Decidir qual fonte de dados usar
  const leads = DEVELOPMENT_MODE ? mockLeads : supabaseLeads;
  const columns = DEVELOPMENT_MODE ? mockColumns : supabaseColumns;
  const loading = DEVELOPMENT_MODE ? false : (leadsLoading || columnsLoading);
  const error = DEVELOPMENT_MODE ? null : (leadsError || columnsError);
  
  // Mock data for features not yet connected to Supabase
  const [closers] = useState(mockClosers);
  const [performanceData] = useState(mockPerformanceData);
  const [funnelMetrics] = useState(mockFunnelMetrics);


  const mockProfile = {
    id: 'dev-user-123',
    email: 'dev@sbce.com',
    name: 'Usuário Desenvolvimento',
    role: 'admin' as const,
    team: 'Desenvolvimento',
    avatar_url: null,
    status: 'online' as const,
    leads_assigned: 0,
    leads_converted: 0,
    conversion_rate: 0,
    revenue: 0,
    calls_today: 0,
    meetings_scheduled: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Em modo desenvolvimento, pular autenticação
  if (DEVELOPMENT_MODE) {
    console.log('🚀 MODO DESENVOLVIMENTO ATIVO - Login bypassed');
  } else {
    // Show loading while auth is initializing
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando autenticação...</p>
          </div>
        </div>
      );
    }

    // Show login form if not authenticated
    if (!user || !profile) {
      return <LoginForm />;
    }
  }

  // Usar dados reais ou mock baseado no modo
  // const currentUser = DEVELOPMENT_MODE ? mockUser : user;
  const currentProfile = DEVELOPMENT_MODE ? mockProfile : profile;

  // Determine user permissions
  const isManager = currentProfile?.role === 'admin' || currentProfile?.role === 'manager';
  // const isSuperAdmin = currentProfile?.role === 'super_admin';
  // const isCloser = currentProfile?.role === 'closer';
  const currentCloserId = currentProfile?.id;

  const handleLeadMove = async (leadId: string, newColumnId: string) => {
    console.log('🔄 Movendo lead', leadId, 'para coluna', newColumnId);
    
    if (DEVELOPMENT_MODE) {
      console.log('🔄 MODO DEV: Movendo lead', leadId, 'para coluna', newColumnId);
      // Em modo desenvolvimento, apenas log
      return;
    }
    
    try {
      console.log('📤 Atualizando lead no Supabase...');
      await updateLead(leadId, { columnId: newColumnId });
      console.log('✅ Lead movido com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao mover lead:', error);
      alert('Erro ao mover lead. Tente novamente.');
    }
  };

  const handleAddColumn = async (name: string, color: string) => {
    if (DEVELOPMENT_MODE) {
      console.log('🔄 MODO DEV: Adicionando coluna', name, color);
      return;
    }
    
    try {
      console.log('📤 Adicionando coluna:', name, color);
      await createColumn(name, color);
      console.log('✅ Coluna adicionada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao adicionar coluna:', error);
      alert('Erro ao adicionar coluna. Tente novamente.');
    }
  };

  const handleAddLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'lastUpdated'>) => {
    if (DEVELOPMENT_MODE) {
      console.log('🔄 MODO DEV: Adicionando lead', leadData);
      return;
    }
    
    try {
      await createLead(leadData);
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const handleWhatsAppClick = (phone: string, leadName: string) => {
    // Limpar o número do telefone (remover caracteres especiais)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Adicionar código do país se não tiver
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    // Criar URL do WhatsApp
    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=Olá ${leadName}, tudo bem?`;
    
    // Abrir WhatsApp em nova aba
    window.open(whatsappUrl, '_blank');
    
    console.log(`Opening WhatsApp conversation for ${leadName} (${phone})`);
  };

  const handleFollowUpClick = (leadId: string, leadName: string) => {
    setActiveTab('followup');
    console.log(`Creating follow-up for ${leadName} (${leadId})`);
  };

  const handleUpdateNotes = async (leadId: string, notes: string) => {
    if (DEVELOPMENT_MODE) {
      console.log('🔄 MODO DEV: Atualizando notas do lead', leadId, notes);
      return;
    }
    
    try {
      await updateNotes(leadId, notes);
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  // Novas funções para manipulação de leads e colunas
  const handleEditLead = async (lead: Lead) => {
    try {
      console.log('📤 Editando lead no Supabase:', lead);
      
      if (DEVELOPMENT_MODE) {
        console.log('🔄 MODO DEV: Editando lead localmente');
        // Em modo DEV, apenas log
        return;
      }
      
      await updateLead(lead.id, lead);
      console.log('✅ Lead editado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao editar lead:', error);
      alert('Erro ao editar lead. Tente novamente.');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (DEVELOPMENT_MODE) {
      console.log('🔄 MODO DEV: Deletando lead', leadId);
      return;
    }
    
    try {
      console.log('📤 Deletando lead no Supabase:', leadId);
      await deleteLeadFromSupabase(leadId);
      console.log('✅ Lead deletado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao deletar lead:', error);
      alert('Erro ao deletar lead. Tente novamente.');
    }
  };

  const handleAssignLead = async (leadId: string, userId: string) => {
    try {
      console.log('📤 Atribuindo lead:', leadId, 'para usuário:', userId);
      
      if (DEVELOPMENT_MODE) {
        console.log('🔄 MODO DEV: Atribuindo lead localmente');
        // Em modo DEV, apenas log
        return;
      }
      
      await updateLead(leadId, { assignedTo: userId });
      console.log('✅ Lead atribuído com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao atribuir lead:', error);
      alert('Erro ao atribuir lead. Tente novamente.');
    }
  };

  const handleEditColumn = async (columnId: string, name: string, color: string) => {
    if (DEVELOPMENT_MODE) {
      console.log('🔄 MODO DEV: Editando coluna', columnId, name, color);
      return;
    }
    
    try {
      console.log('📤 Editando coluna no Supabase:', { columnId, name, color });
      await updateColumn(columnId, name, color);
      console.log('✅ Coluna editada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao editar coluna:', error);
      alert('Erro ao editar coluna. Tente novamente.');
    }
  };

  const handleDeleteColumn = async (columnId: string, newColumnId?: string) => {
    if (DEVELOPMENT_MODE) {
      console.log('🔄 MODO DEV: Deletando coluna', columnId, 'mover para:', newColumnId);
      return;
    }
    
    try {
      console.log('📤 Deletando coluna no Supabase:', { columnId, newColumnId });
      
      // Se há leads na coluna e foi especificada uma coluna destino
      if (newColumnId) {
        // Mover todos os leads da coluna para a nova coluna
        const leadsInColumn = leads.filter(lead => lead.columnId === columnId);
        for (const lead of leadsInColumn) {
          await updateLead(lead.id, { columnId: newColumnId });
        }
        console.log(`📤 Movidos ${leadsInColumn.length} leads para nova coluna`);
      }
      
      await deleteColumn(columnId);
      console.log('✅ Coluna deletada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao deletar coluna:', error);
      alert('Erro ao deletar coluna. Tente novamente.');
    }
  };

  const handleReorderColumns = async (newColumns: KanbanColumn[]) => {
    try {
      console.log('📤 Reordenando colunas via hook:', newColumns);
      await reorderColumns(newColumns);
      console.log('✅ Colunas reordenadas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao reordenar colunas:', error);
      alert('Erro ao reordenar colunas. Tente novamente.');
    }
  };

  const renderActiveTab = () => {
    // Show loading if instance is still being loaded
    if (!DEVELOPMENT_MODE && instanceLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando instâncias...</p>
          </div>
        </div>
      );
    }

    // Show error if no instance is available
    if (!DEVELOPMENT_MODE && !currentInstance && !instanceLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhuma instância disponível</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {instanceError || 'Este usuário não tem acesso a nenhuma instância.'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    // Show loading if data is still being fetched (apenas em modo produção)
    if (!DEVELOPMENT_MODE && loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando dados...</p>
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {error}
                </p>
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                  Verifique se os dados demo foram configurados corretamente no Supabase.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            closers={closers} 
            funnelMetrics={funnelMetrics}
            isManager={isManager}
            currentCloserId={currentCloserId}
          />
        );
      case 'leads':
        return (
          <LeadKanban
            leads={leads}
            columns={columns}
            onLeadMove={handleLeadMove}
            onAddColumn={handleAddColumn}
            onAddLead={handleAddLead}
            onUpdateNotes={handleUpdateNotes}
            onWhatsAppClick={handleWhatsAppClick}
            onFollowUpClick={handleFollowUpClick}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAssignLead={handleAssignLead}
            onEditColumn={handleEditColumn}
            onDeleteColumn={handleDeleteColumn}
            onReorderColumns={handleReorderColumns}
            isAdmin={isManager}
          />
        );
      case 'followup':
        return <FollowUp leads={leads} />;
      case 'meetings':
        return (
          <Meetings 
            leads={leads} 
            closers={closers}
            isManager={isManager}
            currentCloserId={currentCloserId}
          />
        );
      case 'whatsapp':
        return <WhatsAppShadow leads={leads} closers={closers} />;
      case 'integrations':
        return <Integrations />;
      case 'ai-performance':
        return <AIPerformance performanceData={performanceData} closers={closers} />;
      case 'team':
        return <TeamManagement closers={closers} performanceData={performanceData} />;
      case 'production-checklist':
        return <ProductionReadinessChecklist />;
      case 'instances':
        return <InstanceManagement />;
      default:
        return (
          <Dashboard 
            closers={closers} 
            funnelMetrics={funnelMetrics}
            isManager={isManager}
            currentCloserId={currentCloserId}
          />
        );
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isManager={isManager}
      developmentMode={DEVELOPMENT_MODE}
      currentUser={currentProfile}
    >
      {renderActiveTab()}
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InstanceProvider>
          <AppContent />
        </InstanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;