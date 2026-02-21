import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useInstance } from '../contexts/InstanceContext';

export interface FollowUpTask {
  id: string;
  leadId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpMessage {
  id: string;
  leadId: string;
  message: string;
  scheduledDate: string;
  status: 'pending' | 'sent' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const useFollowUpTasks = () => {
  const { currentInstance } = useInstance();
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [messages, setMessages] = useState<FollowUpMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!currentInstance) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('follow_up_tasks')
        .select('*')
        .eq('instance_id', currentInstance.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedTasks: FollowUpTask[] = data.map(task => ({
        id: task.id,
        leadId: task.lead_id,
        title: task.title,
        description: task.description || '',
        dueDate: task.due_date,
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        createdAt: task.created_at,
        updatedAt: task.updated_at || task.created_at
      }));

      setTasks(mappedTasks);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!currentInstance) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('follow_up_messages')
        .select('*')
        .eq('instance_id', currentInstance.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedMessages: FollowUpMessage[] = data.map(message => ({
        id: message.id,
        leadId: message.lead_id,
        message: message.message,
        scheduledDate: message.scheduled_date,
        status: message.status || 'pending',
        createdAt: message.created_at,
        updatedAt: message.updated_at || message.created_at
      }));

      setMessages(mappedMessages);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (leadId: string, taskData: Omit<FollowUpTask, 'id' | 'leadId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentInstance) throw new Error('Nenhuma instância selecionada');

    try {
      console.log('📤 Criando tarefa:', { leadId, taskData });

      const { data, error } = await supabase
        .from('follow_up_tasks')
        .insert({
          lead_id: leadId,
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.dueDate,
          priority: taskData.priority,
          status: taskData.status,
          instance_id: currentInstance.id
        })
        .select()
        .single();

      if (error) throw error;

      const newTask: FollowUpTask = {
        id: data.id,
        leadId: data.lead_id,
        title: data.title,
        description: data.description || '',
        dueDate: data.due_date,
        priority: data.priority || 'medium',
        status: data.status || 'pending',
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at
      };

      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
      throw err;
    }
  };

  const createMessage = async (leadId: string, messageData: Omit<FollowUpMessage, 'id' | 'leadId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentInstance) throw new Error('Nenhuma instância selecionada');

    try {
      console.log('📤 Criando mensagem:', { leadId, messageData });

      const { data, error } = await supabase
        .from('follow_up_messages')
        .insert({
          lead_id: leadId,
          message: messageData.message,
          scheduled_date: messageData.scheduledDate,
          status: messageData.status,
          instance_id: currentInstance.id
        })
        .select()
        .single();

      if (error) throw error;

      const newMessage: FollowUpMessage = {
        id: data.id,
        leadId: data.lead_id,
        message: data.message,
        scheduledDate: data.scheduled_date,
        status: data.status || 'pending',
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at
      };

      setMessages(prev => [newMessage, ...prev]);
      return newMessage;
    } catch (err) {
      console.error('Erro ao criar mensagem:', err);
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<FollowUpTask>) => {
    try {
      console.log('📤 Atualizando tarefa:', { taskId, updates });

      const { data, error } = await supabase
        .from('follow_up_tasks')
        .update({
          title: updates.title,
          description: updates.description,
          due_date: updates.dueDate,
          priority: updates.priority,
          status: updates.status
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      const updatedTask: FollowUpTask = {
        id: data.id,
        leadId: data.lead_id,
        title: data.title,
        description: data.description || '',
        dueDate: data.due_date,
        priority: data.priority || 'medium',
        status: data.status || 'pending',
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at
      };

      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      console.log('📤 Deletando tarefa:', taskId);

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

  useEffect(() => {
    fetchTasks();
    fetchMessages();
  }, [currentInstance?.id]);

  return {
    tasks,
    messages,
    loading,
    error,
    createTask,
    createMessage,
    updateTask,
    deleteTask,
    fetchTasks,
    fetchMessages
  };
};
