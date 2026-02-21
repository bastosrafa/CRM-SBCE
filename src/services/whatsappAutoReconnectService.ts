import { evolutionManagerService } from './evolutionManagerService';
import { whatsappCompleteService } from './whatsappCompleteService';

interface AutoReconnectConfig {
  baseUrl: string;
  token: string;
  partnerInstanceId: string;
  partnerName: string;
}

class WhatsAppAutoReconnectService {
  private reconnectAttempts = new Map<string, number>();
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  private readonly RECONNECT_DELAY = 30000; // 30 segundos

  /**
   * Verifica se uma instância precisa de reconexão automática
   */
  async checkAndReconnectIfNeeded(config: AutoReconnectConfig): Promise<boolean> {
    try {
      console.log('🔄 Verificando se instância precisa de reconexão...');
      
      // Buscar instância no banco
      const instance = await whatsappCompleteService.getInstanceByPartner(config.partnerInstanceId);
      
      if (!instance) {
        console.log('⚠️ Nenhuma instância encontrada no banco');
        return false;
      }

      // Verificar status no Evolution Manager
      const instanceToken = localStorage.getItem(`whatsapp_token_${config.partnerInstanceId}`);
      const tokenToUse = instanceToken || config.token;
      
      if (!tokenToUse) {
        console.log('⚠️ Token da instância não encontrado');
        return false;
      }

      const status = await evolutionManagerService.getInstanceStatus(
        instance.evolution_instance_id,
        config.baseUrl,
        tokenToUse
      );

      console.log('📊 Status da instância:', status);

      // Se está conectada, tudo ok
      if (status.connected) {
        console.log('✅ Instância conectada, atualizando status no banco');
        await whatsappCompleteService.updateInstanceStatus(instance.id, 'connected');
        return true;
      }

      // Se está em connecting, verificar se tem QR Code válido
      if (status.state === 'connecting') {
        if (!instance.qr_code) {
          console.log('🔄 Instância em connecting sem QR Code, buscando...');
          await this.refreshQRCode(config, instance);
          return false;
        }
        return false;
      }

      // Se está desconectada ou com erro, tentar reconectar automaticamente
      if (!status.connected && this.shouldAttemptReconnect(config.partnerInstanceId)) {
        console.log('🔄 Instância desconectada, iniciando reconexão automática...');
        return await this.autoReconnect(config, instance);
      }

      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar reconexão:', error);
      
      // Se houve erro de comunicação, tentar reconectar
      if (this.shouldAttemptReconnect(config.partnerInstanceId)) {
        console.log('🔄 Erro de comunicação, tentando reconexão automática...');
        const instance = await whatsappCompleteService.getInstanceByPartner(config.partnerInstanceId);
        if (instance) {
          return await this.autoReconnect(config, instance);
        }
      }
      
      return false;
    }
  }

  /**
   * Reconecta automaticamente uma instância
   */
  private async autoReconnect(config: AutoReconnectConfig, instance: any): Promise<boolean> {
    try {
      console.log('🔄 Iniciando reconexão automática...');
      
      // Incrementar tentativas
      const attempts = this.getReconnectAttempts(config.partnerInstanceId);
      this.reconnectAttempts.set(config.partnerInstanceId, attempts + 1);

      // Deletar instância atual no Evolution Manager
      const instanceToken = localStorage.getItem(`whatsapp_token_${config.partnerInstanceId}`);
      const tokenToUse = instanceToken || config.token;
      
      console.log('🗑️ Deletando instância atual no Evolution Manager...');
      const deleteResponse = await fetch(`${config.baseUrl}/instance/delete/${instance.evolution_instance_id}`, {
        method: 'DELETE',
        headers: {
          'apikey': tokenToUse,
          'Content-Type': 'application/json'
        }
      });

      if (!deleteResponse.ok) {
        console.error('❌ Erro ao deletar instância atual');
        return false;
      }

      // Aguardar um pouco antes de criar nova instância
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Criar nova instância
      console.log('🆕 Criando nova instância...');
      const newInstanceResult = await evolutionManagerService.createInstance({
        name: config.partnerName,
        baseUrl: config.baseUrl,
        token: tokenToUse,
        channel: 'whatsapp'
      });

      if (newInstanceResult.qrCode) {
        console.log('✅ Nova instância criada com sucesso!');
        
        // Salvar novo token
        localStorage.setItem(`whatsapp_token_${config.partnerInstanceId}`, newInstanceResult.instanceToken || tokenToUse);
        
        // Atualizar banco de dados
        await whatsappCompleteService.createInstance(
          config.partnerInstanceId,
          newInstanceResult.instanceId,
          ''
        );

        // Resetar tentativas de reconexão
        this.reconnectAttempts.delete(config.partnerInstanceId);
        
        return true;
      } else {
        console.error('❌ Erro ao criar nova instância');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro na reconexão automática:', error);
      return false;
    }
  }

  /**
   * Atualiza o QR Code de uma instância em connecting
   */
  private async refreshQRCode(config: AutoReconnectConfig, instance: any): Promise<void> {
    try {
      const instanceToken = localStorage.getItem(`whatsapp_token_${config.partnerInstanceId}`);
      const tokenToUse = instanceToken || config.token;
      
      console.log('🔄 Buscando novo QR Code...');
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
          console.log('✅ Novo QR Code obtido!');
          await whatsappCompleteService.updateInstanceStatus(instance.id, 'connecting', qrCode);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar QR Code:', error);
    }
  }

  /**
   * Verifica se deve tentar reconectar
   */
  private shouldAttemptReconnect(partnerInstanceId: string): boolean {
    const attempts = this.getReconnectAttempts(partnerInstanceId);
    return attempts < this.MAX_RECONNECT_ATTEMPTS;
  }

  /**
   * Obtém número de tentativas de reconexão
   */
  private getReconnectAttempts(partnerInstanceId: string): number {
    return this.reconnectAttempts.get(partnerInstanceId) || 0;
  }

  /**
   * Limpa tentativas de reconexão (chamado quando conecta com sucesso)
   */
  clearReconnectAttempts(partnerInstanceId: string): void {
    this.reconnectAttempts.delete(partnerInstanceId);
  }

  /**
   * Inicia monitoramento automático de reconexão
   */
  startAutoReconnectMonitoring(config: AutoReconnectConfig): void {
    console.log('🔄 Iniciando monitoramento automático de reconexão...');
    
    const checkReconnection = async () => {
      try {
        await this.checkAndReconnectIfNeeded(config);
      } catch (error) {
        console.error('❌ Erro no monitoramento automático:', error);
      }
    };

    // Verificar a cada 30 segundos
    setInterval(checkReconnection, this.RECONNECT_DELAY);
  }

  /**
   * Para o monitoramento automático
   */
  stopAutoReconnectMonitoring(): void {
    console.log('⏹️ Parando monitoramento automático de reconexão');
    // Limpar todos os intervalos seria necessário em uma implementação mais robusta
  }
}

export const whatsappAutoReconnectService = new WhatsAppAutoReconnectService();

