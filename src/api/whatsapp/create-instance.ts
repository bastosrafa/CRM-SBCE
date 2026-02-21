// API para criar instâncias WhatsApp
import { NextApiRequest, NextApiResponse } from 'next';
import { whatsappCompleteService } from '../../../services/whatsappCompleteService';
import { evolutionManagerService } from '../../../services/evolutionManagerService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { instanceId, phoneNumber, evolutionConfig } = req.body;

    if (!instanceId || !phoneNumber || !evolutionConfig) {
      return res.status(400).json({ 
        error: 'instanceId, phoneNumber e evolutionConfig são obrigatórios' 
      });
    }

    console.log('🚀 Criando instância WhatsApp:', { instanceId, phoneNumber });

    // 1. Verificar se já existe instância para este parceiro
    const existingInstance = await whatsappCompleteService.getInstanceByPartner(instanceId);
    
    if (existingInstance) {
      return res.status(409).json({ 
        error: 'Já existe uma instância WhatsApp para este parceiro',
        instance: existingInstance
      });
    }

    // 2. Criar instância no Evolution Manager
    const evolutionInstance = await evolutionManagerService.createInstance({
      name: `crm_instance_${instanceId}_${Date.now()}`,
      phoneNumber: phoneNumber,
      channel: 'whatsapp',
      baseUrl: evolutionConfig.baseUrl,
      token: evolutionConfig.token
    });

    console.log('✅ Instância criada no Evolution Manager:', evolutionInstance);

    // 3. Salvar instância no banco
    const instance = await whatsappCompleteService.createInstance(
      instanceId,
      evolutionInstance.instanceId,
      phoneNumber
    );

    // 4. Atualizar com QR Code se disponível
    if (evolutionInstance.qrCode) {
      await whatsappCompleteService.updateInstanceStatus(
        instance.id,
        'connecting',
        evolutionInstance.qrCode
      );
    }

    console.log('✅ Instância salva no banco:', instance);

    res.status(201).json({
      success: true,
      instance: {
        ...instance,
        qrCode: evolutionInstance.qrCode
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar instância:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
}
