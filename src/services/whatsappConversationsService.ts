import { supabase } from '../lib/supabase';
import { evolutionManagerService } from './evolutionManagerService';

export interface WhatsAppMessage {
  id: string;
  leadId: string;
  closerId: string;
  message: string;
  timestamp: Date;
  type: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  fromMe?: boolean;
}

export interface WhatsAppConversation {
  leadId: string;
  closerId: string;
  messages: WhatsAppMessage[];
  lastActivity: Date;
  status: 'responded' | 'no-response' | 'pending';
  chatId?: string;
  phoneNumber?: string;
  leadName?: string;
}

class WhatsAppConversationsService {
  /**
   * Carregar conversas reais do WhatsApp
   */
  async loadRealConversations(currentInstanceId: string): Promise<WhatsAppConversation[]> {
    try {
      console.log('🔄 Carregando conversas reais do WhatsApp...');
      
      // Verificar se há instância WhatsApp conectada
      const { data: whatsappInstances } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('instance_id', currentInstanceId)
        .eq('status', 'connected')
        .single();

      if (!whatsappInstances) {
        console.log('⚠️ Nenhuma instância WhatsApp conectada');
        return [];
      }

      // Obter token específico da instância
      const instanceToken = localStorage.getItem(`whatsapp_token_${currentInstanceId}`);
      const config = JSON.parse(localStorage.getItem('evolution_config') || '{}');
      
      if (!instanceToken && !config.token) {
        console.log('⚠️ Token não encontrado');
        return [];
      }

      const tokenToUse = instanceToken || config.token;
      const baseUrl = config.baseUrl || 'https://api.sbceautomacoes.com';

      // Buscar conversas do Evolution Manager
      const chats = await evolutionManagerService.getChats(
        whatsappInstances.evolution_instance_id,
        baseUrl,
        tokenToUse
      );

      console.log('📱 Conversas encontradas:', chats.length);

      // Buscar leads para associar com as conversas
      const { data: leads } = await supabase
        .from('leads')
        .select('*');

      // Converter conversas do Evolution Manager para formato do CRM
      const realConversations: WhatsAppConversation[] = chats.map(chat => {
        const phoneNumber = chat.id.replace('@s.whatsapp.net', '');
        const lead = leads?.find(l => l.phone === phoneNumber);
        
        return {
          leadId: lead?.id || chat.id,
          closerId: lead?.assigned_to || '1',
          messages: [], // Será carregado quando selecionar a conversa
          lastActivity: new Date(chat.t * 1000), // Timestamp do Evolution Manager
          status: 'responded',
          chatId: chat.id,
          phoneNumber: phoneNumber,
          leadName: lead?.name || phoneNumber
        };
      });

      console.log('✅ Conversas reais carregadas:', realConversations.length);
      return realConversations;

    } catch (error) {
      console.error('❌ Erro ao carregar conversas reais:', error);
      return [];
    }
  }

  /**
   * Carregar mensagens de uma conversa específica
   */
  async loadMessages(chatId: string, currentInstanceId: string): Promise<WhatsAppMessage[]> {
    try {
      console.log('🔄 Carregando mensagens da conversa:', chatId);
      
      // Verificar se há instância WhatsApp conectada
      const { data: whatsappInstances } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('instance_id', currentInstanceId)
        .eq('status', 'connected')
        .single();

      if (!whatsappInstances) {
        console.log('⚠️ Nenhuma instância WhatsApp conectada');
        return [];
      }

      // Obter token específico da instância
      const instanceToken = localStorage.getItem(`whatsapp_token_${currentInstanceId}`);
      const config = JSON.parse(localStorage.getItem('evolution_config') || '{}');
      
      if (!instanceToken && !config.token) {
        console.log('⚠️ Token não encontrado');
        return [];
      }

      const tokenToUse = instanceToken || config.token;
      const baseUrl = config.baseUrl || 'https://api.sbceautomacoes.com';

      // Buscar mensagens do Evolution Manager
      const messages = await evolutionManagerService.getMessages(
        whatsappInstances.evolution_instance_id,
        chatId,
        baseUrl,
        tokenToUse
      );

      console.log('💬 Mensagens encontradas:', messages.length);

      // Converter mensagens do Evolution Manager para formato do CRM
      const realMessages: WhatsAppMessage[] = messages.map(msg => ({
        id: msg.key.id,
        leadId: chatId.replace('@s.whatsapp.net', ''),
        closerId: '1', // Será determinado pelo lead
        message: msg.message?.conversation || msg.message?.extendedTextMessage?.text || '[Mídia]',
        timestamp: new Date(msg.messageTimestamp * 1000),
        type: msg.key.fromMe ? 'outgoing' : 'incoming',
        status: 'read',
        fromMe: msg.key.fromMe
      }));

      console.log('✅ Mensagens carregadas:', realMessages.length);
      return realMessages;

    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      return [];
    }
  }

  /**
   * Enviar mensagem via WhatsApp
   */
  async sendMessage(chatId: string, message: string, currentInstanceId: string): Promise<boolean> {
    try {
      console.log('📤 Enviando mensagem via WhatsApp...');
      
      // Verificar se há instância WhatsApp conectada
      const { data: whatsappInstances } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('instance_id', currentInstanceId)
        .eq('status', 'connected')
        .single();

      if (!whatsappInstances) {
        console.log('⚠️ Nenhuma instância WhatsApp conectada');
        return false;
      }

      // Obter token específico da instância
      const instanceToken = localStorage.getItem(`whatsapp_token_${currentInstanceId}`);
      const config = JSON.parse(localStorage.getItem('evolution_config') || '{}');
      
      if (!instanceToken && !config.token) {
        console.log('⚠️ Token não encontrado');
        return false;
      }

      const tokenToUse = instanceToken || config.token;
      const baseUrl = config.baseUrl || 'https://api.sbceautomacoes.com';

      // Enviar mensagem via Evolution Manager
      const success = await evolutionManagerService.sendMessage(
        whatsappInstances.evolution_instance_id,
        {
          to: chatId,
          message: message
        },
        baseUrl,
        tokenToUse
      );

      if (success) {
        console.log('✅ Mensagem enviada com sucesso');
        return true;
      } else {
        console.log('❌ Erro ao enviar mensagem');
        return false;
      }

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  }
}

export const whatsappConversationsService = new WhatsAppConversationsService();

