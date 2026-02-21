import React from 'react';
import { useInstance } from '../contexts/InstanceContext';

const InstanceDebug: React.FC = () => {
  const { currentInstance, availableInstances, userRole, isLoading, error } = useInstance();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md text-xs">
      <h3 className="font-bold mb-2">🐛 Debug Multi-Tenant</h3>
      
      <div className="space-y-1">
        <div><strong>Loading:</strong> {isLoading ? 'Sim' : 'Não'}</div>
        <div><strong>Error:</strong> {error || 'Nenhum'}</div>
        <div><strong>User Role:</strong> {userRole}</div>
        <div><strong>Current Instance:</strong> {currentInstance?.name || 'Nenhuma'}</div>
        <div><strong>Available Instances:</strong> {availableInstances.length}</div>
        
        {availableInstances.length > 0 && (
          <div className="mt-2">
            <strong>Instâncias:</strong>
            <ul className="ml-2">
              {availableInstances.map(instance => (
                <li key={instance.id} className="text-xs">
                  • {instance.name} ({instance.type})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstanceDebug;
