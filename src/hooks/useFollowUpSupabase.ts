import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useInstance } from '../contexts/InstanceContext';

export interface FollowUpTask {
  id: string;
  lead_id: string;
  closer_id: string;
  instance_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  due_date: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUpMessage {
  id: string;
  lead_id: string;
  closer_id: string;
  instance_id: string;
  message: string;
  type: 'whatsapp' | 'email' | 'sms';
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  scheduled_date: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export const useFollowUpSupabase = () => {
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [messages, setMessages] = useState<FollowUpMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentInstance } = useInstance();

  // Carregar tarefas do Supabase
  const fetchTasks = async () => {
    if (!currentInstance) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('follow_up_tasks')
        .select(`
          *,
          lead:leads!follow_up_tasks_lead_id_fkey(
            id,
            name,
            email,
            phone
          )
        `)
        .eq('instance_id', currentInstance.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Carregar mensagens do Supabase
  const fetchMessages = async () => {
    if (!currentInstance) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('follow_up_messages')
        .select(`
          *,
          lead:leads!follow_up_messages_lead_id_fkey(
            id,
            name,
            email,
            phone
          )
        `)
        .eq('instance_id', currentInstance.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Criar tarefa no Supabase
  const createTask = async (leadId: string, taskData: {
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }) => {
    console.log('🔍 createTask chamado:', { leadId, taskData, currentInstance: currentInstance?.name });
    
    if (!currentInstance) {
      console.error('❌ Instância não selecionada');
      throw new Error('Instância não selecionada');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      console.log('✅ Usuário autenticado:', user.id);
      console.log('✅ Instância:', currentInstance.id);

      const taskDataToInsert = {
        id: crypto.randomUUID(),
        lead_id: leadId,
        closer_id: user.id,
        instance_id: currentInstance.id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        due_date: taskData.dueDate,
        status: 'pending'
      };

      console.log('📤 Inserindo tarefa:', taskDataToInsert);

      const { data, error } = await supabase
        .from('follow_up_tasks')
        .insert(taskDataToInsert)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao inserir tarefa:', error);
        throw error;
      }
      
      console.log('✅ Tarefa criada com sucesso:', data);
      setTasks(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('❌ Erro ao criar tarefa:', err);
      throw err;
    }
  };

  // Criar mensagem no Supabase
  const createMessage = async (leadId: string, messageData: {
    message: string;
    scheduledDate: string;
    type?: 'whatsapp' | 'email' | 'sms';
  }) => {
    console.log('🔍 createMessage chamado:', { leadId, messageData, currentInstance: currentInstance?.name });
    
    if (!currentInstance) {
      console.error('❌ Instância não selecionada');
      throw new Error('Instância não selecionada');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      console.log('✅ Usuário autenticado:', user.id);
      console.log('✅ Instância:', currentInstance.id);

      const messageDataToInsert = {
        id: crypto.randomUUID(),
        lead_id: leadId,
        closer_id: user.id,
        instance_id: currentInstance.id,
        message: messageData.message,
        scheduled_date: messageData.scheduledDate,
        type: messageData.type || 'whatsapp',
        status: 'scheduled'
      };

      console.log('📤 Inserindo mensagem:', messageDataToInsert);

      const { data, error } = await supabase
        .from('follow_up_messages')
        .insert(messageDataToInsert)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao inserir mensagem:', error);
        throw error;
      }
      
      console.log('✅ Mensagem criada com sucesso:', data);
      setMessages(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('❌ Erro ao criar mensagem:', err);
      throw err;
    }
  };

  // Atualizar tarefa
  const updateTask = async (taskId: string, updates: Partial<FollowUpTask>) => {
    try {
      const { data, error } = await supabase
        .from('follow_up_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(task => task.id === taskId ? data : task));
      return data;
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      throw err;
    }
  };

  // Atualizar mensagem
  const updateMessage = async (messageId: string, updates: Partial<FollowUpMessage>) => {
    try {
      const { data, error } = await supabase
        .from('follow_up_messages')
        .update(updates)
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      
      setMessages(prev => prev.map(message => message.id === messageId ? data : message));
      return data;
    } catch (err) {
      console.error('Erro ao atualizar mensagem:', err);
      throw err;
    }
  };

  // Deletar tarefa
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('follow_up_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Erro ao deletar tarefa:', err);
      throw err;
    }
  };

  // Deletar mensagem
  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('follow_up_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      
      setMessages(prev => prev.filter(message => message.id !== messageId));
    } catch (err) {
      console.error('Erro ao deletar mensagem:', err);
      throw err;
    }
  };

  // Obter tarefas de um lead
  const getTasksByLead = (leadId: string) => {
    return tasks.filter(task => task.lead_id === leadId);
  };

  // Obter mensagens de um lead
  const getMessagesByLead = (leadId: string) => {
    return messages.filter(message => message.lead_id === leadId);
  };

  // Migrar dados do localStorage para Supabase
  const migrateLocalData = async () => {
    try {
      const localTasks = localStorage.getItem('crm_local_tasks');
      const localMessages = localStorage.getItem('crm_local_messages');
      
      if (localTasks) {
        const tasks = JSON.parse(localTasks);
        for (const task of tasks) {
          try {
            await createTask(task.leadId, {
              title: task.title,
              description: task.description,
              dueDate: task.dueDate,
              priority: task.priority
            });
          } catch (err) {
            console.warn('Erro ao migrar tarefa:', err);
          }
        }
        localStorage.removeItem('crm_local_tasks');
      }
      
      if (localMessages) {
        const messages = JSON.parse(localMessages);
        for (const message of messages) {
          try {
            await createMessage(message.leadId, {
              message: message.message,
              scheduledDate: message.scheduledDate
            });
          } catch (err) {
            console.warn('Erro ao migrar mensagem:', err);
          }
        }
        localStorage.removeItem('crm_local_messages');
      }
    } catch (err) {
      console.error('Erro na migração:', err);
    }
  };

  // Carregar dados quando a instância muda
  useEffect(() => {
    if (currentInstance) {
      fetchTasks();
      fetchMessages();
      migrateLocalData();
    }
  }, [currentInstance]);

  // Marcar tarefa como concluída
  const completeTask = async (taskId: string) => {
    try {
      console.log('🔍 Tentando completar tarefa:', taskId);
      console.log('🔍 Instância atual:', currentInstance?.id);
      
      // Tentar atualizar no Supabase - apenas status por enquanto
      const { error } = await supabase
        .from('follow_up_tasks')
        .update({ 
          status: 'completed'
        })
        .eq('id', taskId);

      console.log('📊 Resultado da atualização:', { error });
      
      if (error) {
        console.error('❌ Erro detalhado:', error);
        console.error('❌ Código do erro:', error.code);
        console.error('❌ Mensagem do erro:', error.message);
        
        // Se for erro de tabela não encontrada, apenas atualizar localmente
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.log('⚠️ Tabela não encontrada, atualizando apenas localmente');
          setTasks(prev => prev.map(task => 
            task.id === taskId 
              ? { ...task, status: 'completed', completed_at: new Date().toISOString() }
              : task
          ));
          return;
        }
        
        throw error;
      }

      // Atualizar estado local
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed', completed_at: new Date().toISOString() }
          : task
      ));
      
      console.log('✅ Tarefa completada com sucesso');
    } catch (err) {
      console.error('❌ Erro ao completar tarefa:', err);
      setError('Erro ao completar tarefa');
    }
  };

  // Marcar mensagem como enviada
  const markMessageAsSent = async (messageId: string) => {
    try {
      // Tentar atualizar no Supabase primeiro
      try {
        const { error } = await supabase
          .from('follow_up_messages')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', messageId);

        if (error) throw error;
      } catch (supabaseError) {
        console.warn('⚠️ Supabase não disponível para mensagens, usando localStorage como fallback');
        
        // Fallback: usar localStorage
        const localMessages = JSON.parse(localStorage.getItem('crm_follow_up_messages') || '[]');
        const updatedMessages = localMessages.map((message: any) => 
          message.id === messageId 
            ? { ...message, status: 'sent', sent_at: new Date().toISOString() }
            : message
        );
        localStorage.setItem('crm_follow_up_messages', JSON.stringify(updatedMessages));
      }

      // Atualizar estado local
      setMessages(prev => prev.map(message => 
        message.id === messageId 
          ? { ...message, status: 'sent', sent_at: new Date().toISOString() }
          : message
      ));
    } catch (err) {
      console.error('Erro ao marcar mensagem como enviada:', err);
      setError('Erro ao marcar mensagem como enviada');
    }
  };

  return {
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
    markMessageAsSent,
    getTasksByLead,
    getMessagesByLead,
    fetchTasks,
    fetchMessages
  };
};