export interface EvolutionManagerConfig {
  baseUrl: string;
  token: string;
  defaultChannel: string;
}

export interface CreateInstanceRequest {
  name: string;
  phoneNumber: string;
  channel: string;
  baseUrl: string;
  token: string;
}

export interface InstanceStatus {
  connected: boolean;
  state: string;
}

export class EvolutionManagerService {
  /**
   * Criar instância no Evolution Manager
   */
  static async createInstance(request: CreateInstanceRequest): Promise<{ instanceId: string; qrCode?: string; instanceToken?: string }> {
    try {
      // URL do webhook - sempre usar a URL pública
      const webhookUrl = 'https://api.sbceautomacoes.com/api/whatsapp/webhook';

      console.log('🔗 Criando instância com webhook:', webhookUrl);
      console.log('📋 Dados da instância:', {
        name: request.name,
        channel: request.channel,
        webhook: webhookUrl
      });

      // Gerar nome único para evitar conflitos
      const uniqueInstanceName = `${request.name}-${Date.now()}`;
      
      const requestBody = {
        instanceName: uniqueInstanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS'
      };

      console.log('📤 Enviando requisição para:', `${request.baseUrl}/instance/create`);
      console.log('🔑 Token sendo usado:', request.token);
      console.log('📦 Body da requisição:', requestBody);

      const response = await fetch(`${request.baseUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'apikey': request.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.error('❌ Erro na resposta do Evolution Manager:', errorData);
          console.error('❌ Status:', response.status);
          console.error('❌ Status Text:', response.statusText);
          console.error('❌ Headers:', Object.fromEntries(response.headers.entries()));
          console.error('❌ Error Data completo:', JSON.stringify(errorData, null, 2));
          errorMessage = errorData.message || errorData.error || errorData.details || errorData.reason || errorMessage;
        } catch (e) {
          console.error('❌ Erro ao ler resposta de erro:', e);
          try {
            const responseText = await response.text();
            console.error('❌ Response Text:', responseText);
            errorMessage = `Erro 400: ${responseText}`;
          } catch (textError) {
            console.error('❌ Erro ao ler texto da resposta:', textError);
          }
        }
        
        if (response.status === 401) {
          errorMessage = 'Token de autenticação inválido. Verifique se o token está correto no Evolution Manager.';
        } else if (response.status === 409) {
          errorMessage = 'Instância já existe com este nome. Tente novamente.';
        } else if (response.status === 400) {
          errorMessage = `Bad Request: ${errorMessage}. Verifique o formato da requisição.`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Instância criada com sucesso:', data);
      console.log('🔍 Dados completos da resposta:', JSON.stringify(data, null, 2));
      
      // O Evolution Manager retorna um token específico para esta instância
      const instanceToken = data.instance?.token || data.token || request.token;
      
      // Verificar onde está o QR Code na resposta
      const qrCodeData = data.qrcode || data.base64 || data.qrCode || data.instance?.qrcode || data.instance?.base64;
      const qrCode = qrCodeData?.base64 || qrCodeData;
      console.log('🔍 QR Code encontrado:', qrCode ? 'SIM' : 'NÃO');
      console.log('🔍 QR Code value:', qrCode);
      console.log('🔍 QR Code data structure:', qrCodeData);
      
      return {
        instanceId: data.instance?.instanceName || data.instanceName || uniqueInstanceName,
        qrCode: qrCode,
        instanceToken: instanceToken // Token específico da instância
      };
    } catch (error) {
      console.error('❌ Error creating Evolution instance:', error);
      throw error;
    }
  }

  /**
   * Obter status da instância
   */
  static async getInstanceStatus(instanceId: string, baseUrl: string, token: string): Promise<InstanceStatus> {
    try {
      const response = await fetch(`${baseUrl}/instance/connectionState/${instanceId}`, {
        method: 'GET',
        headers: {
          'apikey': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        connected: data.instance.state === 'open',
        state: data.instance.state
      };
    } catch (error) {
      console.error('❌ Error getting instance status:', error);
      return { connected: false, state: 'error' };
    }
  }

  /**
   * Obter QR Code da instância
   */
  static async getQrCode(instanceId: string, baseUrl: string, token: string): Promise<string> {
    try {
      const response = await fetch(`${baseUrl}/instance/connect/${instanceId}`, {
        method: 'GET',
        headers: {
          'apikey': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.base64;
    } catch (error) {
      console.error('❌ Error getting QR code:', error);
      throw error;
    }
  }

  /**
   * Enviar mensagem
   */
  static async sendMessage(instanceId: string, message: { to: string; message: string }, baseUrl: string, token: string): Promise<boolean> {
    try {
      const response = await fetch(`${baseUrl}/message/sendText/${instanceId}`, {
        method: 'POST',
        headers: {
          'apikey': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: message.to,
          text: message.message
        })
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return false;
    }
  }

  /**
   * Deletar instância
   */
  static async deleteInstance(instanceId: string, baseUrl: string, token: string): Promise<boolean> {
    try {
      const response = await fetch(`${baseUrl}/instance/delete/${instanceId}`, {
        method: 'DELETE',
        headers: {
          'apikey': token,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Error deleting instance:', error);
      return false;
    }
  }

  /**
   * Listar todas as instâncias
   */
  static async listInstances(baseUrl: string, token: string): Promise<any[]> {
    try {
      const response = await fetch(`${baseUrl}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'apikey': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('❌ Error listing instances:', error);
      return [];
    }
  }

  /**
   * Buscar conversas de uma instância
   */
  static async getChats(instanceId: string, baseUrl: string, token: string): Promise<any[]> {
    try {
      const response = await fetch(`${baseUrl}/chat/findChats/${instanceId}`, {
        method: 'GET',
        headers: {
          'apikey': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching chats:', error);
      return [];
    }
  }

  /**
   * Buscar mensagens de um chat
   */
  static async getMessages(instanceId: string, chatId: string, baseUrl: string, token: string): Promise<any[]> {
    try {
      const response = await fetch(`${baseUrl}/chat/findMessages/${instanceId}`, {
        method: 'POST',
        headers: {
          'apikey': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          where: {
            key: {
              remoteJid: chatId
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      return [];
    }
  }
}

export const evolutionManagerService = {
  createInstance: EvolutionManagerService.createInstance,
  getInstanceStatus: EvolutionManagerService.getInstanceStatus,
  getQrCode: EvolutionManagerService.getQrCode,
  sendMessage: EvolutionManagerService.sendMessage,
  deleteInstance: EvolutionManagerService.deleteInstance,
  listInstances: EvolutionManagerService.listInstances,
  getChats: EvolutionManagerService.getChats,
  getMessages: EvolutionManagerService.getMessages
};
