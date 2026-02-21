import React, { useState } from 'react';
import { useInstance, useIsSuperAdmin } from '../contexts/InstanceContext';
import { Instance, UserRole } from '../utils/types';
import { supabase } from '../lib/supabase';

interface CreateInstanceForm {
  name: string;
  ownerEmail: string;
  ownerName: string;
}

const InstanceManagement: React.FC = () => {
  const { availableInstances, refetch } = useInstance();
  const isSuperAdmin = useIsSuperAdmin();
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateInstanceForm>({
    name: '',
    ownerEmail: '',
    ownerName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSuperAdmin) {
    return null;
  }

  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.name || !createForm.ownerEmail || !createForm.ownerName) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Buscar a instância matriz (SBCE - Matriz)
      const { data: matrizInstance, error: matrizError } = await supabase
        .from('instances')
        .select('*')
        .eq('name', 'SBCE - Matriz')
        .eq('status', 'active')
        .single();

      if (matrizError || !matrizInstance) {
        throw new Error('Instância matriz "SBCE - Matriz" não encontrada. Crie a instância matriz primeiro.');
      }

      console.log('✅ Instância matriz encontrada:', matrizInstance.name);

      // 2. Criar nova instância
      const { data: newInstance, error: instanceError } = await supabase
        .from('instances')
        .insert({
          name: createForm.name,
          slug: createForm.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-'),
          type: 'franqueado',
          status: 'active',
          settings: matrizInstance.settings // Copiar configurações da matriz
        })
        .select()
        .single();

      if (instanceError) {
        throw instanceError;
      }

      console.log('✅ Nova instância criada:', newInstance.name);

      // 3. Copiar colunas Kanban da matriz
      const { data: matrizColumns, error: columnsError } = await supabase
        .from('kanban_columns')
        .select('*')
        .eq('instance_id', matrizInstance.id)
        .order('order_index');

      if (columnsError) {
        console.warn('Erro ao buscar colunas da matriz:', columnsError);
      } else if (matrizColumns && matrizColumns.length > 0) {
        // Inserir colunas copiadas da matriz
        const newColumns = matrizColumns.map(col => ({
          name: col.name,
          color: col.color,
          order_index: col.order_index,
          instance_id: newInstance.id,
          settings: col.settings
        }));

        const { error: insertColumnsError } = await supabase
          .from('kanban_columns')
          .insert(newColumns);

        if (insertColumnsError) {
          console.warn('Erro ao copiar colunas:', insertColumnsError);
        } else {
          console.log('✅ Colunas Kanban copiadas da matriz');
        }
      }

      // 4. Copiar configurações de campos da matriz (se existirem)
      const { data: matrizFieldConfigs, error: fieldConfigError } = await supabase
        .from('field_configs')
        .select('*')
        .eq('instance_id', matrizInstance.id);

      if (!fieldConfigError && matrizFieldConfigs && matrizFieldConfigs.length > 0) {
        const newFieldConfigs = matrizFieldConfigs.map(config => ({
          ...config,
          id: undefined, // Deixar o ID ser gerado automaticamente
          instance_id: newInstance.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: insertFieldConfigError } = await supabase
          .from('field_configs')
          .insert(newFieldConfigs);

        if (insertFieldConfigError) {
          console.warn('Erro ao copiar configurações de campos:', insertFieldConfigError);
        } else {
          console.log('✅ Configurações de campos copiadas da matriz');
        }
      }

      // 5. Copiar templates de follow-up da matriz (se existirem)
      const { data: matrizTemplates, error: templatesError } = await supabase
        .from('follow_up_templates')
        .select('*')
        .eq('instance_id', matrizInstance.id);

      if (!templatesError && matrizTemplates && matrizTemplates.length > 0) {
        const newTemplates = matrizTemplates.map(template => ({
          ...template,
          id: undefined,
          instance_id: newInstance.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: insertTemplatesError } = await supabase
          .from('follow_up_templates')
          .insert(newTemplates);

        if (insertTemplatesError) {
          console.warn('Erro ao copiar templates de follow-up:', insertTemplatesError);
        } else {
          console.log('✅ Templates de follow-up copiados da matriz');
        }
      }

      console.log('✅ Instância criada com sucesso:', newInstance);

      // Limpar formulário e fechar
      setCreateForm({ name: '', ownerEmail: '', ownerName: '' });
      setShowCreateForm(false);
      
      // Recarregar instâncias
      await refetch();
      
      alert('Instância criada com sucesso!');
    } catch (err) {
      console.error('Erro ao criar instância:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar instância');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendInstance = async (instanceId: string) => {
    if (!confirm('Tem certeza que deseja suspender esta instância?')) {
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('instances')
        .update({ status: 'suspended' })
        .eq('id', instanceId);

      if (error) throw error;

      await refetch();
      alert('Instância suspensa com sucesso!');
    } catch (err) {
      console.error('Erro ao suspender instância:', err);
      setError(err instanceof Error ? err.message : 'Erro ao suspender instância');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateInstance = async (instanceId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('instances')
        .update({ status: 'active' })
        .eq('id', instanceId);

      if (error) throw error;

      await refetch();
      alert('Instância ativada com sucesso!');
    } catch (err) {
      console.error('Erro ao ativar instância:', err);
      setError(err instanceof Error ? err.message : 'Erro ao ativar instância');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Gerenciamento de Instâncias
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? 'Cancelar' : 'Nova Instância'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreateInstance} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Criar Nova Instância</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome da Instância
              </label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: SBCE - Anderson Rodrigues"
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email do Proprietário
              </label>
              <input
                type="email"
                value={createForm.ownerEmail}
                onChange={(e) => setCreateForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="anderson@empresa.com"
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Proprietário
              </label>
              <input
                type="text"
                value={createForm.ownerName}
                onChange={(e) => setCreateForm(prev => ({ ...prev, ownerName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Anderson Rodrigues"
                disabled={loading}
                required
              />
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Instância'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Criado em
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {availableInstances.map((instance) => (
              <tr key={instance.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {instance.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {instance.slug}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    instance.type === 'matriz' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {instance.type === 'matriz' ? 'Matriz' : 'Franqueado'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    instance.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : instance.status === 'suspended'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {instance.status === 'active' ? 'Ativo' : 
                     instance.status === 'suspended' ? 'Suspenso' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {instance.createdAt.toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {instance.status === 'active' ? (
                    <button
                      onClick={() => handleSuspendInstance(instance.id)}
                      disabled={loading}
                      className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                    >
                      Suspender
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivateInstance(instance.id)}
                      disabled={loading}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      Ativar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstanceManagement;
