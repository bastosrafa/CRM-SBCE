// Servidor simples para APIs do WhatsApp
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// API para criar instância WhatsApp
app.post('/api/whatsapp/create-instance', async (req, res) => {
  try {
    console.log('🚀 Criando instância WhatsApp:', req.body);
    
    const { instanceId, phoneNumber, evolutionConfig } = req.body;
    
    if (!instanceId || !evolutionConfig) {
      return res.status(400).json({ 
        error: 'instanceId e evolutionConfig são obrigatórios' 
      });
    }

    // Simular criação de instância
    const mockInstance = {
      id: 'instance-' + Date.now(),
      instance_id: instanceId,
      evolution_instance_id: 'evolution-' + Date.now(),
      phone_number: phoneNumber || '',
      status: 'connecting',
      qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      webhook_url: `http://localhost:${PORT}/api/whatsapp/webhook`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.status(200).json({
      message: 'Instância criada com sucesso',
      instance: mockInstance
    });
  } catch (error) {
    console.error('❌ Erro ao criar instância:', error);
    res.status(500).json({ error: error.message });
  }
});

// API para webhook WhatsApp
app.post('/api/whatsapp/webhook', (req, res) => {
  console.log('📨 Webhook recebido:', req.body);
  res.status(200).json({ message: 'Webhook processado com sucesso' });
});

// API para enviar mensagem
app.post('/api/whatsapp/send', (req, res) => {
  console.log('📤 Enviando mensagem:', req.body);
  res.status(200).json({ message: 'Mensagem enviada com sucesso' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});


