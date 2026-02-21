# 🚨 Troubleshooting - SBCE CRM

## Problema: Aplicação Fica Carregando Infinitamente

### 🔍 **Diagnóstico**

Se a aplicação fica carregando eternamente após fazer login, pode ser um dos seguintes problemas:

1. **Dados demo não foram configurados**
2. **Erro nas consultas do Supabase**
3. **Timeout nas requisições**
4. **Problemas de conexão com o banco**

### ⚡ **Soluções Rápidas**

#### 1. Verificar se os dados demo existem

Execute no **SQL Editor** do Supabase:

```sql
-- Verificar se as colunas do Kanban existem
SELECT COUNT(*) as total_columns FROM kanban_columns;

-- Verificar se os leads existem
SELECT COUNT(*) as total_leads FROM leads;

-- Verificar se os profiles existem
SELECT COUNT(*) as total_profiles FROM profiles;
```

**Resultado esperado:**
- `total_columns`: 6 ou mais
- `total_leads`: 5 ou mais  
- `total_profiles`: 3 ou mais

#### 2. Se os dados não existem, execute:

```sql
-- Criar dados demo básicos
INSERT INTO kanban_columns (id, name, color, order_index) VALUES
('11111111-1111-1111-1111-111111111111', 'Novos Leads', '#3B82F6', 0),
('22222222-2222-2222-2222-222222222222', 'Qualificação', '#F59E0B', 1),
('33333333-3333-3333-3333-333333333333', 'Apresentação', '#8B5CF6', 2),
('44444444-4444-4444-4444-444444444444', 'Proposta', '#EC4899', 3),
('55555555-5555-5555-5555-555555555555', 'Negociação', '#EF4444', 4),
('66666666-6666-6666-6666-666666666666', 'Fechamento', '#10B981', 5)
ON CONFLICT (id) DO NOTHING;
```

#### 3. Verificar conexão com Supabase

No **Console do Browser** (F12), procure por erros como:

- `Failed to fetch`
- `Network error`
- `CORS error`
- `Invalid API key`

#### 4. Verificar variáveis de ambiente

Confirme se o arquivo `.env` está correto:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 🔧 **Soluções Avançadas**

#### 1. Limpar cache do browser

- Pressione `Ctrl+Shift+R` (ou `Cmd+Shift+R` no Mac)
- Ou vá em DevTools → Application → Storage → Clear storage

#### 2. Reiniciar servidor de desenvolvimento

```bash
# Parar o servidor (Ctrl+C)
# Depois reiniciar
npm run dev
```

#### 3. Verificar logs do Supabase

1. Vá para **Supabase Dashboard**
2. Clique em **Logs**
3. Procure por erros recentes

#### 4. Testar conexão diretamente

Execute no **SQL Editor**:

```sql
-- Teste simples de conexão
SELECT 'Conexão funcionando!' as status, NOW() as timestamp;
```

### 🚨 **Se nada funcionar**

#### Opção 1: Reset completo dos dados

```sql
-- CUIDADO: Isso apaga TODOS os dados
TRUNCATE kanban_columns, leads, profiles, follow_up_tasks, whatsapp_messages, whatsapp_conversations, meetings, performance_data, scheduled_messages CASCADE;

-- Depois execute novamente:
SELECT setup_demo_data();
```

#### Opção 2: Criar novo projeto Supabase

1. Vá para https://supabase.com
2. Crie um novo projeto
3. Execute a migration principal: `supabase/migrations/20250629144213_dusty_recipe.sql`
4. Crie os usuários demo
5. Execute `SELECT setup_demo_data();`
6. Atualize as variáveis de ambiente

### ✅ **Verificação Final**

Após aplicar as soluções, teste:

1. ✅ Login funciona
2. ✅ Dashboard carrega em menos de 10 segundos
3. ✅ Leads aparecem no pipeline
4. ✅ Não há erros no console do browser
5. ✅ Dados são salvos corretamente

### 📞 **Ainda com problemas?**

Se o problema persistir:

1. Abra o **Console do Browser** (F12)
2. Vá para a aba **Console**
3. Copie todos os erros em vermelho
4. Verifique se há mensagens de timeout ou erro de rede

**A aplicação deve carregar completamente em menos de 10 segundos!**