import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Phone, 
  Users, 
  QrCode, 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical,
  CheckCheck,
  Check,
  Clock,
  Wifi,
  WifiOff,
  User,
  Filter,
  Star,
  Archive,
  Trash2,
  Forward,
  Reply,
  Download,
  Image,
  File,
  Mic,
  Video,
  Camera,
  Smile,
  Settings,
  Plus
} from 'lucide-react';
import { Lead, Closer, WhatsAppMessage, WhatsAppConversation } from '../utils/types';
import { whatsappConversationsService } from '../services/whatsappConversationsService';
import WhatsAppIntegration from './WhatsAppIntegration';

interface WhatsAppShadowProps {
  leads: Lead[];
  closers: Closer[];
}

interface WhatsAppConnection {
  isConnected: boolean;
  qrCode: string | null;
  phoneNumber: string | null;
  lastSync: Date | null;
  closerId: string;
}

const WhatsAppShadow: React.FC<WhatsAppShadowProps> = ({ leads, closers }) => {
  const [activeTab, setActiveTab] = useState<'conversations' | 'integration'>('conversations');
  const [connections, setConnections] = useState<WhatsAppConnection[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCloser, setSelectedCloser] = useState<string>('all');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCloserForQR, setSelectedCloserForQR] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock QR Code generation
  const generateQRCode = () => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <g fill="black">
          ${Array.from({ length: 25 }, (_, i) => 
            Array.from({ length: 25 }, (_, j) => 
              Math.random() > 0.5 ? `<rect x="${j*8}" y="${i*8}" width="8" height="8"/>` : ''
            ).join('')
          ).join('')}
        </g>
        <text x="100" y="220" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
          WhatsApp QR Code
        </text>
      </svg>
    `)}`;
  };

  // Carregar conversas reais do WhatsApp
  useEffect(() => {
    const loadConversations = async () => {
      try {
        // Tentar carregar conversas reais primeiro
        const realConversations = await whatsappConversationsService.loadRealConversations(currentInstance?.id || '');
        
        if (realConversations.length > 0) {
          console.log('✅ Usando conversas reais do WhatsApp:', realConversations.length);
          setConversations(realConversations);
        } else {
          console.log('⚠️ Nenhuma conversa real encontrada, usando dados mock');
          loadMockConversations();
        }
      } catch (error) {
        console.error('❌ Erro ao carregar conversas reais:', error);
        console.log('🔄 Usando dados mock como fallback');
        loadMockConversations();
      }
    };

    const loadMockConversations = () => {
      const mockConversations: WhatsAppConversation[] = leads.map(lead => ({
        leadId: lead.id,
        closerId: lead.assignedTo === 'João Santos' ? '1' : 
                  lead.assignedTo === 'Maria Costa' ? '2' : 
                  lead.assignedTo === 'Pedro Alves' ? '3' : '1',
        messages: [
          {
            id: `msg_${lead.id}_1`,
            leadId: lead.id,
            closerId: lead.assignedTo === 'João Santos' ? '1' : '2',
            message: `Olá ${lead.name}! Obrigado pelo interesse em nosso ${lead.course}. Quando podemos conversar?`,
            timestamp: new Date(Date.now() - Math.random() * 86400000),
            type: 'outgoing',
            status: 'read'
          },
          {
            id: `msg_${lead.id}_2`,
            leadId: lead.id,
            closerId: lead.assignedTo === 'João Santos' ? '1' : '2',
            message: `Oi! Posso falar agora sim. Tenho algumas dúvidas sobre o curso.`,
            timestamp: new Date(Date.now() - Math.random() * 43200000),
            type: 'incoming',
            status: 'read'
          },
          {
            id: `msg_${lead.id}_3`,
            leadId: lead.id,
            closerId: lead.assignedTo === 'João Santos' ? '1' : '2',
            message: `Perfeito! Vou te enviar mais informações. Qual seria o melhor horário para uma apresentação?`,
            timestamp: new Date(Date.now() - Math.random() * 21600000),
            type: 'outgoing',
            status: 'delivered'
          }
        ],
        lastActivity: new Date(Date.now() - Math.random() * 21600000),
        status: Math.random() > 0.3 ? 'responded' : 'no-response'
      }));

      setConversations(mockConversations);
    };

    loadConversations();

    // Mock connections
    const mockConnections: WhatsAppConnection[] = closers.map(closer => ({
      isConnected: Math.random() > 0.3,
      qrCode: null,
      phoneNumber: closer.id === '1' ? '+55 11 99999-0001' : 
                   closer.id === '2' ? '+55 11 99999-0002' : null,
      lastSync: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 3600000) : null,
      closerId: closer.id
    }));

    setConnections(mockConnections);
  }, [leads, closers]);

  // Evitar recarregamento desnecessário quando a aba volta ao foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Não recarregar quando a aba volta ao foco se já temos dados
      if (!document.hidden && conversations.length > 0) {
        console.log('👁️ Aba voltou ao foco, mantendo conversas atuais (evitando reload)');
        return;
      }
    };

    const handleFocus = () => {
      // Não recarregar quando a janela ganha foco se já temos dados
      if (conversations.length > 0) {
        console.log('🎯 Janela ganhou foco, mantendo conversas atuais (evitando reload)');
        return;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [conversations]);

  const handleQRLogin = async (closerId: string) => {
    setIsLoading(true);
    setSelectedCloserForQR(closerId);
    
    // Simulate QR code generation
    setTimeout(() => {
      const qrCode = generateQRCode();
      setConnections(prev => prev.map(conn => 
        conn.closerId === closerId 
          ? { ...conn, qrCode }
          : conn
      ));
      setShowQRModal(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleQRSuccess = () => {
    // Simulate successful connection
    setConnections(prev => prev.map(conn => 
      conn.closerId === selectedCloserForQR 
        ? { 
            ...conn, 
            isConnected: true, 
            qrCode: null,
            phoneNumber: `+55 11 99999-${conn.closerId.padStart(4, '0')}`,
            lastSync: new Date()
          }
        : conn
    ));
    setShowQRModal(false);
    setSelectedCloserForQR('');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const conversation = conversations.find(c => c.leadId === selectedConversation);
    if (!conversation) return;

    const newMsg: WhatsAppMessage = {
      id: `msg_${Date.now()}`,
      leadId: selectedConversation,
      closerId: conversation.closerId,
      message: newMessage.trim(),
      timestamp: new Date(),
      type: 'outgoing',
      status: 'sent'
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');

    // Update conversation
    setConversations(prev => prev.map(conv =>
      conv.leadId === selectedConversation
        ? { ...conv, messages: [...conv.messages, newMsg], lastActivity: new Date() }
        : conv
    ));

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === newMsg.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === newMsg.id ? { ...msg, status: 'read' } : msg
      ));
    }, 3000);
  };

  const getMessageStatus = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return formatTime(date);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      }).format(date);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const lead = leads.find(l => l.id === conv.leadId);
    if (!lead) return false;

    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone?.includes(searchTerm) ||
                         conv.messages.some(msg => msg.message.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCloser = selectedCloser === 'all' || conv.closerId === selectedCloser;

    return matchesSearch && matchesCloser;
  });

  const selectedConversationData = conversations.find(c => c.leadId === selectedConversation);
  const selectedLead = leads.find(l => l.id === selectedConversation);
  const conversationMessages = selectedConversationData?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span>WhatsApp Shadow</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitore e gerencie conversas do WhatsApp dos closers
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {connections.filter(c => c.isConnected).length > 0 ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {connections.filter(c => c.isConnected).length} conectado(s)
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      Desconectado
                    </span>
                  </>
                )}
              </div>

              {/* Closer Filter */}
              {activeTab === 'conversations' && (
                <select
                  value={selectedCloser}
                  onChange={(e) => setSelectedCloser(e.target.value)}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Todos os Closers</option>
                  {closers.map(closer => (
                    <option key={closer.id} value={closer.id}>{closer.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'conversations'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Conversas
            </button>
            <button
              onClick={() => setActiveTab('integration')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'integration'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Integração WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Closer Connections - Only show on conversations tab */}
      {activeTab === 'conversations' && (
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {closers.map(closer => {
              const connection = connections.find(c => c.closerId === closer.id);
              return (
                <div key={closer.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {closer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{closer.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {connection?.phoneNumber || 'Não conectado'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {connection?.isConnected ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-xs text-green-600 dark:text-green-400">Online</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleQRLogin(closer.id)}
                          disabled={isLoading}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xs rounded-lg transition-colors"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>Conectar</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {connection?.lastSync && (
                    <p className="text-xs text-gray-500 mt-2">
                      Última sincronização: {formatTime(connection.lastSync)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'integration' ? (
          <div className="flex-1 p-6">
            <WhatsAppIntegration />
          </div>
        ) : (
          <>
            {/* Conversations List */}
            <div className="w-1/3 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map(conversation => {
                  const lead = leads.find(l => l.id === conversation.leadId);
                  const closer = closers.find(c => c.id === conversation.closerId);
                  const lastMessage = conversation.messages[conversation.messages.length - 1];
                  
                  if (!lead) return null;

                  return (
                    <div
                      key={conversation.leadId}
                      onClick={async () => {
                        setSelectedConversation(conversation.leadId);
                        
                        // Se é uma conversa real do WhatsApp, carregar mensagens
                        if (conversation.chatId) {
                          try {
                            console.log('🔄 Carregando mensagens reais da conversa:', conversation.chatId);
                            const realMessages = await whatsappConversationsService.loadMessages(
                              conversation.chatId,
                              currentInstance?.id || ''
                            );
                            
                            // Atualizar conversa com mensagens reais
                            const updatedConversation = {
                              ...conversation,
                              messages: realMessages
                            };
                            
                            setSelectedConversationData(updatedConversation);
                            console.log('✅ Mensagens reais carregadas:', realMessages.length);
                          } catch (error) {
                            console.error('❌ Erro ao carregar mensagens reais:', error);
                            setSelectedConversationData(conversation);
                          }
                        } else {
                          // Conversa mock, usar dados existentes
                          setSelectedConversationData(conversation);
                        }
                      }}
                      className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedConversation === conversation.leadId ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {lead.name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatDate(conversation.lastActivity)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {lead.phone}
                          </p>
                          
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                              {lastMessage?.type === 'outgoing' && (
                                <span className="mr-1">
                                  {getMessageStatus(lastMessage.status)}
                                </span>
                              )}
                              {lastMessage?.message}
                            </p>
                            
                            <div className="flex items-center space-x-1 ml-2">
                              {conversation.status === 'no-response' && (
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                              )}
                              <span className="text-xs text-gray-500">
                                {closer?.name.split(' ')[0]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation && selectedLead ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {selectedLead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {selectedLead.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedLead.phone} • {selectedLead.course}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                          <Video className="w-5 h-5 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
                    {conversationMessages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.type === 'outgoing'
                              ? 'bg-green-500 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <div className={`flex items-center justify-end space-x-1 mt-1 ${
                            message.type === 'outgoing' ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">{formatTime(message.timestamp)}</span>
                            {message.type === 'outgoing' && getMessageStatus(message.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center space-x-3">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <Paperclip className="w-5 h-5 text-gray-500" />
                      </button>
                      
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Digite uma mensagem..."
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                          <Smile className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <Mic className="w-5 h-5 text-gray-500" />
                      </button>
                      
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Selecione uma conversa
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Escolha uma conversa para começar a visualizar as mensagens
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-md mx-4 p-6">
            <div className="text-center">
              <QrCode className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Conectar WhatsApp
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Escaneie o código QR com o WhatsApp do closer
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                <img
                  src={connections.find(c => c.closerId === selectedCloserForQR)?.qrCode || ''}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>1. Abra o WhatsApp no celular</p>
                  <p>2. Toque em Menu (⋮) &gt; Dispositivos conectados</p>
                  <p>3. Toque em "Conectar um dispositivo"</p>
                  <p>4. Aponte a câmera para este código</p>
                </div>
                
                <div className="flex items-center justify-center space-x-3 pt-4">
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleQRSuccess}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Simular Conexão
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppShadow;