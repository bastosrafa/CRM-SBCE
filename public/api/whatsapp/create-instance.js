// API Mock para criar instância WhatsApp
// Este arquivo simula a API do backend para desenvolvimento

console.log('🔧 Mock API WhatsApp carregada');

// Simular delay de rede
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simular criação de instância
const createInstance = async (requestData) => {
  console.log('🚀 Mock API: Criando instância WhatsApp:', requestData);
  
  try {
    // Simular delay de rede
    await delay(1000);
    
    const mockInstance = {
      id: 'mock-instance-' + Date.now(),
      instance_id: requestData.instanceId,
      evolution_instance_id: 'evolution-' + Date.now(),
      phone_number: requestData.phoneNumber || '',
      status: 'connecting',
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZmZmZiIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMwMDAwMDAiPk1vY2sgUVIgQ29kZTwvdGV4dD4KPC9zdmc+',
      webhook_url: `${window.location.origin}/api/whatsapp/webhook`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('✅ Mock API: Instância criada:', mockInstance);

    return {
      message: 'Instância criada com sucesso (MOCK)',
      instance: mockInstance
    };
  } catch (error) {
    console.error('❌ Mock API: Erro ao criar instância:', error);
    throw new Error('Erro na Mock API: ' + error.message);
  }
};

// Função para verificar se a Mock API está funcionando
const testMockAPI = () => {
  console.log('🧪 Testando Mock API...');
  return createInstance({
    instanceId: 'test',
    phoneNumber: '+5511999999999',
    evolutionConfig: {
      baseUrl: 'https://test.com',
      token: 'test-token'
    }
  });
};

// Exportar funções para uso global
window.createWhatsAppInstance = createInstance;
window.testMockAPI = testMockAPI;

// Verificar se está funcionando
console.log('✅ Mock API WhatsApp inicializada com sucesso');
console.log('🔍 Funções disponíveis:', {
  createWhatsAppInstance: typeof window.createWhatsAppInstance,
  testMockAPI: typeof window.testMockAPI
});