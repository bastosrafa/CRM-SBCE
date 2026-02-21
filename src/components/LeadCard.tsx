import React, { useState, useEffect } from 'react';
import { useFollowUpSupabase } from '../hooks/useFollowUpSupabase';
import LeadAssignment from './LeadAssignment';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Tag, 
  DollarSign, 
  Building, 
  MapPin, 
  Globe, 
  Clock,
  Edit3,
  MoreVertical,
  Eye,
  EyeOff,
  Plus,
  X,
  MessageSquare,
  Bell,
  Target,
  FileText,
  Save,
  Trash2
} from 'lucide-react';
import { Lead, FieldConfig } from '../utils/types';

interface LeadCardProps {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
  onMove?: (leadId: string, newColumnId: string) => void;
  onWhatsAppClick?: (phone: string, leadName: string) => void;
  onFollowUpClick?: (leadId: string, leadName: string) => void;
  onUpdateNotes?: (leadId: string, notes: string) => void;
  onDelete?: (leadId: string) => void;
  onAssign?: (leadId: string, userId: string) => void;
  isAdmin?: boolean;
  fieldConfig?: FieldConfig[];
  onFieldConfigChange?: (config: FieldConfig[]) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ 
  lead, 
  onEdit, 
  onMove, 
  onWhatsAppClick, 
  onFollowUpClick, 
  onUpdateNotes, 
  onDelete,
  onAssign,
  isAdmin = false,
  fieldConfig = [],
  onFieldConfigChange
}) => {
  const { createTask, createMessage, tasks: allTasks, messages: allMessages } = useFollowUpSupabase();
  
  
  // Filtrar tarefas e mensagens para este lead específico
  const leadTasks = allTasks.filter(task => task.lead_id === lead.id);
  const leadMessages = allMessages.filter(message => message.lead_id === lead.id);
  // Funcionalidade de follow-up temporária (sem Supabase por enquanto)
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingFields, setIsEditingFields] = useState(false);
  const [localFieldConfig, setLocalFieldConfig] = useState<FieldConfig[]>(fieldConfig);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpType, setFollowUpType] = useState<'task' | 'message'>('task');
  const [activeTab, setActiveTab] = useState<'info' | 'notes'>('info');
  const [notes, setNotes] = useState(lead.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [followUpData, setFollowUpData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    message: ''
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getFieldIcon = (fieldName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      name: <User className="w-3 h-3" />,
      email: <Mail className="w-3 h-3" />,
      phone: <Phone className="w-3 h-3" />,
      company: <Building className="w-3 h-3" />,
      address: <MapPin className="w-3 h-3" />,
      website: <Globe className="w-3 h-3" />,
      meetingDate: <Calendar className="w-3 h-3" />,
      meetingTime: <Clock className="w-3 h-3" />,
      value: <DollarSign className="w-3 h-3" />,
      saleValue: <DollarSign className="w-3 h-3" />,
    };
    return iconMap[fieldName] || <Tag className="w-3 h-3" />;
  };

  const renderFieldValue = (field: FieldConfig, value: any) => {
    if (!value && value !== 0 && value !== false) return '...';

    switch (field.type) {
      case 'date':
        return new Date(value).toLocaleDateString('pt-BR');
      case 'datetime':
        return formatDate(new Date(value));
      case 'number':
        return field.name.includes('value') || field.name.includes('Value') 
          ? formatCurrency(value) 
          : value.toString();
      case 'boolean':
        return value ? 'SIM' : 'NÃO';
      case 'select':
        return value;
      default:
        return value.toString();
    }
  };

  const getFieldValue = (fieldName: string) => {
    // Map field names to lead properties
    const fieldMap: Record<string, any> = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      commercialPhone: lead.commercialPhone,
      commercialEmail: lead.commercialEmail,
      privateEmail: lead.privateEmail,
      otherEmail: lead.otherEmail,
      homeNumber: lead.homeNumber,
      state: lead.state,
      city: lead.city,
      address: lead.address,
      website: lead.website,
      course: lead.course,
      source: lead.source,
      value: lead.value,
      saleValue: lead.saleValue,
      product: lead.product,
      saleAmount: lead.saleAmount,
      enrollmentValue: lead.enrollmentValue,
      installments: lead.installments,
      mec: lead.mec,
      paymentMethod: lead.paymentMethod,
      paymentStartMonth: lead.paymentStartMonth,
      weekDay: lead.weekDay,
      autoScheduled: lead.autoScheduled,
      meetingDate: lead.meetingDate,
      meetingTime: lead.meetingTime,
      contactorId: lead.contactorId,
      meetingLink: lead.meetingLink,
      meetingDateTime: lead.meetingDateTime,
      shift: lead.shift,
      practitioner: lead.practitioner,
      assignedTo: lead.assignedTo,
      ...lead.customFields
    };

    return fieldMap[fieldName];
  };

  const visibleFields = localFieldConfig
    .filter(field => field.visible)
    .sort((a, b) => a.order - b.order);

  const basicFields = visibleFields.slice(0, 6);
  const expandedFields = visibleFields.slice(6);

  const toggleFieldVisibility = (fieldId: string) => {
    const updatedConfig = localFieldConfig.map(field =>
      field.id === fieldId ? { ...field, visible: !field.visible } : field
    );
    setLocalFieldConfig(updatedConfig);
    onFieldConfigChange?.(updatedConfig);
  };

  const addCustomField = () => {
    const newField: FieldConfig = {
      id: `custom_${Date.now()}`,
      name: `customField${localFieldConfig.length + 1}`,
      label: 'Novo Campo',
      type: 'text',
      required: false,
      visible: true,
      order: localFieldConfig.length
    };
    
    const updatedConfig = [...localFieldConfig, newField];
    setLocalFieldConfig(updatedConfig);
    onFieldConfigChange?.(updatedConfig);
  };

  const removeField = (fieldId: string) => {
    const updatedConfig = localFieldConfig.filter(field => field.id !== fieldId);
    setLocalFieldConfig(updatedConfig);
    onFieldConfigChange?.(updatedConfig);
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = lead.phone || lead.commercialPhone;
    if (phoneNumber && onWhatsAppClick) {
      onWhatsAppClick(phoneNumber, lead.name);
    } else {
      alert('Adicione um telefone para usar o WhatsApp');
    }
  };

  const handleFollowUpClick = () => {
    setShowFollowUpModal(true);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    setFollowUpData({
      title: `Follow-up com ${lead.name}`,
      description: '',
      dueDate: tomorrow.toISOString().split('T')[0], // Apenas a data para input type="date"
      priority: 'medium',
      message: ''
    });
  };

  const handleSaveNotes = () => {
    if (onUpdateNotes) {
      onUpdateNotes(lead.id, notes);
    }
    setIsEditingNotes(false);
  };

  const handleAssign = (userId: string) => {
    if (onAssign) {
      onAssign(lead.id, userId);
    }
  };

  const handleCancelNotes = () => {
    setNotes(lead.notes || '');
    setIsEditingNotes(false);
  };

  const handleDeleteNotes = () => {
    setNotes('');
    if (onUpdateNotes) {
      onUpdateNotes(lead.id, '');
    }
    setIsEditingNotes(false);
  };

  const handleSaveFollowUp = async () => {
    try {
      if (followUpType === 'task') {
        console.log('📤 Salvando tarefa:', followUpData);
        createTask(lead.id, {
          title: followUpData.title,
          description: followUpData.description,
          dueDate: followUpData.dueDate,
          priority: followUpData.priority
        });
        alert('✅ Tarefa criada com sucesso!');
      } else {
        console.log('📤 Salvando mensagem:', followUpData);
        createMessage(lead.id, {
          message: followUpData.message,
          scheduledDate: followUpData.dueDate
        });
        alert('✅ Mensagem agendada com sucesso!');
      }
      setShowFollowUpModal(false);
      setFollowUpData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        message: ''
      });
    } catch (error) {
      console.error('Erro ao salvar follow-up:', error);
      alert('❌ Erro ao salvar follow-up');
    }
  };


  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all duration-200 group w-full max-w-sm mx-auto">
      {/* Card Header */}
      <div className="p-3 lg:p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm flex-shrink-0">
              {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base truncate">
                {lead.name}
              </h5>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {lead.course}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-1 ml-2">
            <p className="text-xs lg:text-sm font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(lead.saleValue || lead.value)}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(lead.lastUpdated)}
            </p>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
              {/* Assignment Button */}
              {onAssign && (
                <button
                  onClick={() => setShowAssignmentModal(true)}
                  className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-colors"
                  title="Atribuir Lead"
                >
                  <User className="w-3 h-3 lg:w-4 lg:h-4 text-purple-600" />
                </button>
              )}

              {/* WhatsApp Button - Sempre clicável */}
              <button
                onClick={handleWhatsAppClick}
                className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded cursor-pointer transition-colors"
                title={
                  (lead.phone || lead.commercialPhone)
                    ? 'Abrir WhatsApp'
                    : 'Adicione um telefone para usar o WhatsApp'
                }
              >
                <MessageSquare className={`w-3 h-3 lg:w-4 lg:h-4 ${
                  (lead.phone || lead.commercialPhone)
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`} />
              </button>
              
              {/* Follow-up Button */}
              <button
                onClick={handleFollowUpClick}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                title="Criar Follow-up"
              >
                <Bell className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
              </button>
              
              {/* Edit Button */}
              {onEdit && (
                <button
                  onClick={() => onEdit(lead)}
                  className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded"
                  title="Editar Lead"
                >
                  <Edit3 className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-600" />
                </button>
              )}
              
              {/* Delete Button */}
              {onDelete && (
                <button
                  onClick={() => onDelete(lead.id)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  title="Deletar Lead"
                >
                  <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
                </button>
              )}
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title={isExpanded ? 'Recolher' : 'Expandir'}
              >
                <MoreVertical className="w-3 h-3 lg:w-4 lg:h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Tags */}
        {lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 lg:mt-3">
            {lead.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {lead.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs rounded-full">
                +{lead.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-1 lg:space-x-2">
              <User className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">Informações</span>
              <span className="sm:hidden">Info</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-1 lg:space-x-2">
              <FileText className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">Notas</span>
              <span className="sm:hidden">Notas</span>
              {notes && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-1 lg:px-1.5 py-0.5 rounded-full">
                  {notes.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-3 lg:p-4">
        {activeTab === 'info' && (
          <div className="space-y-2">
            {/* Basic Fields */}
            {basicFields.map((field) => {
              const value = getFieldValue(field.name);
              if (!value && value !== 0 && value !== false) return null;
              
              return (
                <div key={field.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 min-w-0 flex-1">
                    {getFieldIcon(field.name)}
                    <span className="truncate font-medium">{field.label}</span>
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium ml-2 text-right">
                    {renderFieldValue(field, value)}
                  </span>
                </div>
              );
            })}

            {/* Expanded Fields */}
            {isExpanded && expandedFields.length > 0 && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 mt-3">
                <div className="space-y-2">
                  {expandedFields.map((field) => {
                    const value = getFieldValue(field.name);
                    
                    return (
                      <div key={field.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 min-w-0 flex-1">
                          {getFieldIcon(field.name)}
                          <span className="truncate font-medium">{field.label}</span>
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium ml-2 text-right">
                          {renderFieldValue(field, value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Notas do Lead
              </h4>
              <div className="flex items-center space-x-2">
                {!isEditingNotes ? (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handleSaveNotes}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                    >
                      <Save className="w-3 h-3" />
                      <span>Salvar</span>
                    </button>
                    <button
                      onClick={handleCancelNotes}
                      className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    {notes && (
                      <button
                        onClick={handleDeleteNotes}
                        className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Limpar</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isEditingNotes ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Digite suas notas sobre este lead...&#10;&#10;Exemplo:&#10;- Perfil: Empresário, interessado em marketing digital&#10;- Perguntas: Quer saber sobre ROI, prazo de implementação&#10;- Observações: Muito receptivo, prefere contato por WhatsApp&#10;- Próximos passos: Enviar proposta detalhada até sexta-feira"
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none"
                autoFocus
              />
            ) : (
              <div className="min-h-32 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                {notes ? (
                  <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {notes}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Nenhuma nota adicionada ainda. Clique em "Editar" para adicionar informações sobre este lead.
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400">
              💡 <strong>Dica:</strong> Use as notas para registrar perfil do cliente, perguntas feitas, 
              interesses específicos, próximos passos e qualquer informação relevante para o acompanhamento.
            </div>
          </div>
        )}


      </div>

      {/* Admin Field Configuration */}
      {isAdmin && isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h6 className="text-sm font-semibold text-gray-900 dark:text-white">
                Configurar Campos
              </h6>
              <div className="flex items-center space-x-2">
                <button
                  onClick={addCustomField}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                >
                  <Plus className="w-3 h-3" />
                  <span>Campo</span>
                </button>
                <button
                  onClick={() => setIsEditingFields(!isEditingFields)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <Edit3 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {localFieldConfig.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFieldVisibility(field.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      {field.visible ? (
                        <Eye className="w-3 h-3 text-green-600" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {field.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                      {field.type}
                    </span>
                    {field.name.startsWith('custom') && (
                      <button
                        onClick={() => removeField(field.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-3 lg:px-4 pb-3 lg:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1 sm:space-y-0">
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {lead.assignedToName || 'Não atribuído'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Tag className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {lead.source}
            </span>
          </div>
          
          {/* Contadores de Follow-up - apenas pendentes */}
          {(leadTasks.filter(task => task.status !== 'completed').length > 0 || 
            leadMessages.filter(message => message.status === 'scheduled').length > 0) && (
            <div className="flex items-center space-x-2">
              {leadTasks.filter(task => task.status !== 'completed').length > 0 && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600 dark:text-orange-400">
                    {leadTasks.filter(task => task.status !== 'completed').length}
                  </span>
                </div>
              )}
              {leadMessages.filter(message => message.status === 'scheduled').length > 0 && (
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {leadMessages.filter(message => message.status === 'scheduled').length}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Follow-up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-md p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Criar Follow-up para {lead.name}
            </h3>
            
            {/* Lista de tarefas/mensagens existentes - apenas pendentes */}
            {(leadTasks.filter(task => task.status !== 'completed').length > 0 || 
              leadMessages.filter(message => message.status === 'scheduled').length > 0) && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Tarefas e Mensagens Pendentes
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {leadTasks.filter(task => task.status !== 'completed').map((task) => (
                    <div key={task.id} className="flex items-center justify-between text-xs bg-white dark:bg-gray-700 p-2 rounded border">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-blue-500" />
                        <span className="text-gray-900 dark:text-white">{task.title}</span>
                        <span className={`px-1 py-0.5 rounded text-xs ${
                          task.priority === 'high' ? 'bg-red-100 text-red-600' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                        <span className="text-gray-500 dark:text-gray-400">
                        {new Date(task.due_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                  {leadMessages.filter(message => message.status === 'scheduled').map((message) => (
                    <div key={message.id} className="flex items-center justify-between text-xs bg-white dark:bg-gray-700 p-2 rounded border">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-3 h-3 text-green-500" />
                        <span className="text-gray-900 dark:text-white truncate">{message.message}</span>
                        <span className={`px-1 py-0.5 rounded text-xs ${
                          message.status === 'sent' ? 'bg-green-100 text-green-600' :
                          message.status === 'failed' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {message.status === 'sent' ? 'Enviada' : message.status === 'failed' ? 'Falhou' : 'Agendada'}
                        </span>
                      </div>
                        <span className="text-gray-500 dark:text-gray-400">
                        {new Date(message.scheduled_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFollowUpType('task')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    followUpType === 'task'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Criar Tarefa
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Lembrete para ação
                  </p>
                </button>
                
                <button
                  onClick={() => setFollowUpType('message')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    followUpType === 'message'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Agendar Mensagem
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Mensagem automática
                  </p>
                </button>
              </div>
              
              {/* Campos de entrada baseados no tipo */}
              {followUpType === 'task' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título da Tarefa
                    </label>
                    <input
                      type="text"
                      value={followUpData.title}
                      onChange={(e) => setFollowUpData({...followUpData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Ex: Ligar para cliente"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={followUpData.description}
                      onChange={(e) => setFollowUpData({...followUpData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      rows={3}
                      placeholder="Descreva a tarefa..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data de Vencimento
                    </label>
                    <input
                      type="date"
                      value={followUpData.dueDate ? followUpData.dueDate.split('T')[0] : ''}
                      onChange={(e) => setFollowUpData({...followUpData, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Prioridade
                      </label>
                      <select 
                        value={followUpData.priority}
                        onChange={(e) => setFollowUpData({...followUpData, priority: e.target.value as 'low' | 'medium' | 'high'})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mensagem
                    </label>
                    <textarea
                      value={followUpData.message}
                      onChange={(e) => setFollowUpData({...followUpData, message: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      rows={4}
                      placeholder="Digite sua mensagem..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data de Agendamento
                    </label>
                    <input
                      type="datetime-local"
                      value={followUpData.dueDate ? followUpData.dueDate.includes('T') ? followUpData.dueDate : followUpData.dueDate + 'T09:00' : ''}
                      onChange={(e) => setFollowUpData({...followUpData, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFollowUp}
                className={`px-4 py-2 text-white rounded-lg ${
                  followUpType === 'task'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {followUpType === 'task' ? 'Criar Tarefa' : 'Agendar Mensagem'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Atribuição */}
      {showAssignmentModal && (
        <LeadAssignment
          leadId={lead.id}
          currentAssignee={lead.assignedTo}
          onAssign={handleAssign}
          onClose={() => setShowAssignmentModal(false)}
        />
      )}
    </div>
  );
};

export default LeadCard;