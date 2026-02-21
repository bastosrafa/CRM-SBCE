import { supabase } from '../lib/supabase';

export interface WhatsAppInstance {
  id: string;
  instance_id: string;
  evolution_instance_id: string;
  phone_number: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  webhook_url?: string;
  qr_code?: string;
  last_sync?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface WhatsAppMessage {
  id: string;
  instance_id: string;
  lead_id: string;
  closer_id?: string;
  message_id: string;
  from_number: string;
  to_number?: string;
  message: string;
  message_type: 'text' | 'image' | 'audio' | 'video' | 'document';
  direction: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  created_at: Date;
}

export interface ConversationAssignment {
  id: string;
  instance_id: string;
  lead_id: string;
  closer_id: string;
  status: 'active' | 'paused' | 'closed';
  assigned_at: Date;
  closed_at?: Date;
}

export interface CloserNotification {
  id: string;
  closer_id: string;
  lead_id: string;
  instance_id: string;
  type: 'new_message' | 'new_lead' | 'assignment';
  message: string;
  is_read: boolean;
  created_at: Date;
}

class WhatsAppCompleteService {
  /**
   * Criar instância WhatsApp para um parceiro
   */
  async createInstance(instanceId: string, evolutionInstanceId: string, phoneNumber: string): Promise<WhatsAppInstance> {
    try {
      // Primeiro, verificar se já existe uma instância com este ID
      const { data: existingInstance } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('instance_id', instanceId)
        .single();

      if (existingInstance) {
        console.log('⚠️ Instância já existe, atualizando...', existingInstance);
        
        // Atualizar instância existente
        const { data, error } = await supabase
          .from('whatsapp_instances')
          .update({
            evolution_instance_id: evolutionInstanceId,
            phone_number: phoneNumber,
            status: 'connected', // Marcar como conectada
            webhook_url: 'https://api.sbceautomacoes.com/api/whatsapp/webhook',
            updated_at: new Date().toISOString()
          })
          .eq('instance_id', instanceId)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao atualizar instância WhatsApp:', error);
          throw error;
        }

        console.log('✅ Instância WhatsApp atualizada:', data);
        return data;
      } else {
        // Criar nova instância
        const { data, error } = await supabase
          .from('whatsapp_instances')
          .insert({
            instance_id: instanceId,
            evolution_instance_id: evolutionInstanceId,
            phone_number: phoneNumber,
            status: 'connected', // Marcar como conectada
            webhook_url: 'https://api.sbceautomacoes.com/api/whatsapp/webhook'
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao criar instância WhatsApp:', error);
          throw error;
        }

        console.log('✅ Instância WhatsApp criada:', data);
        return data;
      }
    } catch (error) {
      console.error('❌ Erro ao criar/atualizar instância WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Atualizar status de uma instância
   */
  async updateInstanceStatus(instanceId: string, status: string, qrCode?: string): Promise<void> {
    try {
      const updateData: any = { 
        status: status,
        updated_at: new Date().toISOString()
      };
      
      if (qrCode) {
        updateData.qr_code = qrCode;
      }
      
      const { error } = await supabase
        .from('whatsapp_instances')
        .update(updateData)
        .eq('id', instanceId);

      if (error) {
        console.error('❌ Erro ao atualizar status da instância:', error);
        throw error;
      }

      console.log('✅ Status da instância atualizado:', status, qrCode ? 'com QR Code' : '');
    } catch (error) {
      console.error('❌ Erro ao atualizar status da instância:', error);
      throw error;
    }
  }

  /**
   * Obter instância WhatsApp de um parceiro
   */
  async getInstanceByPartner(instanceId: string): Promise<WhatsAppInstance | null> {
    try {
      console.log('🔍 Buscando instância WhatsApp para parceiro:', instanceId);
      
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('instance_id', instanceId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar instância:', error);
        throw error;
      }
      
      console.log('📱 Instância encontrada:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao obter instância WhatsApp:', error);
      return null;
    }
  }

  /**
   * Obter todas as instâncias WhatsApp de um parceiro
   */
  async getAllInstancesByPartner(instanceId: string): Promise<WhatsAppInstance[]> {
    try {
      console.log('🔍 Buscando todas as instâncias WhatsApp para parceiro:', instanceId);
      
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('instance_id', instanceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar instâncias:', error);
        throw error;
      }
      
      console.log('📱 Instâncias encontradas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao obter instâncias WhatsApp:', error);
      return [];
    }
  }

  /**
   * Atualizar status da instância
   */
  async updateInstanceStatus(instanceId: string, status: string, qrCode?: string, lastSync?: Date): Promise<void> {
    try {
      const updateData: any = { status };
      if (qrCode) updateData.qr_code = qrCode;
      if (lastSync) updateData.last_sync = lastSync;

      const { error } = await supabase
        .from('whatsapp_instances')
        .update(updateData)
        .eq('id', instanceId);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Erro ao atualizar status da instância:', error);
      throw error;
    }
  }

  /**
   * Adicionar atendente ao parceiro
   */
  async addCloserToPartner(instanceId: string, closerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('partner_closers')
        .insert({
          instance_id: instanceId,
          closer_id: closerId,
          is_active: true
        });

      if (error) throw error;
    } catch (error) {
      console.error('❌ Erro ao adicionar atendente:', error);
      throw error;
    }
  }

  /**
   * Obter atendentes de um parceiro
   */
  async getPartnerClosers(instanceId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('partner_closers')
        .select(`
          *,
          profiles:closer_id (
            id,
            name,
            email,
            role
          )
        `)
        .eq('instance_id', instanceId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao obter atendentes:', error);
      return [];
    }
  }

  /**
   * Atribuir conversa a um atendente
   */
  async assignConversation(instanceId: string, leadId: string, closerId: string): Promise<ConversationAssignment> {
    try {
      // Verificar se já existe atribuição ativa
      const { data: existing } = await supabase
        .from('conversation_assignments')
        .select('*')
        .eq('lead_id', leadId)
        .eq('status', 'active')
        .single();

      if (existing) {
        // Atualizar atribuição existente
        const { data, error } = await supabase
          .from('conversation_assignments')
          .update({ closer_id: closerId })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Criar nova atribuição
        const { data, error } = await supabase
          .from('conversation_assignments')
          .insert({
            instance_id: instanceId,
            lead_id: leadId,
            closer_id: closerId,
            status: 'active'
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('❌ Erro ao atribuir conversa:', error);
      throw error;
    }
  }

  /**
   * Obter conversas atribuídas a um atendente
   */
  async getCloserConversations(closerId: string): Promise<ConversationAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_assignments')
        .select(`
          *,
          leads:lead_id (
            id,
            name,
            phone,
            email,
            course
          ),
          whatsapp_instances:instance_id (
            id,
            phone_number,
            status
          )
        `)
        .eq('closer_id', closerId)
        .eq('status', 'active')
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao obter conversas do atendente:', error);
      return [];
    }
  }

  /**
   * Salvar mensagem WhatsApp
   */
  async saveMessage(messageData: Partial<WhatsAppMessage>): Promise<WhatsAppMessage> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erro ao salvar mensagem:', error);
      throw error;
    }
  }

  /**
   * Obter mensagens de uma conversa
   */
  async getConversationMessages(leadId: string, limit: number = 50): Promise<WhatsAppMessage[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('lead_id', leadId)
        .order('timestamp', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao obter mensagens da conversa:', error);
      return [];
    }
  }

  /**
   * Criar ou atualizar lead a partir de mensagem
   */
  async createOrUpdateLeadFromMessage(instanceId: string, fromNumber: string, message: string): Promise<string> {
    try {
      // Obter instância para pegar o partner_id
      const { data: instance } = await supabase
        .from('whatsapp_instances')
        .select('instance_id')
        .eq('id', instanceId)
        .single();

      if (!instance) throw new Error('Instância não encontrada');

      // Verificar se lead já existe
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('phone', fromNumber)
        .eq('instance_id', instance.instance_id)
        .single();

      if (existingLead) {
        return existingLead.id;
      }

      // Criar novo lead
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert({
          instance_id: instance.instance_id,
          name: fromNumber, // Nome temporário
          phone: fromNumber,
          email: null,
          company: null,
          course: 'WhatsApp',
          source: 'whatsapp',
          source_data: {
            instance_id: instanceId,
            from_number: fromNumber
          },
          auto_created: true,
          status: 'initial_contact'
        })
        .select('id')
        .single();

      if (error) throw error;
      return newLead.id;
    } catch (error) {
      console.error('❌ Erro ao criar/atualizar lead:', error);
      throw error;
    }
  }

  /**
   * Obter próximo atendente disponível
   */
  async getNextAvailableCloser(instanceId: string): Promise<string | null> {
    try {
      const { data: closers } = await supabase
        .from('partner_closers')
        .select('closer_id')
        .eq('instance_id', instanceId)
        .eq('is_active', true);

      if (!closers || closers.length === 0) return null;

      // Lógica simples: pegar o primeiro disponível
      // Em produção, implementar algoritmo de distribuição
      return closers[0].closer_id;
    } catch (error) {
      console.error('❌ Erro ao obter próximo atendente:', error);
      return null;
    }
  }

  /**
   * Criar notificação para atendente
   */
  async createNotification(closerId: string, leadId: string, instanceId: string, type: string, message: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('closer_notifications')
        .insert({
          closer_id: closerId,
          lead_id: leadId,
          instance_id: instanceId,
          type: type as any,
          message: message,
          is_read: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
    }
  }

  /**
   * Obter notificações de um atendente
   */
  async getCloserNotifications(closerId: string, unreadOnly: boolean = false): Promise<CloserNotification[]> {
    try {
      let query = supabase
        .from('closer_notifications')
        .select('*')
        .eq('closer_id', closerId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao obter notificações:', error);
      return [];
    }
  }

  /**
   * Marcar notificação como lida
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('closer_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
    }
  }
}

export const whatsappCompleteService = new WhatsAppCompleteService();
