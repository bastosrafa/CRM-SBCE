/**
 * Tela exibida quando VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão configuradas.
 * Este componente não importa supabase.ts para evitar erro ao carregar.
 */
import React from 'react';

export const SetupEnvPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Configuração do Supabase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            As variáveis de ambiente do Supabase não estão configuradas. Configure o arquivo <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env</code> na raiz do projeto para continuar.
          </p>
        </div>
        <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300 text-sm mb-6">
          <li>Copie <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env.example</code> para <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env</code></li>
          <li>Abra o painel do Supabase: <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">supabase.com/dashboard</a></li>
          <li>Em <strong>Settings → API</strong>, copie <strong>Project URL</strong> e <strong>anon public</strong> key</li>
          <li>No <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env</code>, preencha:
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-left overflow-x-auto">
{`VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima`}
            </pre>
          </li>
          <li>Reinicie o servidor de desenvolvimento (<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">npm run dev</code>) e recarregue a página</li>
        </ol>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Consulte <strong>docs/CONFIGURACAO-SUPABASE-COMPLETA.md</strong> para o guia completo (migrations, .env, usuários demo). Ver também docs/SETUP_INSTRUCTIONS.md e docs/DEMO_USERS_SETUP.md.
        </p>
      </div>
    </div>
  );
};
