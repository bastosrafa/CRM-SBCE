import React, { useState, useEffect } from 'react';
import { useFollowUpSupabase } from '../hooks/useFollowUpSupabase';
import { 
  Clock, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  AlertTriangle, 
  Plus,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  User,
  Tag,
  Edit3,
  Trash2,
  Send,
  Bell,
  CalendarDays,
  Target,
  FileText,
  Video
} from 'lucide-react';
import { Lead, FollowUpTask } from '../utils/types';
import { useInstanceFollowUpTasks } from '../hooks/useInstanceData';

interface FollowUpProps {
  leads: Lead[];
}

interface ScheduledMessage {
  id: string;
  leadId: string;
  message: string;
  scheduledDate: string;
  sent: boolean;
  createdAt: string;
}

const FollowUp: React.FC<FollowUpProps> = ({ leads }) => {
  // Usar sistema local de tarefas
  const { 
    tasks, 
    messages, 
    loading,
    error,
    createTask, 
    createMessage, 
    updateTask,
    updateMessage,
    deleteTask, 
    deleteMessage,
    completeTask,
    markMessageAsSent
  } = useFollowUpSupabase();
  
  // Remover estado local de mensagens, usar apenas do hook
  const [activeTab, setActiveTab] = useState<'tasks' | 'messages'>('tasks');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingMessage, setIsAddingMessage] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<string>('');

  const [newTask, setNewTask] = useState({
    leadId: '',
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    type: 'call' as 'call' | 'email' | 'whatsapp' | 'meeting' | 'proposal'
  });

  const [newMessage, setNewMessage] = useState({
    leadId: '',
    message: '',
    scheduledDate: '',
    scheduledTime: '',
    type: 'whatsapp' as 'whatsapp' | 'email' | 'sms'
  });

  // Mock data para mensagens agendadas (ainda não implementado)
  // Remover mock data - usar apenas dados do hook useLocalTasks

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.leadId || !newTask.dueDate) return;

    try {
      const taskData: Omit<FollowUpTask, 'id'> = {
        leadId: newTask.leadId,
        closerId: '1', // TODO: Get from auth context
        title: newTask.title,
        description: newTask.description,
        dueDate: new Date(newTask.dueDate),
        priority: newTask.priority,
        status: 'pending',
        type: newTask.type
      };

      await createTask(taskData);
      
      setNewTask({
        leadId: '',
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        type: 'call'
      });
      setIsAddingTask(false);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    }
  };

  const handleAddMessage = () => {
    if (!newMessage.message.trim() || !newMessage.leadId || !newMessage.scheduledDate || !newMessage.scheduledTime) return;

    const scheduledDateTime = new Date(`${newMessage.scheduledDate}T${newMessage.scheduledTime}`);
    
    const message: ScheduledMessage = {
      id: Math.random().toString(36).substr(2, 9),
      leadId: newMessage.leadId,
      closerId: '1', // Current user
      message: newMessage.message,
      scheduledDate: scheduledDateTime,
      type: newMessage.type,
      status: 'scheduled',
      createdAt: new Date()
    };

    // Mensagem será salva pelo hook useLocalTasks
    setNewMessage({
      leadId: '',
      message: '',
      scheduledDate: '',
      scheduledTime: '',
      type: 'whatsapp'
    });
    setIsAddingMessage(false);
  };

  const toggleTaskStatus = async (taskId: string) => {
    try {
      await completeTask(taskId);
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      deleteTask(taskId);
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  };

  const [editingTask, setEditingTask] = useState<FollowUpTask | null>(null);
  const [editingMessage, setEditingMessage] = useState<FollowUpMessage | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setEditTitle(task.title);
    }
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setEditingMessage(message);
      setEditText(message.message);
    }
  };

  const saveTaskEdit = () => {
    if (editingTask && editTitle.trim()) {
      updateTask(editingTask.id, { title: editTitle.trim() });
      setEditingTask(null);
      setEditTitle('');
    }
  };

  const saveMessageEdit = () => {
    if (editingMessage && editText.trim()) {
      updateMessage(editingMessage.id, { message: editText.trim() });
      setEditingMessage(null);
      setEditText('');
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditingMessage(null);
    setEditTitle('');
    setEditText('');
  };


  const cancelMessage = (messageId: string) => {
    // Usar função do hook para cancelar mensagem
    deleteMessage(messageId);
  };

  const markAsSent = async (messageId: string) => {
    try {
      await markMessageAsSent(messageId);
    } catch (error) {
      console.error('Erro ao marcar mensagem como enviada:', error);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'meeting': return <Video className="w-4 h-4" />;
      case 'proposal': return <FileText className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'overdue': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };


  const formatDateTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error('Erro ao formatar data:', date, error);
      return 'Data inválida';
    }
  };

  const formatRelativeTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      
      const now = new Date();
      const diffMs = dateObj.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Hoje';
      if (diffDays === 1) return 'Amanhã';
      if (diffDays === -1) return 'Ontem';
      if (diffDays > 0) return `Em ${diffDays} dias`;
      return `${Math.abs(diffDays)} dias atrás`;
    } catch (error) {
      console.error('Erro ao formatar data relativa:', date, error);
      return 'Data inválida';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const lead = leads.find(l => l.id === task.lead_id);
    if (!lead) return false;

    // Filtro por lead específico
    if (selectedLeadId && task.lead_id !== selectedLeadId) return false;

    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    // Filtro para mostrar/ocultar tasks encerradas
    const matchesCompleted = showCompleted || task.status !== 'completed';

    return matchesSearch && matchesStatus && matchesPriority && matchesCompleted;
  });

  const filteredMessages = messages.filter(message => {
    const lead = leads.find(l => l.id === message.lead_id);
    if (!lead) return false;

    const matchesSearch = message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;
    
    // Filtro para mostrar/ocultar mensagens enviadas
    const matchesCompleted = showCompleted || message.status !== 'sent';

    return matchesSearch && matchesStatus && matchesCompleted;
  });

  const upcomingTasks = tasks.filter(task => {
    const now = new Date();
    const taskDate = new Date(task.due_date);
    const diffHours = (taskDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return task.status !== 'completed' && diffHours <= 24 && diffHours > 0;
  });

  const overdueTasks = tasks.filter(task => {
    const now = new Date();
    return task.status !== 'completed' && new Date(task.due_date) < now;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Sistema de Follow-up</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie tarefas e mensagens agendadas para seus leads
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-3">
            {/* Seletor de Lead */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filtrar por Lead:
              </label>
              <select
                value={selectedLeadId || ''}
                onChange={(e) => setSelectedLeadId(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os leads</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAddingTask(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Tarefa</span>
              </button>
              <button
                onClick={() => setIsAddingMessage(true)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Agendar Mensagem</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Tarefas Pendentes
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {tasks.filter(t => t.status !== 'completed').length}
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-300">
                Vencidas
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {overdueTasks.length}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900 dark:text-green-300">
                Mensagens Agendadas
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {messages.filter(m => m.status === 'scheduled').length}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                Próximas 24h
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {upcomingTasks.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'tasks'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Tarefas</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'messages'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Mensagens Agendadas</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              {activeTab === 'tasks' ? (
                <>
                  <option value="pending">Pendente</option>
                  <option value="completed">Concluída</option>
                  <option value="overdue">Vencida</option>
                </>
              ) : (
                <>
                  <option value="scheduled">Agendada</option>
                  <option value="sent">Enviada</option>
                  <option value="failed">Falhou</option>
                  <option value="cancelled">Cancelada</option>
                </>
              )}
            </select>

            {activeTab === 'tasks' && (
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            )}

            {/* Toggle para mostrar/ocultar encerradas */}
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showCompleted 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{showCompleted ? 'Ocultar Encerradas' : 'Mostrar Encerradas'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {activeTab === 'tasks' ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhuma tarefa encontrada
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Crie uma nova tarefa para começar a organizar seu follow-up
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const lead = leads.find(l => l.id === task.lead_id);
                const isOverdue = task.status !== 'completed' && new Date(task.due_date) < new Date();
                
                return (
                  <div key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`mt-1 p-1 rounded-full transition-colors ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                          }`}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className={`font-semibold ${
                              task.status === 'completed' 
                                ? 'text-gray-500 line-through' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {task.title}
                            </h4>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority === 'urgent' ? 'Urgente' :
                                 task.priority === 'high' ? 'Alta' :
                                 task.priority === 'medium' ? 'Média' : 'Baixa'}
                              </span>
                              
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                isOverdue ? getStatusColor('overdue') : getStatusColor(task.status)
                              }`}>
                                {isOverdue ? 'Vencida' :
                                 task.status === 'completed' ? 'Concluída' : 'Pendente'}
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            {task.description}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              {getTaskIcon('call')}
                              <span className="capitalize">call</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{task.lead?.name || 'Lead não encontrado'}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDateTime(task.due_date)}</span>
                              <span className={`ml-1 ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                                ({formatRelativeTime(task.due_date)})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Botão de check/uncheck */}
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            task.status === 'completed'
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
                          }`}
                          title={task.status === 'completed' ? 'Marcar como pendente' : 'Marcar como concluída'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleEditTask(task.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                          <Edit3 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhuma mensagem agendada
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Agende mensagens para manter contato com seus leads
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => {
                const lead = leads.find(l => l.id === message.lead_id);
                
                return (
                  <div key={message.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`mt-1 p-2 rounded-lg ${
                          message.type === 'whatsapp' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                          message.type === 'email' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {message.type === 'whatsapp' ? <MessageSquare className="w-4 h-4" /> :
                           message.type === 'email' ? <Mail className="w-4 h-4" /> :
                           <Phone className="w-4 h-4" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {message.lead?.name || 'Lead não encontrado'}
                            </h4>
                            
                            <span className={`px-2 py-1 text-xs rounded-full ${message.status === 'sent' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                              {message.status === 'sent' ? 'Enviada' : 'Agendada'}
                            </span>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                            <p className="text-gray-900 dark:text-white text-sm">
                              {message.message}
                            </p>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Agendada para: {formatDateTime(message.scheduled_date)}</span>
                              <span className="text-blue-600">
                                ({formatRelativeTime(message.scheduled_date)})
                              </span>
                            </div>
                            
                            {message.sent_at && (
                              <div className="flex items-center space-x-1">
                                <Send className="w-4 h-4" />
                                <span>Enviada: {formatDateTime(message.sent_at)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Botão para marcar como enviada */}
                        {message.status === 'scheduled' && (
                          <button
                            onClick={() => markAsSent(message.id)}
                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
                            title="Marcar como enviada"
                          >
                            <Send className="w-4 h-4 text-green-500" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleEditMessage(message.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                          <Edit3 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-2xl mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nova Tarefa de Follow-up
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lead *
                  </label>
                  <select
                    value={newTask.leadId}
                    onChange={(e) => setNewTask({ ...newTask, leadId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um lead</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>{lead.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="call">Ligação</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="meeting">Reunião</option>
                    <option value="proposal">Proposta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Ex: Ligar para follow-up"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Detalhes sobre a tarefa..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data e Hora *
                  </label>
                  <input
                    type="datetime-local"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsAddingTask(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Criar Tarefa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Message Modal */}
      {isAddingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-2xl mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Agendar Mensagem
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lead *
                  </label>
                  <select
                    value={newMessage.leadId}
                    onChange={(e) => setNewMessage({ ...newMessage, leadId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Selecione um lead</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>{lead.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={newMessage.type}
                    onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mensagem *
                </label>
                <textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  placeholder="Digite sua mensagem aqui..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {newMessage.message.length}/500 caracteres
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={newMessage.scheduledDate}
                    onChange={(e) => setNewMessage({ ...newMessage, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={newMessage.scheduledTime}
                    onChange={(e) => setNewMessage({ ...newMessage, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsAddingMessage(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddMessage}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Agendar Mensagem
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Edição de Tarefa */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Editar Tarefa
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título da Tarefa
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Digite o título da tarefa"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveTaskEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Mensagem */}
      {editingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Editar Mensagem
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Texto da Mensagem
                  </label>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    rows={4}
                    placeholder="Digite a mensagem"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveMessageEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUp;