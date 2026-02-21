import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useInstance } from '../contexts/InstanceContext';
import { 
  Lead, 
  KanbanColumn, 
  FollowUpTask, 
  LeadWithInstance, 
  KanbanColumnWithInstance, 
  FollowUpTaskWithInstance 
} from '../utils/types';

// Hook para leads com isolamento por instância
export const useInstanceLeads = () => {
  const { currentInstance, permissions } = useInstance();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    console.log('🔍 fetchLeads chamado:');
    console.log('- currentInstance:', currentInstance?.name || 'null');
    console.log('- permissions:', permissions);
    console.log('- canViewAllData:', permissions?.canViewAllData);

    // Se não há permissões definidas ainda, aguardar
    if (!permissions) {
      console.log('⏳ Aguardando permissões...');
      return;
    }

    // Para super admin, não precisa de instância específica
    if (permissions.canViewAllData) {
      console.log('✅ Super admin - carregando todos os leads');
    } else if (!currentInstance) {
      console.log('⏳ Aguardando instância...');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('leads')
        .select(`
          *,
          assigned_user:profiles!leads_assigned_to_fkey(
            id,
            name,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // Se for super admin, pode ver todos os leads
      if (permissions.canViewAllData) {
        console.log('✅ Super admin - buscando todos os leads');
        // Super admin pode ver todos os leads (sem filtro de instância)
      } else if (currentInstance) {
        console.log('✅ Usuário comum - filtrando por instância:', currentInstance.id);
        query = query.eq('instance_id', currentInstance.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('❌ Erro ao buscar leads:', fetchError);
        throw fetchError;
      }

      if (!data || data.length === 0) {
        setLeads([]);
        setLoading(false);
        return;
      }

      // Mapear dados do Supabase para o formato Lead
      const mappedLeads = data.map(lead => {
        const mappedLead: Lead = {
          id: lead.id,
          name: lead.name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          course: lead.course || '',
          source: lead.source || 'website',
          value: lead.value || 0,
          columnId: lead.column_id, // Mapear column_id para columnId
          assignedTo: lead.assigned_to || '',
          assignedToName: lead.assigned_user?.full_name || lead.assigned_user?.name || '',
          tags: lead.tags || [],
          company: lead.company || '',
          commercialPhone: lead.commercial_phone || '',
          commercialEmail: lead.commercial_email || '',
          privateEmail: lead.private_email || '',
          otherEmail: lead.other_email || '',
          homeNumber: lead.home_number || '',
          state: lead.state || '',
          city: lead.city || '',
          address: lead.address || '',
          website: lead.website || '',
          saleValue: lead.sale_value || 0,
          product: lead.product || '',
          saleAmount: lead.sale_amount || 0,
          enrollmentValue: lead.enrollment_value || 0,
          installments: lead.installments || 0,
          mec: lead.mec || '',
          paymentMethod: lead.payment_method || '',
          paymentStartMonth: lead.payment_start_month || '',
          weekDay: lead.week_day || 0,
          autoScheduled: lead.auto_scheduled || false,
          meetingDate: lead.meeting_date ? new Date(lead.meeting_date) : undefined,
          meetingTime: lead.meeting_time || '',
          contactorId: lead.contactor_id || '',
          meetingLink: lead.meeting_link || '',
          meetingDateTime: lead.meeting_date_time ? new Date(lead.meeting_date_time) : undefined,
          shift: lead.shift || '',
          practitioner: lead.practitioner || '',
          notes: lead.notes || '',
          nextFollowUp: lead.next_follow_up ? new Date(lead.next_follow_up) : undefined,
          createdAt: new Date(lead.created_at),
          lastUpdated: new Date(lead.updated_at || lead.created_at),
          customFields: lead.custom_fields || {}
        };
        
        return mappedLead;
      });

      setLeads(mappedLeads);
    } catch (err) {
      console.error('❌ Erro ao carregar leads:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'lastUpdated'>) => {
    if (!currentInstance) throw new Error('Nenhuma instância selecionada');

    try {
      console.log('📤 Criando lead com dados:', leadData);

      // Mapear dados do frontend para o formato do Supabase
      const supabaseData: any = {
        name: leadData.name?.trim() || '',
        course: leadData.course?.trim() || '',
        source: leadData.source?.trim() || 'website',
        value: leadData.value || 0,
        column_id: leadData.columnId, // Mapear columnId para column_id
        instance_id: currentInstance.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (leadData.email?.trim()) supabaseData.email = leadData.email.trim();
      if (leadData.phone?.trim()) supabaseData.phone = leadData.phone.trim();
      if (leadData.company?.trim()) supabaseData.company = leadData.company.trim();
      if (leadData.assignedTo?.trim()) supabaseData.assigned_to = leadData.assignedTo.trim();
      if (leadData.notes?.trim()) supabaseData.notes = leadData.notes.trim();
      if (leadData.commercialPhone?.trim()) supabaseData.commercial_phone = leadData.commercialPhone.trim();
      if (leadData.commercialEmail?.trim()) supabaseData.commercial_email = leadData.commercialEmail.trim();
      if (leadData.privateEmail?.trim()) supabaseData.private_email = leadData.privateEmail.trim();
      if (leadData.otherEmail?.trim()) supabaseData.other_email = leadData.otherEmail.trim();
      if (leadData.homeNumber?.trim()) supabaseData.home_number = leadData.homeNumber.trim();
      if (leadData.state?.trim()) supabaseData.state = leadData.state.trim();
      if (leadData.city?.trim()) supabaseData.city = leadData.city.trim();
      if (leadData.address?.trim()) supabaseData.address = leadData.address.trim();
      if (leadData.website?.trim()) supabaseData.website = leadData.website.trim();
      if (leadData.saleValue) supabaseData.sale_value = leadData.saleValue;
      if (leadData.product?.trim()) supabaseData.product = leadData.product.trim();
      if (leadData.saleAmount) supabaseData.sale_amount = leadData.saleAmount;
      if (leadData.enrollmentValue) supabaseData.enrollment_value = leadData.enrollmentValue;
      if (leadData.installments) supabaseData.installments = leadData.installments;
      if (leadData.mec?.trim()) supabaseData.mec = leadData.mec.trim();
      if (leadData.paymentMethod?.trim()) supabaseData.payment_method = leadData.paymentMethod.trim();
      if (leadData.paymentStartMonth?.trim()) supabaseData.payment_start_month = leadData.paymentStartMonth.trim();
      if (leadData.weekDay) supabaseData.week_day = leadData.weekDay;
      if (leadData.autoScheduled !== undefined) supabaseData.auto_scheduled = leadData.autoScheduled;
      if (leadData.meetingDate) supabaseData.meeting_date = leadData.meetingDate.toISOString();
      if (leadData.meetingTime?.trim()) supabaseData.meeting_time = leadData.meetingTime.trim();
      if (leadData.contactorId?.trim()) supabaseData.contactor_id = leadData.contactorId.trim();
      if (leadData.meetingLink?.trim()) supabaseData.meeting_link = leadData.meetingLink.trim();
      if (leadData.meetingDateTime) supabaseData.meeting_date_time = leadData.meetingDateTime.toISOString();
      if (leadData.shift?.trim()) supabaseData.shift = leadData.shift.trim();
      if (leadData.practitioner?.trim()) supabaseData.practitioner = leadData.practitioner.trim();
      if (leadData.nextFollowUp) supabaseData.next_follow_up = leadData.nextFollowUp.toISOString();
      if (leadData.tags && leadData.tags.length > 0) supabaseData.tags = leadData.tags;
      if (leadData.customFields && Object.keys(leadData.customFields).length > 0) supabaseData.custom_fields = leadData.customFields;

      console.log('📤 Dados sendo enviados para Supabase:', supabaseData);

      const { data, error } = await supabase
        .from('leads')
        .insert(supabaseData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ Lead criado com sucesso:', data);

      // Mapear resposta do Supabase para o formato Lead
      const newLead: Lead = {
        id: data.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        course: data.course || '',
        source: data.source || 'website',
        value: data.value || 0,
        columnId: data.column_id,
        assignedTo: data.assigned_to || '',
        tags: data.tags || [],
        company: data.company || '',
        commercialPhone: data.commercial_phone || '',
        commercialEmail: data.commercial_email || '',
        privateEmail: data.private_email || '',
        otherEmail: data.other_email || '',
        homeNumber: data.home_number || '',
        state: data.state || '',
        city: data.city || '',
        address: data.address || '',
        website: data.website || '',
        saleValue: data.sale_value || 0,
        product: data.product || '',
        saleAmount: data.sale_amount || 0,
        enrollmentValue: data.enrollment_value || 0,
        installments: data.installments || 0,
        mec: data.mec || '',
        paymentMethod: data.payment_method || '',
        paymentStartMonth: data.payment_start_month || '',
        weekDay: data.week_day || 0,
        autoScheduled: data.auto_scheduled || false,
        meetingDate: data.meeting_date ? new Date(data.meeting_date) : undefined,
        meetingTime: data.meeting_time || '',
        contactorId: data.contactor_id || '',
        meetingLink: data.meeting_link || '',
        meetingDateTime: data.meeting_date_time ? new Date(data.meeting_date_time) : undefined,
        shift: data.shift || '',
        practitioner: data.practitioner || '',
        notes: data.notes || '',
        nextFollowUp: data.next_follow_up ? new Date(data.next_follow_up) : undefined,
        createdAt: new Date(data.created_at),
        lastUpdated: new Date(data.updated_at || data.created_at),
        customFields: data.custom_fields || {}
      };

      setLeads(prev => [newLead, ...prev]);
      return newLead;
    } catch (err) {
      console.error('❌ Erro ao criar lead:', err);
      throw err;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      // Mapear apenas campos básicos e seguros
      const safeUpdates: any = {};
      
      // Campos básicos que sabemos que existem
      if (updates.name !== undefined) safeUpdates.name = updates.name;
      if (updates.email !== undefined) safeUpdates.email = updates.email;
      if (updates.phone !== undefined) safeUpdates.phone = updates.phone;
      if (updates.course !== undefined) safeUpdates.course = updates.course;
      if (updates.source !== undefined) safeUpdates.source = updates.source;
      if (updates.value !== undefined) safeUpdates.value = Number(updates.value) || 0;
      if (updates.company !== undefined) safeUpdates.company = updates.company;
      if (updates.notes !== undefined) safeUpdates.notes = updates.notes;
      
      // Campos de venda
      if (updates.saleValue !== undefined) safeUpdates.sale_value = Number(updates.saleValue) || 0;
      if (updates.saleAmount !== undefined) safeUpdates.sale_amount = Number(updates.saleAmount) || 0;
      if (updates.enrollmentValue !== undefined) safeUpdates.enrollment_value = Number(updates.enrollmentValue) || 0;
      if (updates.installments !== undefined) safeUpdates.installments = Number(updates.installments) || 0;
      if (updates.product !== undefined && updates.product !== null && updates.product !== '') {
        safeUpdates.product = updates.product;
      }
      if (updates.paymentMethod !== undefined && updates.paymentMethod !== null && updates.paymentMethod !== '') {
        safeUpdates.payment_method = updates.paymentMethod;
      }
      if (updates.paymentStartMonth !== undefined && updates.paymentStartMonth !== null && updates.paymentStartMonth !== '') {
        safeUpdates.payment_start_month = updates.paymentStartMonth;
      }
      if (updates.weekDay !== undefined) safeUpdates.week_day = Number(updates.weekDay) || 0;
      if (updates.autoScheduled !== undefined) safeUpdates.auto_scheduled = updates.autoScheduled;
      if (updates.meetingDate !== undefined) safeUpdates.meeting_date = updates.meetingDate;
      if (updates.meetingTime !== undefined && updates.meetingTime !== null && updates.meetingTime !== '') {
        safeUpdates.meeting_time = updates.meetingTime;
      }
      if (updates.contactorId !== undefined && updates.contactorId !== null && updates.contactorId !== '') {
        safeUpdates.contactor_id = updates.contactorId;
      }
      if (updates.meetingLink !== undefined && updates.meetingLink !== null && updates.meetingLink !== '') {
        safeUpdates.meeting_link = updates.meetingLink;
      }
      if (updates.meetingDateTime !== undefined) safeUpdates.meeting_date_time = updates.meetingDateTime;
      if (updates.shift !== undefined && updates.shift !== null && updates.shift !== '') {
        safeUpdates.shift = updates.shift;
      }
      if (updates.practitioner !== undefined && updates.practitioner !== null && updates.practitioner !== '') {
        safeUpdates.practitioner = updates.practitioner;
      }
      if (updates.mec !== undefined && updates.mec !== null && updates.mec !== '') {
        safeUpdates.mec = updates.mec;
      }
      if (updates.commercialPhone !== undefined) safeUpdates.commercial_phone = updates.commercialPhone;
      if (updates.commercialEmail !== undefined) safeUpdates.commercial_email = updates.commercialEmail;
      if (updates.privateEmail !== undefined) safeUpdates.private_email = updates.privateEmail;
      if (updates.otherEmail !== undefined) safeUpdates.other_email = updates.otherEmail;
      if (updates.homeNumber !== undefined) safeUpdates.home_number = updates.homeNumber;
      if (updates.state !== undefined) safeUpdates.state = updates.state;
      
      // Mapear columnId para column_id
      if (updates.columnId !== undefined) {
        safeUpdates.column_id = updates.columnId;
      }
      
      console.log('📤 Atualizando lead no Supabase:', { id, updates: safeUpdates });
      console.log('📤 Campos a serem atualizados:', Object.keys(safeUpdates));

      const { data, error } = await supabase
        .from('leads')
        .update({
          ...safeUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        console.error('❌ Detalhes do erro:', error.message, error.details);
        throw error;
      }

      console.log('✅ Lead atualizado com sucesso no Supabase:', data);
      console.log('🔍 Verificando campos específicos:');
      console.log('  - name:', data.name);
      console.log('  - value:', data.value);
      console.log('  - email:', data.email);
      console.log('  - phone:', data.phone);
      console.log('  - course:', data.course);
      console.log('  - company:', data.company);

      const updatedLead: Lead = {
        id: data.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        course: data.course || '',
        source: data.source || 'website',
        value: data.value || 0,
        columnId: data.column_id,
        assignedTo: data.assigned_to || '',
        tags: data.tags || [],
        company: data.company || '',
        commercialPhone: data.commercial_phone || '',
        commercialEmail: data.commercial_email || '',
        privateEmail: data.private_email || '',
        otherEmail: data.other_email || '',
        homeNumber: data.home_number || '',
        state: data.state || '',
        city: data.city || '',
        address: data.address || '',
        website: data.website || '',
        saleValue: data.sale_value || 0,
        product: data.product || '',
        saleAmount: data.sale_amount || 0,
        enrollmentValue: data.enrollment_value || 0,
        installments: data.installments || 0,
        mec: data.mec || '',
        paymentMethod: data.payment_method || '',
        paymentStartMonth: data.payment_start_month || '',
        weekDay: data.week_day || 0,
        autoScheduled: data.auto_scheduled || false,
        meetingDate: data.meeting_date ? new Date(data.meeting_date) : undefined,
        meetingTime: data.meeting_time || '',
        contactorId: data.contactor_id || '',
        meetingLink: data.meeting_link || '',
        meetingDateTime: data.meeting_date_time ? new Date(data.meeting_date_time) : undefined,
        shift: data.shift || '',
        practitioner: data.practitioner || '',
        notes: data.notes || '',
        nextFollowUp: data.next_follow_up ? new Date(data.next_follow_up) : undefined,
        createdAt: new Date(data.created_at),
        lastUpdated: new Date(data.updated_at || data.created_at),
        customFields: data.custom_fields || {}
      };

      console.log('🔄 Atualizando estado local com lead:', updatedLead);
      
      // Forçar re-render com timeout para garantir que o estado seja atualizado
      setTimeout(() => {
        setLeads(prev => {
          const newLeads = prev.map(lead => lead.id === id ? updatedLead : lead);
          console.log('📊 Estado anterior:', prev.length, 'leads');
          console.log('📊 Estado novo:', newLeads.length, 'leads');
          console.log('📊 Lead atualizado:', newLeads.find(l => l.id === id));
          return newLeads;
        });
      }, 100);
      
      return updatedLead;
    } catch (err) {
      console.error('Erro ao atualizar lead:', err);
      throw err;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLeads(prev => prev.filter(lead => lead.id !== id));
    } catch (err) {
      console.error('Erro ao deletar lead:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [currentInstance?.id]);

  // Recarregar quando permissões mudam
  useEffect(() => {
    if (permissions) {
      fetchLeads();
    }
  }, [permissions]);

  // Evitar recarregamento desnecessário quando a aba volta ao foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Não recarregar quando a aba volta ao foco se já temos dados
      if (!document.hidden && leads.length > 0) {
        console.log('👁️ Aba voltou ao foco, mantendo leads atuais (evitando reload)');
        return;
      }
    };

    const handleFocus = () => {
      // Não recarregar quando a janela ganha foco se já temos dados
      if (leads.length > 0) {
        console.log('🎯 Janela ganhou foco, mantendo leads atuais (evitando reload)');
        return;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [leads]);

  const updateNotes = async (leadId: string, notes: string) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;

      const updatedLead: Lead = {
        id: data.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        course: data.course || '',
        source: data.source || 'website',
        value: data.value || 0,
        columnId: data.column_id,
        assignedTo: data.assigned_to || '',
        tags: data.tags || [],
        company: data.company || '',
        commercialPhone: data.commercial_phone || '',
        commercialEmail: data.commercial_email || '',
        privateEmail: data.private_email || '',
        otherEmail: data.other_email || '',
        homeNumber: data.home_number || '',
        state: data.state || '',
        city: data.city || '',
        address: data.address || '',
        website: data.website || '',
        saleValue: data.sale_value || 0,
        product: data.product || '',
        saleAmount: data.sale_amount || 0,
        enrollmentValue: data.enrollment_value || 0,
        installments: data.installments || 0,
        mec: data.mec || '',
        paymentMethod: data.payment_method || '',
        paymentStartMonth: data.payment_start_month || '',
        weekDay: data.week_day || 0,
        autoScheduled: data.auto_scheduled || false,
        meetingDate: data.meeting_date ? new Date(data.meeting_date) : undefined,
        meetingTime: data.meeting_time || '',
        contactorId: data.contactor_id || '',
        meetingLink: data.meeting_link || '',
        meetingDateTime: data.meeting_date_time ? new Date(data.meeting_date_time) : undefined,
        shift: data.shift || '',
        practitioner: data.practitioner || '',
        notes: data.notes || '',
        nextFollowUp: data.next_follow_up ? new Date(data.next_follow_up) : undefined,
        createdAt: new Date(data.created_at),
        lastUpdated: new Date(data.updated_at || data.created_at),
        customFields: data.custom_fields || {}
      };

      setLeads(prev => prev.map(lead => lead.id === leadId ? updatedLead : lead));
      return updatedLead;
    } catch (err) {
      console.error('Erro ao atualizar notas:', err);
      throw err;
    }
  };

      return {
        leads,
        loading,
        error,
        createLead,
        updateLead,
        updateNotes,
        deleteLead,
        refetch: fetchLeads,
      };
    };

// Hook para colunas do kanban com isolamento por instância
export const useInstanceKanbanColumns = () => {
  const { currentInstance, permissions } = useInstance();
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColumns = async () => {

    if (!currentInstance && !permissions?.canViewAllData) {
      setColumns([]);
      setLoading(false);
      return;
    }
    
    // Se não há permissões definidas ainda, aguardar
    if (!permissions) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('kanban_columns')
        .select('*')
        .order('order_index', { ascending: true });

      // Se for super admin, pode ver todas as colunas
      if (permissions.canViewAllData) {
        // Super admin pode ver todas as colunas
      } else if (currentInstance) {
        query = query.eq('instance_id', currentInstance.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('❌ Erro ao buscar colunas:', fetchError);
        throw fetchError;
      }

      if (!data || data.length === 0) {
        setColumns([]);
        setLoading(false);
        return;
      }

      // Mapear dados do Supabase para o formato KanbanColumn
      const mappedColumns = data.map(column => {
        const mappedColumn: KanbanColumn = {
          id: column.id,
          name: column.name || '',
          color: column.color || '#3B82F6',
          order: column.order_index || 0,
        };
        
        return mappedColumn;
      });

      setColumns(mappedColumns);
    } catch (err) {
      console.error('❌ Erro ao carregar colunas:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar colunas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColumns();
  }, [currentInstance?.id]);

  // Evitar recarregamento desnecessário quando a aba volta ao foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Não recarregar quando a aba volta ao foco se já temos dados
      if (!document.hidden && columns.length > 0) {
        console.log('👁️ Aba voltou ao foco, mantendo colunas atuais (evitando reload)');
        return;
      }
    };

    const handleFocus = () => {
      // Não recarregar quando a janela ganha foco se já temos dados
      if (columns.length > 0) {
        console.log('🎯 Janela ganhou foco, mantendo colunas atuais (evitando reload)');
        return;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [columns]);

      const createColumn = async (name: string, color: string) => {
        if (!currentInstance) throw new Error('Nenhuma instância selecionada');

        try {
          console.log('📤 Criando coluna:', { name, color, instanceId: currentInstance.id });

          // Validar dados antes de enviar
          if (!name || !name.trim()) {
            throw new Error('Nome da coluna é obrigatório');
          }
          if (!color) {
            throw new Error('Cor da coluna é obrigatória');
          }

          const { data, error } = await supabase
            .from('kanban_columns')
            .insert({
              name: name.trim(),
              color: color,
              order_index: (columns.length + 1),
              instance_id: currentInstance.id
            })
            .select()
            .single();

          if (error) {
            console.error('Erro do Supabase:', error);
            throw error;
          }

          const newColumn: KanbanColumn = {
            id: data.id,
            name: data.name,
            color: data.color,
            order: data.order_index,
          };

          setColumns(prev => [...prev, newColumn]);
          return newColumn;
        } catch (err) {
          console.error('Erro ao criar coluna:', err);
          throw err;
        }
      };

      const updateColumn = async (id: string, name: string, color: string) => {
        try {
          console.log('📤 Atualizando coluna:', { id, name, color });

          // Validar dados antes de enviar
          if (!name || !name.trim()) {
            throw new Error('Nome da coluna é obrigatório');
          }
          if (!color) {
            throw new Error('Cor da coluna é obrigatória');
          }

          const { data, error } = await supabase
            .from('kanban_columns')
            .update({
              name: name.trim(),
              color: color
            })
            .eq('id', id)
            .select()
            .single();

          if (error) {
            console.error('Erro do Supabase:', error);
            throw error;
          }

          const updatedColumn: KanbanColumn = {
            id: data.id,
            name: data.name,
            color: data.color,
            order: data.order_index,
          };

          setColumns(prev => prev.map(col => col.id === id ? updatedColumn : col));
          return updatedColumn;
        } catch (err) {
          console.error('Erro ao atualizar coluna:', err);
          throw err;
        }
      };

      const deleteColumn = async (id: string) => {
        try {
          console.log('📤 Deletando coluna:', id);

          const { error } = await supabase
            .from('kanban_columns')
            .delete()
            .eq('id', id);

          if (error) throw error;

          setColumns(prev => prev.filter(col => col.id !== id));
        } catch (err) {
          console.error('Erro ao deletar coluna:', err);
          throw err;
        }
      };

      const reorderColumns = async (newColumns: KanbanColumn[]) => {
        try {
          console.log('📤 Reordenando colunas no hook:', newColumns);
          
          // Atualizar estado local primeiro
          setColumns(newColumns);
          console.log('✅ Estado local atualizado com nova ordem');
          
          // Verificar se está em modo desenvolvimento
          const isDevMode = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
          if (isDevMode) {
            console.log('🔄 MODO DEV: Reordenação local concluída');
            return;
          }
          
          // Atualizar ordem de cada coluna no Supabase
          for (let i = 0; i < newColumns.length; i++) {
            const column = newColumns[i];
            const { error } = await supabase
              .from('kanban_columns')
              .update({ order_index: i })
              .eq('id', column.id);
            
            if (error) {
              console.error('❌ Erro ao atualizar coluna:', column.name, error);
              throw error;
            }
          }
          
          console.log('✅ Colunas reordenadas com sucesso no Supabase!');
        } catch (error) {
          console.error('❌ Erro ao reordenar colunas:', error);
          throw error;
        }
      };

      return {
        columns,
        loading,
        error,
        createColumn,
        updateColumn,
        deleteColumn,
        reorderColumns,
        refetch: fetchColumns,
      };
    };

// Hook para tarefas de follow-up com isolamento por instância
export const useInstanceFollowUpTasks = (filters?: { leadId?: string; closerId?: string }) => {
  const { currentInstance, permissions } = useInstance();
  const [tasks, setTasks] = useState<FollowUpTaskWithInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!currentInstance) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('follow_up_tasks')
        .select('*')
        .eq('instance_id', currentInstance.id)
        .order('due_date', { ascending: true });

      // Se for super admin, pode ver todas as tarefas
      if (permissions.canViewAllData) {
        query = supabase
          .from('follow_up_tasks')
          .select('*')
          .order('due_date', { ascending: true });
      }

      if (filters?.leadId) {
        query = query.eq('lead_id', filters.leadId);
      }

      if (filters?.closerId) {
        query = query.eq('closer_id', filters.closerId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setTasks(data?.map(task => ({
        ...task,
        dueDate: new Date(task.due_date),
        instanceId: task.instance_id,
      })) || []);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<FollowUpTask, 'id'>) => {
    if (!currentInstance) throw new Error('Nenhuma instância selecionada');

    try {
      const { data, error } = await supabase
        .from('follow_up_tasks')
        .insert({
          ...taskData,
          instance_id: currentInstance.id,
          due_date: taskData.dueDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const newTask: FollowUpTaskWithInstance = {
        ...data,
        dueDate: new Date(data.due_date),
        instanceId: data.instance_id,
      };

      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<FollowUpTask>) => {
    try {
      const updateData: any = { ...updates };
      if (updates.dueDate) {
        updateData.due_date = updates.dueDate.toISOString();
      }

      const { data, error } = await supabase
        .from('follow_up_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTask: FollowUpTaskWithInstance = {
        ...data,
        dueDate: new Date(data.due_date),
        instanceId: data.instance_id,
      };

      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('follow_up_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      console.error('Erro ao deletar tarefa:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentInstance?.id, filters?.leadId, filters?.closerId]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
};
