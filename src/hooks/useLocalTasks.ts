import { useState, useEffect } from 'react';

export interface LocalTask {
  id: string;
  leadId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

export interface LocalMessage {
  id: string;
  leadId: string;
  message: string;
  scheduledDate: string;
  sent: boolean;
  createdAt: string;
}

const STORAGE_KEY_TASKS = 'crm_local_tasks';
const STORAGE_KEY_MESSAGES = 'crm_local_messages';

export const useLocalTasks = () => {
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [messages, setMessages] = useState<LocalMessage[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
    
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
      }
    }
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      }
    }
  }, []);

  // Salvar no localStorage
  const saveTasks = (newTasks: LocalTask[]) => {
    setTasks(newTasks);
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(newTasks));
  };

  const saveMessages = (newMessages: LocalMessage[]) => {
    setMessages(newMessages);
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(newMessages));
  };

  // Criar tarefa
  const createTask = (leadId: string, taskData: {
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }) => {
    const newTask: LocalTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      leadId,
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const newTasks = [...tasks, newTask];
    saveTasks(newTasks);
    console.log('✅ Tarefa criada localmente:', newTask);
    return newTask;
  };

  // Criar mensagem
  const createMessage = (leadId: string, messageData: {
    message: string;
    scheduledDate: string;
  }) => {
    const newMessage: LocalMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      leadId,
      message: messageData.message,
      scheduledDate: messageData.scheduledDate,
      sent: false,
      createdAt: new Date().toISOString()
    };

    const newMessages = [...messages, newMessage];
    saveMessages(newMessages);
    console.log('✅ Mensagem criada localmente:', newMessage);
    return newMessage;
  };

  // Obter tarefas de um lead
  const getTasksByLead = (leadId: string) => {
    return tasks.filter(task => task.leadId === leadId);
  };

  // Obter mensagens de um lead
  const getMessagesByLead = (leadId: string) => {
    return messages.filter(message => message.leadId === leadId);
  };

  // Marcar tarefa como concluída
  const completeTask = (taskId: string) => {
    const newTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    );
    saveTasks(newTasks);
  };

  // Marcar mensagem como enviada
  const markMessageAsSent = (messageId: string) => {
    const newMessages = messages.map(message => 
      message.id === messageId ? { ...message, sent: true } : message
    );
    saveMessages(newMessages);
  };

  // Deletar tarefa
  const deleteTask = (taskId: string) => {
    const newTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(newTasks);
  };

  // Deletar mensagem
  const deleteMessage = (messageId: string) => {
    const newMessages = messages.filter(message => message.id !== messageId);
    saveMessages(newMessages);
  };

  const updateTask = (taskId: string, updates: Partial<LocalTask>) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updatedTasks));
  };

  const updateMessage = (messageId: string, updates: Partial<LocalMessage>) => {
    const updatedMessages = messages.map(message => 
      message.id === messageId ? { ...message, ...updates } : message
    );
    setMessages(updatedMessages);
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updatedMessages));
  };

  return {
    tasks,
    messages,
    createTask,
    createMessage,
    getTasksByLead,
    getMessagesByLead,
    completeTask,
    markMessageAsSent,
    deleteTask,
    deleteMessage,
    updateTask,
    updateMessage
  };
};
