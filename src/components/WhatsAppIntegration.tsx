import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  MessageSquare, 
  Settings, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Smartphone,
  Wifi,
  WifiOff,
  Copy,
  ExternalLink,
  Users,
  Bell,
  Send,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { evolutionManagerService } from '../services/evolutionManagerService';
import { whatsappCompleteService } from '../services/whatsappCompleteService';
import { whatsappAutoReconnectService } from '../services/whatsappAutoReconnectService';
import { useInstance } from '../contexts/InstanceContext';
import { useAuth } from '../contexts/AuthContext';
import { WhatsAppDiagnostics } from '../utils/whatsappDiagnostics';

interface WhatsAppInstance {
  id: string;
  name: string;
  phoneNumber: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  qrCode?: string;
  lastSync?: Date;
  instanceId?: string;
}

interface EvolutionManagerConfig {
  baseUrl: string;
  token: string;
  defaultChannel: string;
}

const WhatsAppIntegration: React.FC = () => {
  const { currentInstance } = useInstance();
  const { user } = useAuth();
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [showToken, setShowToken] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [messageForm, setMessageForm] = useState({
    to: '',
    message: ''
  });
  const [config, setConfig] = useState<EvolutionManagerConfig>({
    baseUrl: 'https://api.sbceautomacoes.com', // URL do Evolution Manager no Portainer
    token: '', // Token será carregado do localStorage ou variável de ambiente
    defaultChannel: 'whatsapp'
  });

  // Carregar dados do sistema completo
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Iniciando carregamento de dados...');
        console.log('🔍 currentInstance:', currentInstance);
        console.log('🔍 user:', user);
        
        if (!currentInstance || !user) {
          console.log('⚠️ currentInstance ou user não disponível');
          return;
        }

      // Carregar configuração salva (ou usar padrão se não existir)
      const savedConfig = localStorage.getItem('evolutionManagerConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        // Só usar configuração salva se for válida (não localhost)
        if (parsedConfig.baseUrl && !parsedConfig.baseUrl.includes('localhost')) {
          setConfig(parsedConfig);
        }
      }

      // Carregar todas as instâncias WhatsApp do parceiro
      console.log('🔄 Carregando instâncias WhatsApp do parceiro:', currentInstance.id);
      const instances = await whatsappCompleteService.getAllInstancesByPartner(currentInstance.id);
      console.log('🔍 Instâncias encontradas no banco:', instances);
      
      if (instances && instances.length > 0) {
        const formattedInstances = instances.map(instance => ({
          id: instance.id,
          name: `WhatsApp - ${instance.phone_number || 'Conectado'}`,
          phoneNumber: instance.phone_number || '',
          status: instance.status === 'connected' ? 'connected' : instance.status === 'connecting' ? 'connecting' : 'disconnected',
          qrCode: instance.qr_code,
          lastSync: instance.last_sync,
          instanceId: instance.evolution_instance_id
        }));
        
        setInstances(formattedInstances);
        console.log('✅ Instâncias WhatsApp carregadas:', formattedInstances);
        console.log('📊 Total de instâncias:', formattedInstances.length);
      } else {
        console.log('⚠️ Nenhuma instância WhatsApp encontrada para o parceiro:', currentInstance.id);
        setInstances([]);
      }

      // Verificar status das instâncias no Evolution Manager
      if (instances && instances.length > 0) {
        for (const instance of instances) {
          if (instance.evolution_instance_id) {
            try {
              console.log('🔄 Verificando status da instância no Evolution Manager...', instance.evolution_instance_id);
              const instanceToken = localStorage.getItem(`whatsapp_token_${currentInstance.id}`);
              const tokenToUse = instanceToken || config.token;
              
              if (tokenToUse) {
                const status = await evolutionManagerService.getInstanceStatus(
                  instance.evolution_instance_id,
                  config.baseUrl,
                  tokenToUse
                );
                
                console.log('📊 Status da instância no Evolution Manager:', status);
                
                // Se está connecting e não tem QR Code, buscar QR Code
                if (status.state === 'connecting' && !instance.qr_code) {
                  console.log('🔄 Buscando QR Code para instância em connecting...');
                  try {
                    const qrResponse = await fetch(`${config.baseUrl}/instance/connect/${instance.evolution_instance_id}`, {
                      method: 'GET',
                      headers: {
                        'apikey': tokenToUse,
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    if (qrResponse.ok) {
                      const qrData = await qrResponse.json();
                      const qrCode = qrData.base64 || qrData.qrcode?.base64;
                      
                      if (qrCode) {
                        console.log('✅ QR Code obtido, atualizando banco...');
                        await whatsappCompleteService.updateInstanceStatus(instance.id, 'connecting', qrCode);
                        
                        // Atualizar estado local
                        setInstances(prev => prev.map(inst => 
                          inst.id === instance.id 
                            ? { ...inst, status: 'connecting', qrCode: qrCode }
                            : inst
                        ));
                      }
                    }
                  } catch (qrError) {
                    console.error('❌ Erro ao buscar QR Code:', qrError);
                  }
                }
                
                // Atualizar status no banco se necessário
                if (status.connected && instance.status !== 'connected') {
                  console.log('🔄 Atualizando status para conectado...');
                  await whatsappCompleteService.updateInstanceStatus(instance.id, 'connected');
                  
                  // Atualizar estado local
                  setInstances(prev => prev.map(inst => 
                    inst.id === instance.id 
                      ? { ...inst, status: 'connected' }
                      : inst
                  ));
                } else if (!status.connected && instance.status === 'connected') {
                  console.log('🔄 Atualizando status para desconectado...');
                  await whatsappCompleteService.updateInstanceStatus(instance.id, 'disconnected');
                  
                  // Atualizar estado local
                  setInstances(prev => prev.map(inst => 
                    inst.id === instance.id 
                      ? { ...inst, status: 'disconnected' }
                      : inst
                  ));
                }
              }
            } catch (error) {
              console.error('❌ Erro ao verificar status da instância:', error);
            }
          }
        }
      }

      // Carregar notificações do usuário
      console.log('🔄 Carregando notificações...');
      const userNotifications = await whatsappCompleteService.getCloserNotifications(user.id, true);
      setNotifications(userNotifications);
      console.log('✅ Notificações carregadas:', userNotifications.length);

      // Carregar conversas do usuário
      console.log('🔄 Carregando conversas...');
      const userConversations = await whatsappCompleteService.getCloserConversations(user.id);
      setConversations(userConversations);
      console.log('✅ Conversas carregadas:', userConversations.length);
      
      console.log('✅ Carregamento de dados concluído!');
      
      // Iniciar monitoramento automático de reconexão
      if (currentInstance && user) {
        console.log('🔄 Iniciando monitoramento automático de reconexão...');
        whatsappAutoReconnectService.startAutoReconnectMonitoring({
          baseUrl: config.baseUrl,
          token: config.token,
          partnerInstanceId: currentInstance.id,
          partnerName: currentInstance.name
        });
      }
      
      } catch (error) {
        console.error('❌ Erro geral ao carregar dados:', error);
        console.error('❌ Stack trace:', error.stack);
      }
    };

    loadData();
  }, [currentInstance, user]);

  // Salvar configuração
  const saveConfig = () => {
    localStorage.setItem('evolutionManagerConfig', JSON.stringify(config));
    setShowConfigModal(false);
    console.log('✅ Configuração salva:', config);
  };

  // Limpar configuração antiga (localhost)
  const clearOldConfig = () => {
    localStorage.removeItem('evolutionManagerConfig');
    console.log('🗑️ Configuração antiga removida');
  };

  // Deletar instância WhatsApp (do CRM e Evolution Manager)
  const deleteWhatsAppInstance = async () => {
    if (!instances.length || !currentInstance) return;

    const confirmDelete = confirm(
      '⚠️ Tem certeza que deseja deletar a instância WhatsApp?\n\n' +
      'Isso irá:\n' +
      '• Deletar a instância no Evolution Manager\n' +
      '• Remover a configuração do CRM\n' +
      '• Você precisará reconfigurar o WhatsApp\n\n' +
      'Continuar?'
    );

    if (!confirmDelete) return;

    try {
      const instance = instances[0];
      
      // Deletar do Evolution Manager
      if (instance.instanceId) {
        const instanceToken = localStorage.getItem(`whatsapp_token_${currentInstance.id}`);
        const tokenToUse = instanceToken || config.token;
        
        console.log('🗑️ Deletando instância do Evolution Manager...');
        const deleteResponse = await fetch(`${config.baseUrl}/instance/delete/${instance.instanceId}`, {
          method: 'DELETE',
          headers: {
            'apikey': tokenToUse,
            'Content-Type': 'application/json'
          }
        });

        if (deleteResponse.ok) {
          console.log('✅ Instância deletada do Evolution Manager');
        } else {
          console.log('⚠️ Erro ao deletar do Evolution Manager, continuando...');
        }
      }

      // Limpar localStorage
      localStorage.removeItem(`whatsapp_token_${currentInstance.id}`);
      
      // Limpar estado local
      setInstances([]);
      
      // Parar monitoramento automático
      whatsappAutoReconnectService.stopAutoReconnectMonitoring();
      
      alert('✅ Instância WhatsApp deletada com sucesso!');
      
      // Recarregar página para limpar tudo
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Erro ao deletar instância:', error);
      alert('Erro ao deletar instância. Tente novamente.');
    }
  };

  // Criar instância automaticamente
  const handleCreateInstance = async () => {
    if (!config.baseUrl || !config.token) {
      alert('Configure o Evolution Manager primeiro!');
      setShowConfigModal(true);
      return;
    }

    if (!currentInstance) {
      alert('Nenhuma instância selecionada!');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🚀 Criando instância WhatsApp para parceiro:', currentInstance.id);
      console.log('🔧 Configuração:', { baseUrl: config.baseUrl, token: config.token ? '***' : 'não definido' });
      
      // Verificar se deve usar Evolution Manager real ou Mock API
      const useRealAPI = config.baseUrl && config.baseUrl !== 'https://evolution-api.example.com' && config.token && config.token !== 'your-api-token-here';
      
      let result;
      
      if (useRealAPI) {
        console.log('🚀 Usando Evolution Manager REAL:', config.baseUrl);
        
        // Criar nova instância no Evolution Manager
        const evolutionResult = await evolutionManagerService.createInstance({
          name: currentInstance.id,
          phoneNumber: '',
          channel: config.defaultChannel,
          baseUrl: config.baseUrl,
          token: config.token
        });
        
        console.log('✅ Instância criada no Evolution Manager:', evolutionResult);
        
          // Criar instância no banco de dados
          const dbInstance = await whatsappCompleteService.createInstance(
            currentInstance.id,
            evolutionResult.instanceId,
            ''
          );

          // Salvar o token específico da instância no localStorage
          if (evolutionResult.instanceToken) {
            localStorage.setItem(`whatsapp_token_${currentInstance.id}`, evolutionResult.instanceToken);
            console.log('💾 Token específico salvo para instância:', currentInstance.id);
          }

          result = {
            message: 'Instância criada com sucesso',
            instance: {
              id: dbInstance.id,
              instance_id: currentInstance.id,
              evolution_instance_id: evolutionResult.instanceId,
              phone_number: '',
              status: 'connecting',
              qrCode: evolutionResult.qrCode,
              webhook_url: dbInstance.webhook_url,
              created_at: dbInstance.created_at,
              updated_at: dbInstance.updated_at,
              instanceToken: evolutionResult.instanceToken
            }
          };
      } else {
        console.log('🔧 Usando Mock API para desenvolvimento...');
        
        // Verificar se Mock API está disponível
        console.log('🔍 Verificando Mock API...');
        console.log('🔍 window.createWhatsAppInstance:', typeof window.createWhatsAppInstance);
        
        if (typeof window.createWhatsAppInstance !== 'function') {
          console.error('❌ Mock API não encontrada. Tentando recarregar...');
          
          // Tentar aguardar um pouco e verificar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (typeof window.createWhatsAppInstance !== 'function') {
            throw new Error('Mock API não está carregada. Verifique se o arquivo create-instance.js está sendo carregado corretamente.');
          }
        }
        
        console.log('✅ Mock API encontrada, criando instância...');
        
        result = await window.createWhatsAppInstance({
          instanceId: currentInstance.id,
          phoneNumber: '', // Será preenchido após conectar
          evolutionConfig: config
        });
      }

        console.log('✅ Instância criada:', result);
        console.log('🔍 QR Code recebido:', result.instance?.qrCode ? 'SIM' : 'NÃO');
        console.log('🔍 QR Code value:', result.instance?.qrCode);

        if (!result || !result.instance) {
          throw new Error('Resposta inválida da API');
        }

      // Atualizar estado local
      const newInstance: WhatsAppInstance = {
        id: result.instance.id,
        name: `WhatsApp - ${result.instance.phone_number || 'Conectando...'}`,
        phoneNumber: result.instance.phone_number,
        status: 'connecting',
        instanceId: result.instance.evolution_instance_id,
        qrCode: result.instance.qrCode
      };

      setInstances([newInstance]);
      setSelectedInstance(newInstance.id);
      setShowQRModal(true);
      
      console.log('✅ Estado atualizado com nova instância:', newInstance);
      
    } catch (error) {
      console.error('❌ Erro detalhado ao criar instância:', error);
      
      let errorMessage = 'Erro desconhecido';
      
      if (error.message.includes('Mock API')) {
        errorMessage = `Problema com a Mock API: ${error.message}`;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e as configurações do Evolution Manager.';
      } else {
        errorMessage = `Erro ao criar instância: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Conectar via QR Code
  const handleConnectQR = async (instanceId: string) => {
    try {
      const qrCode = await evolutionManagerService.getQrCode(
        instanceId, 
        config.baseUrl, 
        config.token
      );
      
      setInstances(prev => prev.map(inst => 
        inst.instanceId === instanceId 
          ? { ...inst, qrCode, status: 'connecting' }
          : inst
      ));
      
      setShowQRModal(true);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      alert('Erro ao gerar QR Code. Tente novamente.');
    }
  };

  // Simular conexão bem-sucedida
  const handleQRSuccess = () => {
    setInstances(prev => prev.map(inst => 
      inst.id === selectedInstance 
        ? { 
            ...inst, 
            status: 'connected', 
            qrCode: undefined,
            phoneNumber: '+55 11 99999-9999', // Simulado
            lastSync: new Date()
          }
        : inst
    ));
    setShowQRModal(false);
  };

  // Enviar mensagem de teste
  const handleSendTestMessage = async (instanceId: string, to?: string, message?: string) => {
    try {
      const phoneNumber = to || '+5511999999999';
      const testMessage = message || 'Teste do CRM SBCE';
      
      const success = await evolutionManagerService.sendMessage(
        instanceId,
        { to: phoneNumber, message: testMessage },
        config.baseUrl,
        config.token
      );
      
      if (success) {
        alert(`✅ Mensagem enviada com sucesso para ${phoneNumber}!`);
      } else {
        alert('❌ Erro ao enviar mensagem.');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      alert('❌ Erro ao enviar mensagem.');
    }
  };

  // Verificar status da instância
  const checkInstanceStatus = async (instanceId: string) => {
    if (!config.baseUrl || !config.token) return;

    try {
      const status = await evolutionManagerService.getInstanceStatus(
        instanceId,
        config.baseUrl,
        config.token
      );
      
      setInstances(prev => prev.map(inst => 
        inst.instanceId === instanceId 
          ? { 
              ...inst, 
              status: status.connected ? 'connected' : 'disconnected',
              lastSync: status.connected ? new Date() : inst.lastSync
            }
          : inst
      ));
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <span>Integração WhatsApp</span>
            {notifications.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notifications.length}
              </span>
            )}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Conecte seu WhatsApp para receber e enviar mensagens automaticamente
          </p>
        </div>
        
        {/* Botões principais simplificados */}
        <div className="flex gap-3 mb-6">
          {instances.length === 0 ? (
            <button
              onClick={() => {
                if (user?.user_metadata?.role === 'super_admin') {
                  setShowConfigModal(true);
                } else {
                  // Para parceiros, criar instância diretamente
                  handleCreateInstance();
                }
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <Settings className="w-5 h-5 inline mr-2" />
              {user?.user_metadata?.role === 'super_admin' ? 'Configurar WhatsApp' : 'Conectar WhatsApp'}
            </button>
          ) : (
            <button
              onClick={() => setShowQRModal(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Conectar Outro Número
            </button>
          )}
          
          {/* Botão de configuração discreto - apenas para super admin */}
          {user?.user_metadata?.role === 'super_admin' && (
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Configurações Evolution Manager (Super Admin)"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notificações */}
      {notifications.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            Notificações ({notifications.length})
          </h4>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="text-sm text-blue-800 dark:text-blue-200">
                {notification.message}
              </div>
            ))}
            {notifications.length > 3 && (
              <div className="text-xs text-blue-600 dark:text-blue-400">
                +{notifications.length - 3} mais notificações
              </div>
            )}
          </div>
        </div>
      )}


      {/* Conversas Ativas */}
      {conversations.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Conversas Ativas ({conversations.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {conversations.slice(0, 4).map((conversation) => (
              <div key={conversation.id} className="text-sm text-green-800 dark:text-green-200 bg-white dark:bg-gray-800 p-2 rounded">
                <div className="font-medium">{conversation.leads?.name || 'Lead'}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {conversation.whatsapp_instances?.phone_number}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instâncias WhatsApp Conectadas */}
      {instances.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Smartphone className="w-5 h-5 mr-2 text-green-600" />
              Números WhatsApp Conectados ({instances.length})
            </h3>
            <button
              onClick={() => setShowQRModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Número
            </button>
          </div>
        </>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instances.map(instance => (
          <div key={instance.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {instance.name}
                </h4>
              </div>
              
              <div className="flex items-center space-x-1">
                {instance.status === 'connected' ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : instance.status === 'connecting' ? (
                  <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {instance.phoneNumber || 'Não conectado'}
              </p>
              
              {instance.lastSync && (
                <p className="text-xs text-gray-500">
                  Última sincronização: {instance.lastSync.toLocaleString()}
                </p>
              )}
              
              <div className="flex items-center space-x-2">
                {instance.status === 'disconnected' && (
                  <button
                    onClick={() => handleConnectQR(instance.instanceId!)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                  >
                    <QrCode className="w-3 h-3 inline mr-1" />
                    Conectar
                  </button>
                )}
                
                {instance.status === 'connected' && (
                  <button
                    onClick={() => {
                      const to = prompt('Digite o número do WhatsApp (ex: 5511999999999):');
                      if (to) {
                        const message = prompt('Digite a mensagem:');
                        if (message) {
                          handleSendTestMessage(instance.instanceId!, to, message);
                        }
                      }
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                  >
                    Testar Envio
                  </button>
                )}
                
                <button
                  onClick={() => checkInstanceStatus(instance.instanceId!)}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors"
                >
                  Atualizar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Configuração */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configurar Evolution Manager
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Aviso sobre Mock API vs Real API */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  ℹ️ Configuração do Evolution Manager
                </h4>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <p>
                    <strong>Para usar QR Code real:</strong> Configure uma URL e token válidos do Evolution Manager.
                  </p>
                  <p>
                    <strong>Webhook URL:</strong> <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">https://api.sbceautomacoes.com/api/whatsapp/webhook</code>
                  </p>
                  <p>
                    <strong>Token Master:</strong> <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">[CONFIGURADO NO LOCALSTORAGE]</code>
                  </p>
                  <p className="text-xs">
                    <strong>Eventos ativados:</strong> QRCODE_UPDATED, CONNECTION_UPDATE, MESSAGES_UPSERT, CONTACTS_UPSERT
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL Base do Evolution Manager
                </label>
                <input
                  type="url"
                  value={config.baseUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://api.sbceautomacoes.com"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL do Evolution Manager no Portainer: https://api.sbceautomacoes.com
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Token de API
                </label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={config.token}
                    onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
                    placeholder="Seu token de API"
                    className="w-full px-3 py-2 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showToken ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Token master para criar instâncias • <strong>Atual:</strong> [CONFIGURADO NO LOCALSTORAGE]
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Canal
                </label>
                <select
                  value={config.defaultChannel}
                  onChange={(e) => setConfig(prev => ({ ...prev, defaultChannel: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={async () => {
                    if (!config.baseUrl || !config.token) {
                      alert('Configure URL e Token antes de testar!');
                      return;
                    }
                    
                    try {
                      setIsLoading(true);
                      console.log('🧪 Testando conexão com Evolution Manager...');
                      console.log('🔑 Token sendo testado:', config.token);
                      console.log('🌐 URL sendo testada:', config.baseUrl);
                      
                      // Tentar listar instâncias para testar a conexão
                      const instances = await evolutionManagerService.listInstances(config.baseUrl, config.token);
                      console.log('✅ Conexão bem-sucedida! Instâncias encontradas:', instances.length);
                      
                      alert(`✅ Conexão com Evolution Manager bem-sucedida!\n\nInstâncias encontradas: ${instances.length}\n\nToken: ${config.token}\nURL: ${config.baseUrl}`);
                    } catch (error) {
                      console.error('❌ Erro ao testar conexão:', error);
                      alert(`❌ Erro na conexão: ${error.message}\n\nToken: ${config.token}\nURL: ${config.baseUrl}\n\nVerifique se:\n- A URL está correta\n- O token é válido\n- O Evolution Manager está rodando\n- O token está configurado no container`);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={!config.baseUrl || !config.token || isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg"
                >
                  {isLoading ? 'Testando...' : 'Testar Conexão'}
                </button>
                
                <button
                  onClick={saveConfig}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-md mx-4 p-6">
            <div className="text-center">
              <QrCode className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Conectar WhatsApp
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Escaneie o código QR com o WhatsApp do seu celular
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                {instances.length > 0 && instances[0]?.qrCode ? (
                  <img
                    src={instances[0].qrCode}
                    alt="QR Code WhatsApp"
                    className="w-48 h-48 mx-auto"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                    <QrCode className="w-12 h-12 mb-2" />
                    <p>QR Code não disponível</p>
                    <p className="text-xs mt-1">Clique em "Buscar QR Code"</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>1. Abra o WhatsApp no celular</p>
                  <p>2. Toque em Menu (⋮) &gt; Dispositivos conectados</p>
                  <p>3. Toque em "Conectar um dispositivo"</p>
                  <p>4. Aponte a câmera para este código</p>
                </div>
                
                <div className="flex items-center justify-center space-x-3 pt-4">
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    onClick={async () => {
                      console.log('🔄 Recriando instância no Evolution Manager...');
                      const instance = instances[0];
                      if (instance && instance.instanceId) {
                        try {
                          const instanceToken = localStorage.getItem(`whatsapp_token_${currentInstance?.id}`);
                          const tokenToUse = instanceToken || config.token;
                          
                          if (tokenToUse) {
                            // Deletar instância atual
                            console.log('🗑️ Deletando instância atual...');
                            const deleteResponse = await fetch(`${config.baseUrl}/instance/delete/${instance.instanceId}`, {
                              method: 'DELETE',
                              headers: {
                                'apikey': tokenToUse,
                                'Content-Type': 'application/json'
                              }
                            });
                            
                            if (deleteResponse.ok) {
                              console.log('✅ Instância deletada, criando nova...');
                              
                              // Criar nova instância
                              const newInstanceResult = await evolutionManagerService.createInstance({
                                name: currentInstance?.name || 'CRM SBCE',
                                baseUrl: config.baseUrl,
                                token: tokenToUse,
                                channel: 'whatsapp'
                              });
                              
                              if (newInstanceResult.qrCode) {
                                console.log('✅ Nova instância criada com QR Code!');
                                
                                // Salvar token específico da nova instância
                                localStorage.setItem(`whatsapp_token_${currentInstance?.id}`, newInstanceResult.instanceToken || tokenToUse);
                                
                                // Atualizar banco de dados
                                await whatsappCompleteService.createInstance(
                                  currentInstance?.id || '',
                                  newInstanceResult.instanceId,
                                  ''
                                );
                                
                                // Atualizar estado local
                                setInstances([{
                                  id: currentInstance?.id || '',
                                  name: `WhatsApp - Conectado`,
                                  phoneNumber: '',
                                  status: 'connecting',
                                  qrCode: newInstanceResult.qrCode,
                                  lastSync: new Date(),
                                  instanceId: newInstanceResult.instanceId
                                }]);
                                
                                alert('✅ Nova instância criada! QR Code atualizado.');
                              } else {
                                alert('❌ Erro ao criar nova instância.');
                              }
                            } else {
                              alert('❌ Erro ao deletar instância atual.');
                            }
                          }
                        } catch (error) {
                          console.error('❌ Erro ao recriar instância:', error);
                          alert('Erro ao recriar instância. Tente novamente.');
                        }
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Recriar Instância
                  </button>
                  
                  <button
                    onClick={async () => {
                      // Simular conexão bem-sucedida
                      setShowQRModal(false);
                      
                      // Atualizar status para conectado
                      if (instances.length > 0) {
                        const instance = instances[0];
                        await whatsappCompleteService.updateInstanceStatus(instance.id, 'connected');
                        
                        // Atualizar estado local
                        setInstances(prev => prev.map(inst => ({...inst, status: 'connected'})));
                        
                        alert('✅ WhatsApp conectado com sucesso!');
                      }
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Conectado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppIntegration;