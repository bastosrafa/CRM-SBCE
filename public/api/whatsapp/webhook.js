// API Route para webhook WhatsApp
// Para Vite (não Next.js)

export default async function handler(req, res) {
  console.log('📨 Webhook recebido:', req.body);
  
  // Simular processamento de webhook
  if (req.method === 'POST') {
    const { event, data } = req.body;
    
    if (event === 'messages.upsert') {
      console.log('💬 Nova mensagem recebida:', data);
    } else if (event === 'connection.update') {
      console.log('🔄 Atualização de conexão:', data);
    }
    
    res.status(200).json({ message: 'Webhook processado com sucesso (MODO DEV)' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}









