import React from 'react';
import { useInstance } from '../contexts/InstanceContext';
import { useIsSuperAdmin } from '../contexts/InstanceContext';

const InstanceSelector: React.FC = () => {
  const { 
    currentInstance, 
    availableInstances, 
    switchInstance, 
    isLoading, 
    error 
  } = useInstance();
  
  const isSuperAdmin = useIsSuperAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Carregando instâncias...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        Erro: {error}
      </div>
    );
  }

  if (availableInstances.length === 0) {
    return (
      <div className="text-yellow-600 text-sm">
        Nenhuma instância disponível
      </div>
    );
  }

  // Se não é super admin e tem apenas uma instância, não mostrar o seletor
  if (!isSuperAdmin && availableInstances.length === 1) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {currentInstance?.name || 'Carregando...'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="instance-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {isSuperAdmin ? 'Instância:' : 'Ambiente:'}
      </label>
      
      <select
        id="instance-select"
        value={currentInstance?.id || ''}
        onChange={(e) => switchInstance(e.target.value)}
        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        disabled={availableInstances.length <= 1}
      >
        {availableInstances.map((instance) => (
          <option key={instance.id} value={instance.id}>
            {instance.name}
            {instance.type === 'matriz' && ' (Matriz)'}
          </option>
        ))}
      </select>

      {isSuperAdmin && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-500">Super Admin</span>
        </div>
      )}
    </div>
  );
};

export default InstanceSelector;
