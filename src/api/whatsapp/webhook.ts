// Webhook funcional para receber mensagens do Evolution Manager
import { NextApiRequest, NextApiResponse } from 'next';
import { whatsappCompleteService } from '../../../services/whatsappCompleteService';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data } = req.body;
    
    console.log('📨 Webhook recebido:', JSON.stringify(data, null, 2));

    // Processar mensagem recebida
    if (data?.key?.remoteJid && data?.message) {
      await processIncomingMessage(data);
    }

    // Processar atualização de status de conexão
    if (data?.connection?.state) {
      await processConnectionUpdate(data);
    }

    // Processar atualização de QR Code
    if (data?.qrcode) {
      await processQRCodeUpdate(data);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

interface WebhookMessageData {
  key: { remoteJid: string; id: string };
  message: Record<string, { conversation?: string; extendedTextMessage?: { text: string }; imageMessage?: { caption?: string }; audioMessage?: unknown; videoMessage?: unknown; documentMessage?: unknown }>;
  messageTimestamp?: number;
}
async function processIncomingMessage(data: WebhookMessageData) {
  try {
    const instanceId = data.key.remoteJid.split('@')[0];
    const fromNumber = data.key.remoteJid.replace('@s.whatsapp.net', '');
    const messageText = data.message.conversation || 
                       data.message.extendedTextMessage?.text || 
                       data.message.imageMessage?.caption || 
                       '[Mídia]';
    const messageId = data.key.id;
    const timestamp = new Date(data.messageTimestamp * 1000);

    console.log('💬 Processando mensagem:', {
      instanceId,
      fromNumber,
      messageText,
      messageId,
      timestamp
    });

    // 1. Obter instância WhatsApp
    const { data: instance } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .eq('evolution_instance_id', instanceId)
      .single();

    if (!instance) {
      console.error('❌ Instância não encontrada:', instanceId);
      return;
    }

    // 2. Criar ou atualizar lead
    const leadId = await whatsappCompleteService.createOrUpdateLeadFromMessage(
      instance.id,
      fromNumber,
      messageText
    );

    // 3. Salvar mensagem
    await whatsappCompleteService.saveMessage({
      instance_id: instance.id,
      lead_id: leadId,
      message_id: messageId,
      from_number: fromNumber,
      message: messageText,
      message_type: getMessageType(data.message),
      direction: 'incoming',
      status: 'delivered',
      timestamp: timestamp
    });

    // 4. Atribuir conversa a um atendente
    const closerId = await whatsappCompleteService.getNextAvailableCloser(instance.instance_id);
    
    if (closerId) {
      await whatsappCompleteService.assignConversation(instance.id, leadId, closerId);
      
      // 5. Criar notificação para o atendente
      await whatsappCompleteService.createNotification(
        closerId,
        leadId,
        instance.id,
        'new_message',
        `Nova mensagem de ${fromNumber}: ${messageText.substring(0, 50)}...`
      );
    }

    console.log('✅ Mensagem processada com sucesso');
  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error);
  }
}

interface WebhookConnectionData {
  connection: { instance?: string; state?: string };
}
async function processConnectionUpdate(data: WebhookConnectionData) {
  try {
    const instanceId = data.connection.instance;
    const state = data.connection.state;

    console.log('🔗 Atualizando status da conexão:', { instanceId, state });

    // Atualizar status da instância
    const { data: instance } = await supabase
      .from('whatsapp_instances')
      .select('id')
      .eq('evolution_instance_id', instanceId)
      .single();

    if (instance) {
      const status = state === 'open' ? 'connected' : 'disconnected';
      await whatsappCompleteService.updateInstanceStatus(
        instance.id,
        status,
        undefined,
        new Date()
      );
    }
  } catch (error) {
    console.error('❌ Erro ao processar atualização de conexão:', error);
  }
}

interface WebhookQRCodeData {
  instance?: string;
  qrcode?: string;
}
async function processQRCodeUpdate(data: WebhookQRCodeData) {
  try {
    const instanceId = data.instance;
    const qrCode = data.qrcode;

    console.log('📱 Atualizando QR Code:', { instanceId });

    // Atualizar QR Code da instância
    const { data: instance } = await supabase
      .from('whatsapp_instances')
      .select('id')
      .eq('evolution_instance_id', instanceId)
      .single();

    if (instance) {
      await whatsappCompleteService.updateInstanceStatus(
        instance.id,
        'connecting',
        qrCode
      );
    }
  } catch (error) {
    console.error('❌ Erro ao processar atualização de QR Code:', error);
  }
}

function getMessageType(message: Record<string, unknown>): 'text' | 'image' | 'audio' | 'video' | 'document' {
  if (message.conversation || message.extendedTextMessage) return 'text';
  if (message.imageMessage) return 'image';
  if (message.audioMessage) return 'audio';
  if (message.videoMessage) return 'video';
  if (message.documentMessage) return 'document';
  return 'text';
}

// Importar supabase (necessário para o webhook)
import { supabase } from '../../../lib/supabase';