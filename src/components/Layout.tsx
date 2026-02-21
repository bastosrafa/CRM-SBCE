import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  Clock, 
  MessageSquare, 
  Zap, 
  Brain, 
  Users,
  Settings,
  Bell,
  Search,
  Video,
  CheckSquare,
  Code,
  LogOut,
  Building2,
  Menu,
  X,
  BarChart3
} from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import InstanceSelector from './InstanceSelector';
import UserManagement from './UserManagement';
import StatusIndicator from './StatusIndicator';
import { useIsSuperAdmin } from '../contexts/InstanceContext';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'leads' | 'followup' | 'whatsapp' | 'integrations' | 'ai-performance' | 'team' | 'meetings' | 'production-checklist' | 'instances';
  onTabChange: (tab: 'dashboard' | 'leads' | 'followup' | 'whatsapp' | 'integrations' | 'ai-performance' | 'team' | 'meetings' | 'production-checklist' | 'instances') => void;
  isManager?: boolean;
  developmentMode?: boolean;
  currentUser?: any;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange, 
  isManager = true,
  developmentMode = false,
  currentUser
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  
  // Deve ser usado dentro de InstanceProvider (App.tsx)
  const isSuperAdmin = useIsSuperAdmin();
  
  // All navigation items available for everyone during development
  const navigationItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & Analytics' },
    { id: 'leads' as const, label: 'Lead Pipeline', icon: Kanban, description: 'Kanban Board' },
    { id: 'followup' as const, label: 'Follow-up', icon: Clock, description: 'Tasks & Reminders' },
    { id: 'meetings' as const, label: 'Meetings', icon: Video, description: 'AI Assistant & Transcription' },
    { id: 'whatsapp' as const, label: 'WhatsApp Shadow', icon: MessageSquare, description: 'Message Monitoring' },
    { id: 'integrations' as const, label: 'Integrations', icon: Zap, description: 'Google Workspace' },
    { id: 'ai-performance' as const, label: 'AI Performance', icon: Brain, description: 'Scripts & Analysis' },
    { id: 'team' as const, label: 'Team Management', icon: Users, description: 'Closer Performance' },
    { id: 'production-checklist' as const, label: 'Production Checklist', icon: CheckSquare, description: 'Ready for Production' },
    ...(isSuperAdmin ? [{ id: 'instances' as const, label: 'Instâncias', icon: Building2, description: 'Gerenciar Instâncias' }] : []),
  ];

  const handleLogout = async () => {
    if (developmentMode) {
      alert('🚀 MODO DESENVOLVIMENTO\n\nPara sair do modo desenvolvimento, altere DEVELOPMENT_MODE para false no arquivo App.tsx');
      return;
    }
    
    try {
      // Limpar localStorage primeiro
      localStorage.removeItem('currentInstanceId');
      localStorage.clear();
      
      // Fazer logout do Supabase (sem aguardar resposta)
      supabase.auth.signOut().catch(console.error);
      
      // Recarregar imediatamente
      window.location.href = '/';
      
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, tentar recarregar
      window.location.href = '/';
    }
  };

  const handleForceLogout = () => {
    // Forçar logout sem dependências
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Logo className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">SBCE CRM</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <InstanceSelector />
            <ThemeToggle />
            {developmentMode ? (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span className="font-medium">Dev</span>
              </div>
            ) : (
              <StatusIndicator />
            )}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
          flex flex-col transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Header */}
          <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <Logo className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">SBCE CRM</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 hidden lg:block">Sistema de Gestão Comercial</p>
              </div>
            </div>
            
            {/* Development Mode Banner */}
            {developmentMode && (
              <div className="mb-4 p-3 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Modo Desenvolvimento
                  </span>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  Login bypassed • Dados mock ativos
                </p>
              </div>
            )}
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search leads, tasks..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileMenuOpen(false); // Close mobile menu on selection
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                  <div className="flex-1">
                    <p className={`font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</p>
                    <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'} hidden lg:block`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* User Management Button */}
          {isManager && (
            <div className="px-4 lg:px-6 py-2">
              <button
                onClick={() => setShowUserManagement(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              >
                <Users className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                <div className="flex-1">
                  <p className="font-medium">Gestão de Usuários</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
                    Adicionar e gerenciar usuários
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'DV'}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentUser?.name || 'Dev User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currentUser?.role || 'admin'} • {developmentMode ? 'Development Mode' : 'Production'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Bell className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={developmentMode ? 'Sair do modo desenvolvimento' : 'Logout'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Desktop Top Bar */}
          <header className="hidden lg:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {navigationItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {navigationItems.find(item => item.id === activeTab)?.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <InstanceSelector />
                <ThemeToggle />
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  developmentMode 
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    developmentMode ? 'bg-orange-500' : 'bg-green-500 animate-pulse'
                  }`} />
                  <span className="text-xs font-medium">
                    {developmentMode ? 'Development' : 'Online'}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Modal de Gestão de Usuários */}
      {showUserManagement && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}
    </div>
  );
};

export default Layout;