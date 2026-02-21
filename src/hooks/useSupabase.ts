import { useState, useEffect } from 'react'
import { supabase, supabaseHelpers } from '../lib/supabase'
import { Lead, KanbanColumn, FollowUpTask } from '../utils/types'

// Hook for Leads com melhor tratamento de erro
export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Carregando leads...')
      const data = await supabaseHelpers.getLeads()
      
      // Convert Supabase data to our Lead type
      const convertedLeads: Lead[] = data.map(lead => ({
        id: lead.id,
        name: lead.name || 'Nome não informado',
        email: lead.email || undefined,
        phone: lead.phone || undefined,
        course: lead.course || 'Curso não informado',
        source: lead.source || 'Fonte não informada',
        value: lead.value || 0,
        columnId: lead.column_id || '11111111-1111-1111-1111-111111111111',
        assignedTo: lead.assigned_to || undefined,
        tags: lead.tags || [],
        createdAt: new Date(lead.created_at || Date.now()),
        lastUpdated: new Date(lead.updated_at || Date.now()),
        notes: lead.notes ? [lead.notes] : [],
        nextFollowUp: lead.next_follow_up ? new Date(lead.next_follow_up) : undefined,
        
        // Kommo-style fields
        company: lead.company || undefined,
        commercialPhone: lead.commercial_phone || undefined,
        commercialEmail: lead.commercial_email || undefined,
        privateEmail: lead.private_email || undefined,
        otherEmail: lead.other_email || undefined,
        homeNumber: lead.home_number || undefined,
        state: lead.state || undefined,
        city: lead.city || undefined,
        address: lead.address || undefined,
        website: lead.website || undefined,
        
        // Sales fields
        saleValue: lead.sale_value || undefined,
        product: lead.product || undefined,
        saleAmount: lead.sale_amount || undefined,
        enrollmentValue: lead.enrollment_value || undefined,
        installments: lead.installments || undefined,
        mec: lead.mec || undefined,
        paymentMethod: lead.payment_method || undefined,
        paymentStartMonth: lead.payment_start_month || undefined,
        weekDay: lead.week_day || undefined,
        autoScheduled: lead.auto_scheduled || undefined,
        meetingDate: lead.meeting_date ? new Date(lead.meeting_date) : undefined,
        meetingTime: lead.meeting_time || undefined,
        contactorId: lead.contactor_id || undefined,
        meetingLink: lead.meeting_link || undefined,
        meetingDateTime: lead.meeting_datetime ? new Date(lead.meeting_datetime) : undefined,
        shift: lead.shift || undefined,
        practitioner: lead.practitioner || undefined
      }))
      
      setLeads(convertedLeads)
      console.log(`✅ ${convertedLeads.length} leads carregados com sucesso!`)
      setError(null)
    } catch (err: any) {
      console.error('❌ Erro ao carregar leads:', err)
      setError(`Erro ao carregar leads: ${err.message}`)
      // Set empty array on error to prevent infinite loading
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  const createLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'lastUpdated'>) => {
      const insertData = {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        course: leadData.course,
        source: leadData.source,
        value: leadData.value || 0,
        column_id: leadData.columnId,
        assigned_to: leadData.assignedTo,
        tags: leadData.tags,
        notes: leadData.notes?.join('\n'),
        next_follow_up: leadData.nextFollowUp?.toISOString(),
        
        // Kommo-style fields
        company: leadData.company,
        commercial_phone: leadData.commercialPhone,
        commercial_email: leadData.commercialEmail,
        private_email: leadData.privateEmail,
        other_email: leadData.otherEmail,
        home_number: leadData.homeNumber,
        state: leadData.state,
        city: leadData.city,
        address: leadData.address,
        website: leadData.website,
        
        // Sales fields
        sale_value: leadData.saleValue,
        product: leadData.product,
        sale_amount: leadData.saleAmount,
        enrollment_value: leadData.enrollmentValue,
        installments: leadData.installments,
        mec: leadData.mec,
        payment_method: leadData.paymentMethod,
        payment_start_month: leadData.paymentStartMonth,
        week_day: leadData.weekDay,
        auto_scheduled: leadData.autoScheduled,
        meeting_date: leadData.meetingDate?.toISOString().split('T')[0],
        meeting_time: leadData.meetingTime,
        contactor_id: leadData.contactorId,
        meeting_link: leadData.meetingLink,
        meeting_datetime: leadData.meetingDateTime?.toISOString(),
        shift: leadData.shift,
        practitioner: leadData.practitioner
      }

      const newLead = await supabaseHelpers.createLead(insertData)
      await fetchLeads() // Refresh the list
      return newLead
  }

  const updateLead = async (id: string, updates: Partial<Lead>) => {
      const updateData: Record<string, unknown> = {}
      
      // Map our Lead type to Supabase format
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.email !== undefined) updateData.email = updates.email
      if (updates.phone !== undefined) updateData.phone = updates.phone
      if (updates.course !== undefined) updateData.course = updates.course
      if (updates.source !== undefined) updateData.source = updates.source
      if (updates.value !== undefined) updateData.value = updates.value
      if (updates.columnId !== undefined) updateData.column_id = updates.columnId
      if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo
      if (updates.tags !== undefined) updateData.tags = updates.tags
      if (updates.notes !== undefined) updateData.notes = updates.notes?.join('\n')
      if (updates.nextFollowUp !== undefined) updateData.next_follow_up = updates.nextFollowUp?.toISOString()
      
      // Add all other fields...
      if (updates.company !== undefined) updateData.company = updates.company
      if (updates.commercialPhone !== undefined) updateData.commercial_phone = updates.commercialPhone
      if (updates.saleValue !== undefined) updateData.sale_value = updates.saleValue

      const updatedLead = await supabaseHelpers.updateLead(id, updateData)
      await fetchLeads() // Refresh the list
      return updatedLead
  }

  const deleteLead = async (id: string) => {
      await supabaseHelpers.deleteLead(id)
      await fetchLeads() // Refresh the list
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  return {
    leads,
    loading,
    error,
    createLead,
    updateLead,
    deleteLead,
    refetch: fetchLeads
  }
}

// Hook for Kanban Columns com melhor tratamento de erro
export const useKanbanColumns = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchColumns = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Carregando colunas...')
      const data = await supabaseHelpers.getKanbanColumns()
      
      const convertedColumns: KanbanColumn[] = data.map(col => ({
        id: col.id,
        name: col.name,
        color: col.color,
        order: col.order_index
      }))
      
      setColumns(convertedColumns)
      console.log(`✅ ${convertedColumns.length} colunas carregadas com sucesso!`)
      setError(null)
    } catch (err: any) {
      console.error('❌ Erro ao carregar colunas:', err)
      setError(`Erro ao carregar colunas: ${err.message}`)
      
      // Fallback para colunas padrão se não conseguir carregar
      const defaultColumns: KanbanColumn[] = [
        { id: '1', name: 'Novos Leads', color: '#3B82F6', order: 0 },
        { id: '2', name: 'Qualificação', color: '#F59E0B', order: 1 },
        { id: '3', name: 'Apresentação', color: '#8B5CF6', order: 2 },
        { id: '4', name: 'Proposta', color: '#EC4899', order: 3 },
        { id: '5', name: 'Fechamento', color: '#10B981', order: 4 }
      ]
      setColumns(defaultColumns)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchColumns()
  }, [])

  return {
    columns,
    loading,
    error,
    refetch: fetchColumns
  }
}

// Hook for Follow-up Tasks
export const useFollowUpTasks = (filters?: { leadId?: string; closerId?: string }) => {
  const [tasks, setTasks] = useState<FollowUpTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Carregando follow-up tasks...')
      
      let query = supabase
        .from('follow_up_tasks')
        .select(`
          *,
          leads:lead_id(name, email),
          profiles:closer_id(name, email)
        `)
        .order('due_date', { ascending: true })

      // Aplicar filtros
      if (filters?.leadId) {
        query = query.eq('lead_id', filters.leadId)
      }
      if (filters?.closerId) {
        query = query.eq('closer_id', filters.closerId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('❌ Erro ao buscar tasks:', fetchError)
        throw fetchError
      }

      const convertedTasks: FollowUpTask[] = (data || []).map(task => ({
        id: task.id,
        leadId: task.lead_id,
        closerId: task.closer_id,
        title: task.title,
        description: task.description || '',
        dueDate: new Date(task.due_date),
        priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: task.status as 'pending' | 'completed' | 'overdue',
        type: task.type as 'call' | 'email' | 'whatsapp' | 'meeting' | 'proposal'
      }))

      setTasks(convertedTasks)
      console.log(`✅ ${convertedTasks.length} follow-up tasks carregadas!`)
      setError(null)
    } catch (err: any) {
      console.error('❌ Erro ao carregar follow-up tasks:', err)
      setError(`Erro ao carregar tarefas: ${err.message}`)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Omit<FollowUpTask, 'id'>) => {
    try {
      console.log('🔄 Criando follow-up task...')
      
      const insertData = {
        lead_id: taskData.leadId,
        closer_id: taskData.closerId,
        title: taskData.title,
        description: taskData.description,
        due_date: taskData.dueDate.toISOString(),
        priority: taskData.priority,
        type: taskData.type
      }

      const { data, error: insertError } = await supabase
        .from('follow_up_tasks')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        console.error('❌ Erro ao criar task:', insertError)
        throw insertError
      }

      console.log('✅ Follow-up task criada com sucesso!')
      await fetchTasks() // Refresh the list
      return data
    } catch (err) {
      console.error('❌ Erro ao criar follow-up task:', err)
      throw err
    }
  }

  const updateTask = async (id: string, updates: Partial<FollowUpTask>) => {
    try {
      console.log('🔄 Atualizando follow-up task...')
      
      const updateData: any = {}
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate.toISOString()
      if (updates.priority !== undefined) updateData.priority = updates.priority
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.type !== undefined) updateData.type = updates.type

      const { data, error: updateError } = await supabase
        .from('follow_up_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Erro ao atualizar task:', updateError)
        throw updateError
      }

      console.log('✅ Follow-up task atualizada com sucesso!')
      await fetchTasks() // Refresh the list
      return data
    } catch (err) {
      console.error('❌ Erro ao atualizar follow-up task:', err)
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      console.log('🔄 Deletando follow-up task...')
      
      const { error: deleteError } = await supabase
        .from('follow_up_tasks')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('❌ Erro ao deletar task:', deleteError)
        throw deleteError
      }

      console.log('✅ Follow-up task deletada com sucesso!')
      await fetchTasks() // Refresh the list
    } catch (err) {
      console.error('❌ Erro ao deletar follow-up task:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [filters?.leadId, filters?.closerId])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks
  }
}

// Hook for Real-time subscriptions
export const useRealtimeSubscription = (table: string, callback: (payload: any) => void) => {
  useEffect(() => {
    const subscription = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table }, 
        callback
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [table, callback])
}