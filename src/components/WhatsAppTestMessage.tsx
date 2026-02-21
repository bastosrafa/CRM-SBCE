import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { evolutionManagerService } from '../services/evolutionManagerService';
import { supabase } from '../lib/supabase';

interface WhatsAppTestMessageProps {
  currentInstanceId?: string;
}

const WhatsAppTestMessage: React.FC<WhatsAppTestMessageProps> = ({ currentInstanceId }) => {
  const [messageForm, setMessageForm] = useState({
    to: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!messageForm.to || !messageForm.message) {
      alert('Preencha o número e a mensagem!');
      return;
    }

    if (!currentInstanceId) {
      alert('Nenhuma instância selecionada!');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📤 Enviando mensagem WhatsApp...');
      console.log('📱 Para:', messageForm.to);
      console.log('💬 Mensagem:', messageForm.message);

      // Obter token específico da instância
      const instanceToken = localStorage.getItem(`whatsapp_token_${currentInstanceId}`);
      const config = JSON.parse(localStorage.getItem('evolution_config') || '{}');
      
      if (!instanceToken && !config.token) {
        alert('Token não encontrado! Configure o Evolution Manager primeiro.');
        return;
      }

      const tokenToUse = instanceToken || config.token;
      const baseUrl = config.baseUrl || 'https://api.sbceautomacoes.com';

      console.log('🔑 Token sendo usado:', tokenToUse ? 'Token específico' : 'Token master');
      console.log('🌐 Base URL:', baseUrl);

      // Buscar instância WhatsApp conectada
      const { data: whatsappInstances } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('instance_id', currentInstanceId)
        .eq('status', 'connected')
        .single();

      if (!whatsappInstances) {
        alert('Nenhuma instância WhatsApp conectada!');
        return;
      }

      console.log('🔧 Instância WhatsApp:', whatsappInstances.evolution_instance_id);

      const success = await evolutionManagerService.sendMessage(
        whatsappInstances.evolution_instance_id,
        {
          to: messageForm.to,
          message: messageForm.message
        },
        baseUrl,
        tokenToUse
      );

      if (success) {
        alert('✅ Mensagem enviada com sucesso!');
        setMessageForm({ to: '', message: '' });
      } else {
        alert('❌ Erro ao enviar mensagem. Verifique o número e tente novamente.');
      }

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      alert(`❌ Erro ao enviar mensagem: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <MessageSquare className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Testar Envio de Mensagem
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Número do WhatsApp
          </label>
          <input
            type="text"
            value={messageForm.to}
            onChange={(e) => setMessageForm(prev => ({ ...prev, to: e.target.value }))}
            placeholder="Ex: 5511999999999"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          />
          <p className="text-xs text-gray-500 mt-1">
            Formato: código do país + DDD + número (sem espaços ou símbolos)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mensagem
          </label>
          <textarea
            value={messageForm.message}
            onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Digite sua mensagem aqui..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <button
          onClick={handleSendMessage}
          disabled={!messageForm.to || !messageForm.message || isLoading}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? 'Enviando...' : 'Enviar Mensagem'}</span>
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Dica:</strong> Use o formato internacional do número (ex: 5511999999999 para Brasil)
        </p>
      </div>
    </div>
  );
};

export default WhatsAppTestMessage;
