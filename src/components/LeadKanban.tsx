import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Settings, DollarSign, X, Search, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Lead, KanbanColumn, FieldConfig } from '../utils/types';
import LeadCard from './LeadCard';
import FieldConfigManager from './FieldConfigManager';
import LeadSearch from './LeadSearch';
import { useAuth } from '../contexts/AuthContext';

interface LeadKanbanProps {
  leads: Lead[];
  columns: KanbanColumn[];
  onLeadMove: (leadId: string, newColumnId: string) => void;
  onAddColumn: (name: string, color: string) => void;
  onAddLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'lastUpdated'>) => void;
  onUpdateNotes?: (leadId: string, notes: string) => void;
  onWhatsAppClick?: (phone: string, leadName: string) => void;
  onFollowUpClick?: (leadId: string, leadName: string) => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
  onAssignLead?: (leadId: string, userId: string) => void;
  onEditColumn?: (columnId: string, name: string, color: string) => void;
  onDeleteColumn?: (columnId: string, newColumnId?: string) => void;
  onReorderColumns?: (columns: KanbanColumn[]) => void;
  isAdmin?: boolean;
}

const LeadKanban: React.FC<LeadKanbanProps> = ({ 
  leads, 
  columns, 
  onLeadMove, 
  onAddColumn, 
  onAddLead, 
  onUpdateNotes, 
  onWhatsAppClick, 
  onFollowUpClick, 
  onEditLead, 
  onDeleteLead, 
  onAssignLead,
  onEditColumn, 
  onDeleteColumn, 
  onReorderColumns, 
  isAdmin = false 
}) => {
  const { user } = useAuth();
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [isFieldConfigOpen, setIsFieldConfigOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#3B82F6');
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMyLeadsOnly, setShowMyLeadsOnly] = useState(false);
  
  // Estados para edição e exclusão
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isDeletingLead, setIsDeletingLead] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [isDeletingColumn, setIsDeletingColumn] = useState(false);
  const [deletingColumnId, setDeletingColumnId] = useState<string | null>(null);
  const [columnMenuOpen, setColumnMenuOpen] = useState<string | null>(null);

  // Default field configuration based on Kommo CRM
  const defaultFieldConfig: FieldConfig[] = [
    { id: 'name', name: 'name', label: 'Nome', type: 'text', required: true, visible: true, order: 0 },
    { id: 'course', name: 'course', label: 'Curso', type: 'text', required: true, visible: true, order: 1 },
    { id: 'company', name: 'company', label: 'Empresa', type: 'text', required: false, visible: true, order: 2 },
    { id: 'commercialPhone', name: 'commercialPhone', label: 'Tel. comercial', type: 'phone', required: false, visible: true, order: 3 },
    { id: 'commercialEmail', name: 'commercialEmail', label: 'E-mail comercial', type: 'email', required: false, visible: true, order: 4 },
    { id: 'privateEmail', name: 'privateEmail', label: 'Email privado', type: 'email', required: false, visible: true, order: 5 },
    { id: 'otherEmail', name: 'otherEmail', label: 'Outro email', type: 'email', required: false, visible: true, order: 6 },
    { id: 'homeNumber', name: 'homeNumber', label: 'Número Casa', type: 'phone', required: false, visible: true, order: 7 },
    { id: 'state', name: 'state', label: 'Estado', type: 'text', required: false, visible: true, order: 8 },
    { id: 'city', name: 'city', label: 'Cidade', type: 'text', required: false, visible: false, order: 9 },
    { id: 'address', name: 'address', label: 'Endereço', type: 'text', required: false, visible: false, order: 10 },
    { id: 'website', name: 'website', label: 'Site', type: 'text', required: false, visible: false, order: 11 },
    
    // Sales fields
    { id: 'saleValue', name: 'saleValue', label: 'Venda', type: 'number', required: false, visible: true, order: 12 },
    { id: 'product', name: 'product', label: 'Produto', type: 'select', required: false, visible: true, order: 13, options: ['Pós Graduação', 'MBA Executivo', 'Curso de Extensão', 'Graduação EAD'] },
    { id: 'saleAmount', name: 'saleAmount', label: 'Valor de venda', type: 'number', required: false, visible: true, order: 14 },
    { id: 'enrollmentValue', name: 'enrollmentValue', label: 'Valor de matrícula', type: 'number', required: false, visible: true, order: 15 },
    { id: 'installments', name: 'installments', label: 'Quantidade parcelas', type: 'number', required: false, visible: true, order: 16 },
    { id: 'mec', name: 'mec', label: 'MEC', type: 'textarea', required: false, visible: true, order: 17 },
    { id: 'paymentMethod', name: 'paymentMethod', label: 'Modalidade pagamento', type: 'select', required: false, visible: true, order: 18, options: ['Boleto', 'Cartão', 'PIX', 'Transferência'] },
    { id: 'paymentStartMonth', name: 'paymentStartMonth', label: 'Mês início pagamento', type: 'text', required: false, visible: true, order: 19 },
    { id: 'weekDay', name: 'weekDay', label: 'Dia da semana', type: 'number', required: false, visible: true, order: 20 },
    { id: 'autoScheduled', name: 'autoScheduled', label: 'AgendouAuto', type: 'boolean', required: false, visible: true, order: 21 },
    { id: 'meetingDate', name: 'meetingDate', label: 'diaReuniao', type: 'date', required: false, visible: true, order: 22 },
    { id: 'meetingTime', name: 'meetingTime', label: 'horaReuniao', type: 'text', required: false, visible: true, order: 23 },
    { id: 'contactorId', name: 'contactorId', label: 'Contador', type: 'text', required: false, visible: true, order: 24 },
    { id: 'meetingLink', name: 'meetingLink', label: 'linkReuniaov1', type: 'text', required: false, visible: true, order: 25 },
    { id: 'meetingDateTime', name: 'meetingDateTime', label: 'diaHora_Reuniao', type: 'datetime', required: false, visible: true, order: 26 },
    { id: 'shift', name: 'shift', label: 'Turma', type: 'select', required: false, visible: true, order: 27, options: ['Manhã', 'Tarde', 'Noite'] },
    { id: 'practitioner', name: 'practitioner', label: 'Possibilidade Practitioner', type: 'select', required: false, visible: false, order: 28, options: ['Sim', 'Não', 'Talvez'] }
  ];

  // Carregar configuração do localStorage
  const [fieldConfig, setFieldConfig] = useState<FieldConfig[]>(() => {
    try {
      const saved = localStorage.getItem('leadFieldConfig');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de campos:', error);
    }
    return defaultFieldConfig;
  });

  // Salvar configuração no localStorage quando mudar
  useEffect(() => {
    try {
      localStorage.setItem('leadFieldConfig', JSON.stringify(fieldConfig));
    } catch (error) {
      console.error('Erro ao salvar configuração de campos:', error);
    }
  }, [fieldConfig]);

  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    source: '',
    value: 0,
    columnId: '',
    assignedTo: '',
    tags: [] as string[],
    company: '',
    commercialPhone: '',
    commercialEmail: '',
    privateEmail: '',
    otherEmail: '',
    homeNumber: '',
    state: '',
    city: '',
    address: '',
    website: '',
    saleValue: 0,
    product: '',
    saleAmount: 0,
    enrollmentValue: 0,
    installments: 0,
    mec: '',
    paymentMethod: '',
    paymentStartMonth: '',
    weekDay: 0,
    autoScheduled: false,
    meetingDate: undefined as Date | undefined,
    meetingTime: '',
    contactorId: '',
    meetingLink: '',
    meetingDateTime: undefined as Date | undefined,
    shift: '',
    practitioner: '',
    customFields: {}
  });

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      onAddColumn(newColumnName.trim(), newColumnColor);
      setNewColumnName('');
      setNewColumnColor('#3B82F6');
      setIsAddingColumn(false);
    }
  };

  const handleAddLead = async () => {
    try {
      // Validação básica
      if (!newLead.name.trim()) {
        alert('Nome é obrigatório');
        return;
      }
      
      if (!newLead.columnId) {
        alert('Selecione uma coluna');
        return;
      }

      // Validação de campos obrigatórios baseada na configuração
      const requiredFields = fieldConfig.filter(field => field.required);
      for (const field of requiredFields) {
        const value = getFieldValue(field.name);
        if (!value || (typeof value === 'string' && !value.trim())) {
          alert(`${field.label} é obrigatório`);
          return;
        }
      }

      // Validação específica para campos obrigatórios do banco
      if (!newLead.course || !newLead.course.trim()) {
        alert('Curso é obrigatório');
        return;
      }

      // Chamar função de criação
      await onAddLead(newLead);
      
      // Resetar formulário
      setNewLead({
        name: '',
        email: '',
        phone: '',
        course: '',
        source: '',
        value: 0,
        columnId: '',
        assignedTo: '',
        tags: [],
        company: '',
        commercialPhone: '',
        commercialEmail: '',
        privateEmail: '',
        otherEmail: '',
        homeNumber: '',
        state: '',
        city: '',
        address: '',
        website: '',
        saleValue: 0,
        product: '',
        saleAmount: 0,
        enrollmentValue: 0,
        installments: 0,
        mec: '',
        paymentMethod: '',
        paymentStartMonth: '',
        weekDay: 0,
        autoScheduled: false,
        meetingDate: undefined,
        meetingTime: '',
        contactorId: '',
        meetingLink: '',
        meetingDateTime: undefined,
        shift: '',
        practitioner: '',
        customFields: {}
      });
      
      // Fechar modal
      setIsAddingLead(false);
      
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      alert('Erro ao criar lead. Tente novamente.');
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    console.log('🔄 Drag start:', leadId);
    setDraggedLead(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    console.log('🔄 Drop event:', { draggedLead, columnId });
    if (draggedLead) {
      console.log('📤 Chamando onLeadMove:', draggedLead, '->', columnId);
      onLeadMove(draggedLead, columnId);
      setDraggedLead(null);
    }
  };


  // Funções para mover colunas com botões
  const moveColumnLeft = (columnId: string) => {
    console.log('🔄 Movendo coluna para esquerda:', columnId);
    const columnIndex = columns.findIndex(col => col.id === columnId);
    console.log('📍 Índice da coluna:', columnIndex);
    
    if (columnIndex > 0) {
      const newColumns = [...columns];
      [newColumns[columnIndex - 1], newColumns[columnIndex]] = [newColumns[columnIndex], newColumns[columnIndex - 1]];
      console.log('📤 Nova ordem das colunas:', newColumns.map(c => c.name));
      onReorderColumns?.(newColumns);
    } else {
      console.log('⚠️ Coluna já é a primeira');
    }
  };

  const moveColumnRight = (columnId: string) => {
    console.log('🔄 Movendo coluna para direita:', columnId);
    const columnIndex = columns.findIndex(col => col.id === columnId);
    console.log('📍 Índice da coluna:', columnIndex);
    
    if (columnIndex < columns.length - 1) {
      const newColumns = [...columns];
      [newColumns[columnIndex], newColumns[columnIndex + 1]] = [newColumns[columnIndex + 1], newColumns[columnIndex]];
      console.log('📤 Nova ordem das colunas:', newColumns.map(c => c.name));
      onReorderColumns?.(newColumns);
    } else {
      console.log('⚠️ Coluna já é a última');
    }
  };

  // Funções para touch (mobile)
  const handleTouchStart = (e: React.TouchEvent, leadId: string) => {
    console.log('📱 Touch start:', leadId);
    setTouchStartTime(Date.now());
    setDraggedLead(leadId);
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedLead) {
      setIsDragging(true);
      // Prevenir scroll da página durante o drag
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, columnId: string) => {
    const touchDuration = Date.now() - touchStartTime;
    console.log('📱 Touch end:', { draggedLead, columnId, touchDuration, isDragging });
    
    // Se foi um toque longo (mais de 500ms) ou se estava arrastando
    if (draggedLead && (touchDuration > 500 || isDragging)) {
      console.log('📤 Chamando onLeadMove (mobile):', draggedLead, '->', columnId);
      onLeadMove(draggedLead, columnId);
    }
    
    setDraggedLead(null);
    setIsDragging(false);
  };

  // Função para clique longo (fallback)
  const handleLongPress = (leadId: string, columnId: string) => {
    console.log('📱 Long press:', leadId, '->', columnId);
    onLeadMove(leadId, columnId);
  };

  const getLeadsByColumn = (columnId: string) => {
    let columnLeads = leads.filter(lead => lead.columnId === columnId);
    
    // Aplicar filtro "Meus Leads" se ativado
    if (showMyLeadsOnly && user?.id) {
      columnLeads = columnLeads.filter(lead => lead.assignedTo === user.id);
    }
    
    // Aplicar filtro de pesquisa se houver termo
    if (searchTerm.trim()) {
      columnLeads = columnLeads.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return columnLeads;
  };

  // Função para limpar pesquisa
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Funções de manipulação de leads
  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsEditingLead(true);
  };

  const handleDeleteLead = (leadId: string) => {
    setDeletingLeadId(leadId);
    setIsDeletingLead(true);
  };

  const confirmDeleteLead = () => {
    if (deletingLeadId && onDeleteLead) {
      onDeleteLead(deletingLeadId);
    }
    setIsDeletingLead(false);
    setDeletingLeadId(null);
  };

  // Funções de manipulação de colunas
  const handleEditColumn = (column: KanbanColumn) => {
    console.log('🔍 Editando coluna:', column);
    console.log('🎨 Cor da coluna:', column.color);
    setEditingColumn(column);
    setNewColumnName(column.name);
    setNewColumnColor(column.color || '#3B82F6'); // Fallback para cor padrão
    setIsEditingColumn(true);
    setColumnMenuOpen(null);
  };

  const handleDeleteColumn = (columnId: string) => {
    setDeletingColumnId(columnId);
    setIsDeletingColumn(true);
    setColumnMenuOpen(null);
  };

  const confirmDeleteColumn = (newColumnId?: string) => {
    if (deletingColumnId && onDeleteColumn) {
      onDeleteColumn(deletingColumnId, newColumnId);
    }
    setIsDeletingColumn(false);
    setDeletingColumnId(null);
  };

  const toggleColumnMenu = (columnId: string) => {
    setColumnMenuOpen(columnMenuOpen === columnId ? null : columnId);
  };

  // Fechar menu ao clicar fora
  const handleClickOutside = (e: React.MouseEvent) => {
    if (columnMenuOpen && !(e.target as Element).closest('.column-menu')) {
      setColumnMenuOpen(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const visibleFields = fieldConfig.filter(field => field.visible).sort((a, b) => a.order - b.order);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900" onClick={handleClickOutside}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 space-y-4 lg:space-y-0">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pipeline de Leads {
                showMyLeadsOnly 
                  ? `(${leads.filter(lead => lead.assignedTo === user?.id).length} meus leads)`
                  : searchTerm 
                    ? `(${leads.filter(lead => lead.name.toLowerCase().includes(searchTerm.toLowerCase())).length} de ${leads.length} leads)`
                    : `(${leads.length} leads)`
              }
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <DollarSign className="w-4 h-4" />
              <span>
                Total: {formatCurrency(leads.reduce((sum, lead) => sum + (lead.saleValue || lead.value || 0), 0))}
              </span>
            </div>
          </div>
          
          {/* Campo de Pesquisa Inteligente */}
          <div className="max-w-md">
            <LeadSearch
              leads={leads}
              onSearch={setSearchTerm}
              onSelectLead={(lead) => {
                // Scroll para o lead selecionado
                const leadElement = document.getElementById(`lead-${lead.id}`);
                if (leadElement) {
                  leadElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Destacar o lead temporariamente
                  leadElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
                  setTimeout(() => {
                    leadElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
                  }, 3000);
                }
              }}
              placeholder="Pesquisar leads por nome..."
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          {/* Botão de filtro "Meus Leads" */}
          <button
            onClick={() => setShowMyLeadsOnly(!showMyLeadsOnly)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
              showMyLeadsOnly 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
            title={showMyLeadsOnly ? 'Mostrar todos os leads' : 'Mostrar apenas meus leads'}
          >
            <User className="w-4 h-4" />
            <span className="hidden lg:inline">
              {showMyLeadsOnly ? 'Todos os Leads' : 'Meus Leads'}
            </span>
          </button>
          
          
          {isAdmin && (
            <button
              onClick={() => setIsFieldConfigOpen(true)}
              className="hidden sm:flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline">Configurar Campos</span>
            </button>
          )}
          <button
            onClick={() => setIsAddingLead(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Lead</span>
            <span className="sm:hidden">Novo</span>
          </button>
          <button
            onClick={() => setIsAddingColumn(true)}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Coluna</span>
            <span className="sm:hidden">Coluna</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-50 dark:bg-gray-900">
        <div className="flex space-x-4 lg:space-x-6 min-w-max pb-6 px-4 lg:px-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {columns.map((column) => (
            <div
              key={column.id}
              className="w-72 sm:w-80 bg-gray-100 dark:bg-gray-800 rounded-xl p-3 lg:p-4 flex flex-col min-h-0 transition-all duration-200"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {column.name}
                  </h4>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                    {getLeadsByColumn(column.id).length}
                  </span>
                </div>
                
                {/* Botões de mover coluna */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => moveColumnLeft(column.id)}
                    disabled={columns.findIndex(col => col.id === column.id) === 0}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mover para esquerda"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => moveColumnRight(column.id)}
                    disabled={columns.findIndex(col => col.id === column.id) === columns.length - 1}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mover para direita"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="relative column-menu">
                  <button 
                    onClick={() => toggleColumnMenu(column.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  {/* Menu dropdown */}
                  {columnMenuOpen === column.id && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-32">
                      <button
                        onClick={() => handleEditColumn(column)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                      >
                        Editar Coluna
                      </button>
                      <button
                        onClick={() => handleDeleteColumn(column.id)}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                      >
                        Deletar Coluna
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Cards */}
              <div 
                className="space-y-3 flex-1 overflow-y-auto min-h-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {getLeadsByColumn(column.id).length === 0 && searchTerm ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum lead encontrado</p>
                    <p className="text-xs">Tente outro termo de pesquisa</p>
                  </div>
                ) : getLeadsByColumn(column.id).map((lead) => (
                  <div
                    key={lead.id}
                    id={`lead-${lead.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onTouchStart={(e) => handleTouchStart(e, lead.id)}
                    onTouchMove={handleTouchMove}
                    className="cursor-move select-none"
                    style={{ touchAction: 'none' }}
                  >
                    <div className="relative">
                    <LeadCard
                      lead={lead}
                      isAdmin={isAdmin}
                      fieldConfig={fieldConfig}
                      onFieldConfigChange={setFieldConfig}
                      onUpdateNotes={onUpdateNotes}
                      onWhatsAppClick={onWhatsAppClick}
                      onFollowUpClick={onFollowUpClick}
                      onEdit={handleEditLead}
                      onDelete={handleDeleteLead}
                      onAssign={onAssignLead}
                      onMove={onLeadMove}
                    />
                      
                      {/* Botão de mover para mobile */}
                      <div className="absolute top-2 right-2 md:hidden">
                        <select
                          value={lead.columnId}
                          onChange={(e) => onLeadMove(lead.id, e.target.value)}
                          className="text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-700 dark:text-gray-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {columns.map(col => (
                            <option key={col.id} value={col.id}>
                              {col.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Lead Button */}
              <button
                onClick={() => {
                  setSelectedColumn(column.id);
                  setNewLead({ ...newLead, columnId: column.id });
                  setIsAddingLead(true);
                }}
                className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center space-x-2 bg-gray-50 dark:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Adicionar Lead</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Field Configuration Modal */}
      <FieldConfigManager
        fields={fieldConfig}
        onFieldsChange={setFieldConfig}
        isOpen={isFieldConfigOpen}
        onClose={() => setIsFieldConfigOpen(false)}
      />

      {/* Add Column Modal */}
      {isAddingColumn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nova Coluna
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da Coluna
                </label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Ex: Qualificação, Proposta, Fechamento..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cor
                </label>
                <div className="flex space-x-2">
                  {colorOptions.map((color, index) => (
                    <button
                      key={`color-${index}-${color}`}
                      onClick={() => setNewColumnColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newColumnColor === color ? 'border-gray-400' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsAddingColumn(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddColumn}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Criar Coluna
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Novo Lead
              </h3>
              <button
                onClick={() => setIsAddingLead(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleFields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      value={getFieldValue(field.name)}
                      onChange={(e) => setFieldValue(field.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione...</option>
                      {field.options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'boolean' ? (
                    <select
                      value={getFieldValue(field.name) ? 'true' : 'false'}
                      onChange={(e) => setFieldValue(field.name, e.target.value === 'true')}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="false">NÃO</option>
                      <option value="true">SIM</option>
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={getFieldValue(field.name) || ''}
                      onChange={(e) => setFieldValue(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type={field.type === 'datetime' ? 'datetime-local' : field.type}
                      value={getFieldValue(field.name) || ''}
                      onChange={(e) => setFieldValue(field.name, 
                        field.type === 'number' ? Number(e.target.value) : 
                        field.type === 'date' ? new Date(e.target.value) :
                        field.type === 'datetime' ? new Date(e.target.value) :
                        e.target.value
                      )}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
              
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Coluna *
                </label>
                <select
                  value={newLead.columnId}
                  onChange={(e) => setNewLead({ ...newLead, columnId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma coluna</option>
                  {columns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsAddingLead(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddLead}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Criar Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Lead */}
      {isEditingLead && editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Editar Lead
              </h3>
              <button
                onClick={() => setIsEditingLead(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (editingLead && onEditLead) {
                  // Usar diretamente o estado editingLead que já está atualizado
                  console.log('📤 Salvando lead editado:', editingLead);
                  
                  // Chamar função de edição com o lead completo atualizado
                  await onEditLead(editingLead);
                  setIsEditingLead(false);
                }
              } catch (error) {
                console.error('Erro ao salvar lead:', error);
                alert('Erro ao salvar alterações do lead');
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                      name={field.name}
                      value={editingLead[field.name as keyof Lead] as string || ''}
                      onChange={(e) => {
                        setEditingLead(prev => ({
                          ...prev,
                          [field.name]: e.target.value
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditingLead(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Lead */}
      {isDeletingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Deletar Lead
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Tem certeza que deseja deletar este lead? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setIsDeletingLead(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteLead}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Coluna */}
      {isEditingColumn && editingColumn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Editar Coluna
              </h3>
              <button
                onClick={() => setIsEditingColumn(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (onEditColumn && newColumnName.trim() && newColumnColor) {
                onEditColumn(editingColumn.id, newColumnName.trim(), newColumnColor);
                setIsEditingColumn(false);
              } else {
                alert('Nome e cor da coluna são obrigatórios');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome da Coluna
                  </label>
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cor
                  </label>
                  <div className="flex space-x-2">
                    {colorOptions.map((color, index) => (
                      <button
                        key={`edit-color-${index}-${color}`}
                        type="button"
                        onClick={() => setNewColumnColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newColumnColor === color ? 'border-gray-400' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditingColumn(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Coluna */}
      {isDeletingColumn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Deletar Coluna
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Tem certeza que deseja deletar esta coluna? Os leads serão movidos para outra coluna.
              </p>
              
              {deletingColumnId && getLeadsByColumn(deletingColumnId).length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mover leads para:
                  </label>
                  <select
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Selecione uma coluna</option>
                    {columns.filter(col => col.id !== deletingColumnId).map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setIsDeletingColumn(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => confirmDeleteColumn(selectedColumn || undefined)}
                  disabled={deletingColumnId && getLeadsByColumn(deletingColumnId).length > 0 && !selectedColumn}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function getFieldValue(fieldName: string) {
    return (newLead as any)[fieldName];
  }

  function setFieldValue(fieldName: string, value: any) {
    setNewLead(prev => ({ ...prev, [fieldName]: value }));
  }
};

export default LeadKanban;