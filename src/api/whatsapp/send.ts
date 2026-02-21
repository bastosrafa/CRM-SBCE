// API para enviar mensagens via Evolution Manager
import { NextApiRequest, NextApiResponse } from 'next';
import { whatsappCompleteService } from '../../../services/whatsappCompleteService';
import { evolutionManagerService } from '../../../services/evolutionManagerService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { instanceId, to, message, leadId, closerId } = req.body;

    if (!instanceId || !to || !message) {
      return res.status(400).json({ error: 'instanceId, to e message são obrigatórios' });
    }

    console.log('📤 Enviando mensagem:', { instanceId, to, message });

    // 1. Obter instância WhatsApp
    const { data: instance } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .eq('id', instanceId)
      .single();

    if (!instance) {
      return res.status(404).json({ error: 'Instância não encontrada' });
    }

    // 2. Enviar mensagem via Evolution Manager
    const success = await evolutionManagerService.sendMessage(
      instance.evolution_instance_id,
      { to, message },
      instance.webhook_url?.replace('/api/whatsapp/webhook', '') || '',
      'your-token' // Token deve vir da instância
    );

    if (!success) {
      return res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }

    // 3. Salvar mensagem no banco
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await whatsappCompleteService.saveMessage({
      instance_id: instanceId,
      lead_id: leadId,
      closer_id: closerId,
      message_id: messageId,
      from_number: instance.phone_number,
      to_number: to,
      message: message,
      message_type: 'text',
      direction: 'outgoing',
      status: 'sent',
      timestamp: new Date()
    });

    // 4. Atualizar lead se necessário
    if (leadId) {
      await supabase
        .from('leads')
        .update({ 
          status: 'in_progress',
          assignedTo: closerId 
        })
        .eq('id', leadId);
    }

    console.log('✅ Mensagem enviada com sucesso');

    res.status(200).json({ 
      success: true, 
      messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Importar supabase
import { supabase } from '../../../lib/supabase';