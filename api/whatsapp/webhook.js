// =====================================================
// WEBHOOK WHATSAPP BUSINESS API - RAILWAY
// =====================================================

export default async function handler(req, res) {
  // Verificar método HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📱 Webhook WhatsApp recebido:', JSON.stringify(req.body, null, 2));

    const { entry } = req.body;

    if (!entry || !Array.isArray(entry)) {
      return res.status(400).json({ error: 'Invalid webhook data' });
    }

    // Processar cada entrada
    for (const entryItem of entry) {
      const { changes } = entryItem;

      if (!changes || !Array.isArray(changes)) {
        continue;
      }

      for (const change of changes) {
        const { value } = change;

        if (!value || !value.messages) {
          continue;
        }

        // Processar mensagens recebidas
        const messages = value.messages || [];
        
        for (const message of messages) {
          await processWhatsAppMessage(message, value);
        }
      }
    }

    // Responder com sucesso para o WhatsApp
    res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('❌ Erro no webhook WhatsApp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function processWhatsAppMessage(message, value) {
  try {
    console.log('🔄 Processando mensagem WhatsApp:', message.id);

    // Extrair dados da mensagem
    const messageData = {
      messageId: message.id,
      from: message.from,
      timestamp: message.timestamp,
      type: message.type,
      text: message.text?.body || '',
      contact: value.contacts?.[0] || {},
      context: message.context || {}
    };

    console.log('📝 Dados da mensagem:', messageData);

    // TODO: Integrar com Supabase
    // 1. Buscar lead pelo telefone
    // 2. Criar/atualizar conversa
    // 3. Salvar mensagem
    // 4. Atualizar status do lead

    // Por enquanto, apenas log
    console.log('✅ Mensagem processada com sucesso');

  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error);
  }
}
