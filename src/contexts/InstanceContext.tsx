import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useTabVisibility } from '../hooks/useTabVisibility';
import { 
  Instance, 
  InstanceUser, 
  UserRole, 
  InstancePermissions, 
  InstanceContextType 
} from '../utils/types';

const InstanceContext = createContext<InstanceContextType | undefined>(undefined);

interface InstanceProviderProps {
  children: ReactNode;
}

// Permissões por role
const ROLE_PERMISSIONS: Record<UserRole, InstancePermissions> = {
  [UserRole.SUPER_ADMIN]: {
    canViewAllInstances: true,
    canCreateInstances: true,
    canManageUsers: true,
    canViewAllData: true,
    canSwitchInstances: true,
    canViewOwnInstance: true,
    canManageOwnUsers: true,
    canViewOwnData: true,
    canManageOwnLeads: true,
  },
  [UserRole.MANAGER]: {
    canViewAllInstances: false,
    canCreateInstances: false,
    canManageUsers: true,
    canViewAllData: false,
    canSwitchInstances: false,
    canViewOwnInstance: true,
    canManageOwnUsers: true,
    canViewOwnData: true,
    canManageOwnLeads: true,
  },
  [UserRole.CLOSER]: {
    canViewAllInstances: false,
    canCreateInstances: false,
    canManageUsers: false,
    canViewAllData: false,
    canSwitchInstances: false,
    canViewOwnInstance: true,
    canManageOwnUsers: false,
    canViewOwnData: true,
    canManageOwnLeads: true,
  },
  [UserRole.VIEWER]: {
    canViewAllInstances: false,
    canCreateInstances: false,
    canManageUsers: false,
    canViewAllData: false,
    canSwitchInstances: false,
    canViewOwnInstance: true,
    canManageOwnUsers: false,
    canViewOwnData: true,
    canManageOwnLeads: false,
  },
};

export const InstanceProvider: React.FC<InstanceProviderProps> = ({ children }) => {
  const [currentInstance, setCurrentInstance] = useState<Instance | null>(null);
  const [availableInstances, setAvailableInstances] = useState<Instance[]>([]);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.CLOSER);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hook para detectar mudanças de visibilidade da aba
  const { shouldPreventReload } = useTabVisibility();

  // Carregar instâncias disponíveis para o usuário
  const loadUserInstances = async (forceReload = false) => {
    // Se já temos instâncias carregadas e não é um reload forçado, não recarregar
    if (!forceReload && availableInstances.length > 0 && currentInstance) {
      console.log('🛡️ Instâncias já carregadas, evitando recarregamento desnecessário');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('⚠️ Usuário não autenticado, aguardando autenticação...');
        setIsLoading(false);
        return;
      }

      console.log('🔍 Carregando instâncias para usuário:', user.email);
      console.log('🔍 User ID:', user.id);

      // Verificar se é super admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar profile:', profileError);
        throw profileError;
      }

      console.log('✅ Profile encontrado:', profile);
      const isSuperAdmin = profile?.role === 'super_admin';
      console.log('👤 É super admin?', isSuperAdmin);

      let instances: Instance[] = [];

      if (isSuperAdmin) {
        // Super admin vê todas as instâncias
        console.log('🔍 Super admin - carregando todas as instâncias...');
        const { data: allInstances, error: allInstancesError } = await supabase
          .from('instances')
          .select('*')
          .eq('status', 'active');

        if (allInstancesError) {
          console.error('❌ Erro ao carregar instâncias:', allInstancesError);
          throw allInstancesError;
        }

        instances = allInstances?.map(instance => ({
          ...instance,
          createdAt: new Date(instance.created_at),
          updatedAt: new Date(instance.updated_at),
        })) || [];

        console.log('✅ Super admin - instâncias carregadas:', instances.length);
        console.log('📋 Instâncias encontradas:', instances.map(i => i.name));
      } else {
        // Usuário comum vê apenas suas instâncias
        console.log('👤 Usuário comum - carregando instâncias do usuário...');
        console.log('🔍 User ID para buscar:', user.id);
        
        const { data: instanceUsers, error: instanceUsersError } = await supabase
          .from('instance_users')
          .select(`
            role,
            is_active,
            instances (
              id,
              name,
              slug,
              type,
              owner_id,
              status,
              settings,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true);
          
        if (instanceUsersError) {
          console.error('❌ Erro ao buscar instance_users:', instanceUsersError);
          throw instanceUsersError;
        }

        console.log('📋 instanceUsers encontrados:', instanceUsers);
        console.log('📋 instanceUsers length:', instanceUsers?.length || 0);
        
        if (instanceUsers && instanceUsers.length > 0) {
          console.log('📋 Primeiro instanceUser:', instanceUsers[0]);
          console.log('📋 Primeiro instanceUser.instances:', instanceUsers[0]?.instances);
        }
        
        instances = instanceUsers?.filter(iu => iu.instances).map(iu => ({
          ...iu.instances,
          createdAt: new Date(iu.instances.created_at),
          updatedAt: new Date(iu.instances.updated_at),
        })) || [];

        console.log('✅ Usuário comum - instâncias carregadas:', instances.length);
        console.log('📋 Instâncias encontradas:', instances.map(i => i.name));
        
        if (instances.length === 0) {
          console.error('❌ Nenhuma instância encontrada para o usuário!');
          console.log('🔍 Verificando se o usuário está associado a alguma instância...');
          
          // Verificar se existe alguma associação
          const { data: allAssociations } = await supabase
            .from('instance_users')
            .select('*')
            .eq('user_id', user.id);
            
          console.log('🔍 Todas as associações do usuário:', allAssociations);
        }
      }

      // Definir instâncias disponíveis
      console.log('📤 Definindo availableInstances:', instances.length);
      setAvailableInstances(instances);

      // Definir instância atual
      const savedInstanceId = localStorage.getItem('currentInstanceId');
      let instanceToSet = null;

      console.log('🔍 savedInstanceId:', savedInstanceId);
      console.log('🔍 instances disponíveis:', instances.map(i => ({ id: i.id, name: i.name })));

      // Tentar usar instância salva
      if (savedInstanceId) {
        instanceToSet = instances.find(i => i.id === savedInstanceId);
        if (instanceToSet) {
          console.log('✅ Usando instância salva:', instanceToSet.name);
        } else {
          console.log('⚠️ Instância salva não encontrada nas disponíveis');
        }
      }

      // Se não encontrou a salva, usar a primeira disponível
      if (!instanceToSet && instances.length > 0) {
        instanceToSet = instances[0];
        console.log('✅ Usando primeira instância disponível:', instanceToSet.name);
      }

      if (instanceToSet) {
        console.log('📤 Definindo currentInstance:', instanceToSet.name);
        setCurrentInstance(instanceToSet);
        localStorage.setItem('currentInstanceId', instanceToSet.id);
      } else {
        console.error('❌ Nenhuma instância disponível!');
        setError('Nenhuma instância disponível para este usuário');
      }

      // Definir role do usuário
      if (isSuperAdmin) {
        setUserRole(UserRole.SUPER_ADMIN);
        console.log('✅ Role definido como SUPER_ADMIN');
      } else {
        setUserRole(UserRole.CLOSER);
        console.log('✅ Role definido como CLOSER');
      }

    } catch (err) {
      console.error('❌ Erro ao carregar instâncias:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // Trocar instância
  const switchInstance = async (instanceId: string) => {
    try {
      const instance = availableInstances.find(i => i.id === instanceId);
      if (!instance) {
        throw new Error('Instância não encontrada');
      }

      setCurrentInstance(instance);
      localStorage.setItem('currentInstanceId', instanceId);

      // Recarregar role do usuário para a nova instância
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: instanceUser } = await supabase
          .from('instance_users')
          .select('role')
          .eq('instance_id', instanceId)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (instanceUser) {
          // Mapear string para enum
          const roleMapping: Record<string, UserRole> = {
            'super_admin': UserRole.SUPER_ADMIN,
            'manager': UserRole.MANAGER,
            'closer': UserRole.CLOSER,
            'viewer': UserRole.VIEWER
          };
          const mappedRole = roleMapping[instanceUser.role] || UserRole.CLOSER;
          setUserRole(mappedRole);
        }
      }
    } catch (err) {
      console.error('Erro ao trocar instância:', err);
      setError(err instanceof Error ? err.message : 'Erro ao trocar instância');
    }
  };

  // Carregar instâncias na inicialização (apenas uma vez)
  useEffect(() => {
    loadUserInstances(true); // Forçar carregamento na inicialização
  }, []);

  // Recarregar instâncias quando o usuário mudar (mas não quando a aba volta ao foco)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Se a aba não está ativa, não recarregar para evitar recarregamentos desnecessários
      if (!shouldPreventReload && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        console.log('🛡️ Evento de auth ignorado - aba não está ativa');
        return;
      }

      // Só recarregar se realmente mudou o estado de autenticação
      if (event === 'SIGNED_IN' && session?.user) {
        // Verificar se já temos instâncias carregadas para evitar recarregamento desnecessário
        if (availableInstances.length === 0 || !currentInstance) {
          console.log('🔄 Usuário logado, recarregando instâncias...');
          loadUserInstances();
        } else {
          console.log('🔄 Usuário logado, mas instâncias já carregadas - mantendo estado atual');
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🔄 Usuário deslogado, limpando instâncias...');
        setCurrentInstance(null);
        setAvailableInstances([]);
        setUserRole(UserRole.CLOSER);
      } else if (event === 'TOKEN_REFRESHED') {
        // Token refresh não deve recarregar instâncias
        console.log('🔄 Token renovado, mantendo instâncias atuais');
      }
    });

    return () => subscription.unsubscribe();
  }, [availableInstances.length, currentInstance, shouldPreventReload]);

  // Log quando a aba volta ao foco (controle feito pelo useTabVisibility)
  useEffect(() => {
    if (shouldPreventReload && currentInstance && availableInstances.length > 0) {
      console.log('👁️ Aba ativa com dados carregados - mantendo estado atual');
    }
  }, [shouldPreventReload, currentInstance, availableInstances]);

  const permissions = ROLE_PERMISSIONS[userRole];

  const value: InstanceContextType = {
    currentInstance,
    availableInstances,
    switchInstance,
    userRole,
    permissions,
    isLoading,
    error,
    refetch: loadUserInstances,
  };

  return (
    <InstanceContext.Provider value={value}>
      {children}
    </InstanceContext.Provider>
  );
};

export const useInstance = (): InstanceContextType => {
  const context = useContext(InstanceContext);
  if (context === undefined) {
    throw new Error('useInstance deve ser usado dentro de um InstanceProvider');
  }
  return context;
};

// Hook para verificar permissões específicas
export const usePermissions = () => {
  const { permissions } = useInstance();
  return permissions;
};

// Hook para verificar se é super admin
export const useIsSuperAdmin = () => {
  const { userRole } = useInstance();
  return userRole === UserRole.SUPER_ADMIN;
};
