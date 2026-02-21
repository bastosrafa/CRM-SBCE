// =====================================================
// API ENVIO WHATSAPP - RAILWAY
// =====================================================

export default async function handler(req, res) {
  // Verificar método HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, message, type = 'text' } = req.body;

    // Validações
    if (!to || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, message' 
      });
    }

    console.log('📤 Enviando mensagem WhatsApp:', { to, type });

    // TODO: Implementar envio real via WhatsApp Business API
    // Por enquanto, simular envio
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = {
      success: true,
      messageId,
      to,
      message,
      type,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    console.log('✅ Mensagem enviada:', response);

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
}
