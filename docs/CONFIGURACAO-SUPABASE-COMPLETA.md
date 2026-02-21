# Configuração completa Supabase – CRM SBCE

Guia único para deixar o Supabase + schemas funcionando do zero. Siga na ordem.

---

## 1. Criar projeto no Supabase Dashboard

1. Acesse **https://supabase.com/dashboard** e faça login.
2. Clique em **New project**.
3. **Name:** `sbce-crm` (ou outro).
4. **Database password:** defina uma senha forte e guarde (para acesso ao banco).
5. **Region:** ex. South America (São Paulo).
6. Clique em **Create new project** e aguarde a criação (1–2 min).

---

## 2. Rodar as migrations no SQL Editor (na ordem)

1. No projeto, vá em **SQL Editor**.
2. **Primeira migration:** clique em **New query**, abra o arquivo  
   `supabase/migrations/20250629144213_dusty_recipe.sql` do projeto, copie **todo** o conteúdo, cole no editor e clique em **Run**. Aguarde concluir (cria tabelas, RLS, triggers, views).
3. **Segunda migration:** nova query, abra  
   `supabase/migrations/20250629150639_rapid_lagoon.sql`, copie todo o conteúdo, cole e **Run** (cria funções `check_demo_users` e `create_missing_profiles`).
4. **Terceira migration (multi-tenant):** nova query, abra  
   `supabase/migrations/20260221140000_sbce_multi_tenant_and_app_schema.sql`, copie todo o conteúdo, cole e **Run** (cria tabelas `instances`, `instance_users`, `whatsapp_instances`, colunas `instance_id` em leads/kanban_columns/follow_up_tasks, colunas em `profiles`, e função `create_default_instance`).
5. Confira em **Table Editor** se existem as tabelas: `profiles`, `instances`, `instance_users`, `kanban_columns`, `leads`, `follow_up_tasks`, `whatsapp_instances`, etc.

---

## 3. Variáveis de ambiente (.env)

1. No Supabase: **Settings** → **API**.
2. Copie:
   - **Project URL**
   - **anon public** (key).
3. Na raiz do projeto CRM, crie ou edite o arquivo **`.env`** (não versionar; use `.env.example` como base).
4. Preencha:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Substitua pelos valores reais do seu projeto. Sem isso a app mostra a tela de setup e não conecta.

---

## 4. Criar os 3 usuários demo no Auth

1. No Supabase: **Authentication** → **Users** → **Add user** → **Create new user**.
2. Crie **um usuário por vez** com estes dados:

| Usuário  | Email            | Password   | Auto Confirm User |
|----------|------------------|------------|--------------------|
| Admin    | `admin@sbce.com` | `admin123` | ✅ Sim             |
| Manager  | `manager@sbce.com` | `manager123` | ✅ Sim          |
| Closer   | `closer@sbce.com` | `closer123` | ✅ Sim             |

Marque **Auto Confirm User** em todos para não precisar de e-mail de confirmação.

---

## 5. Criar profiles (vincular Auth → tabela `profiles`)

1. Vá em **SQL Editor**.
2. Execute:

```sql
SELECT create_missing_profiles();
```

3. Verifique:

```sql
SELECT * FROM check_demo_users();
```

Deve aparecer os 3 emails com status **✅ Configurado**.

---

## 5.1. Criar instância "Matriz" e vincular o admin (multi-tenant)

Para o CRM carregar leads e colunas por instância, é preciso ter pelo menos uma instância e o admin vinculado a ela.

1. No **SQL Editor**, execute (substitua pelo email do admin se for outro):

```sql
SELECT create_default_instance('admin@sbce.com');
```

2. Deve retornar um UUID (id da instância). Isso cria a instância **Matriz**, as 6 colunas do kanban para ela, associa o usuário `admin@sbce.com` como `super_admin` e define o role do profile como `super_admin`.

---

## 6. Testar na aplicação

1. Na raiz do projeto: `npm run dev`.
2. Abra **http://localhost:5173**.
3. Se o `.env` estiver correto, deve carregar a tela de login.
4. Faça login com:
   - Email: `admin@sbce.com`
   - Senha: `admin123`

Se entrar no dashboard e ver leads/colunas (vazios ou não), o setup está ok.

---

## Checklist rápido (o que o humano faz)

- [ ] Criar projeto no Supabase Dashboard
- [ ] Rodar `20250629144213_dusty_recipe.sql` no SQL Editor
- [ ] Rodar `20250629150639_rapid_lagoon.sql` no SQL Editor
- [ ] Rodar `20260221140000_sbce_multi_tenant_and_app_schema.sql` no SQL Editor
- [ ] Copiar Project URL e anon key em Settings → API
- [ ] Criar `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- [ ] Criar os 3 usuários em Authentication → Users (admin@sbce.com, manager@sbce.com, closer@sbce.com) com Auto Confirm
- [ ] Executar `SELECT create_missing_profiles();` no SQL Editor
- [ ] Executar `SELECT * FROM check_demo_users();` e conferir ✅ Configurado
- [ ] Executar `SELECT create_default_instance('admin@sbce.com');` para criar instância Matriz e vincular admin
- [ ] `npm run dev`, abrir localhost:5173 (ou 5174), login com admin@sbce.com / admin123

---

## Referências no repositório

- Migrations: `supabase/migrations/`
- Instruções de demo/login: `docs/SETUP_INSTRUCTIONS.md`, `docs/DEMO_USERS_SETUP.md`
- Tela quando `.env` está vazio: a app exibe instruções (SetupEnvPage) em vez de quebrar.
