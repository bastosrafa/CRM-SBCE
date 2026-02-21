# 🚀 Setup Instructions - SBCE CRM

## ⚠️ PROBLEMA ATUAL: "Invalid login credentials"

O erro acontece porque os usuários demo ainda não foram criados no Supabase Auth. Siga este guia para resolver:

## 📋 Passo a Passo Completo

### 1️⃣ **Configurar Banco de Dados** ✅ (Já feito)

O schema principal já foi aplicado. Se não foi, execute:
- Vá para Supabase Dashboard → SQL Editor
- Execute o conteúdo de `supabase/migrations/20250629144213_dusty_recipe.sql`

### 2️⃣ **Configurar Variáveis de Ambiente** ✅ (Já feito)

Verifique se seu arquivo `.env` está correto:
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 3️⃣ **CRIAR USUÁRIOS DEMO** ⚠️ (FAZER AGORA)

**Este é o passo que está faltando!**

1. **Vá para o Supabase Dashboard:**
   - Acesse: https://supabase.com/dashboard
   - Selecione seu projeto
   - Vá para: **Authentication** → **Users**

2. **Clique em "Add user" e crie estes 3 usuários:**

   **👨‍💼 Admin:**
   - Email: `admin@sbce.com`
   - Password: `admin123`
   - ✅ Marque "Auto Confirm User"

   **👩‍💼 Manager:**
   - Email: `manager@sbce.com`
   - Password: `manager123`
   - ✅ Marque "Auto Confirm User"

   **👨‍💻 Closer:**
   - Email: `closer@sbce.com`
   - Password: `closer123`
   - ✅ Marque "Auto Confirm User"

3. **Executar configuração dos dados demo:**
   - Vá para: **SQL Editor**
   - Execute: `SELECT setup_demo_data();`

4. **Verificar se funcionou:**
   - Execute: `SELECT * FROM check_demo_users();`
   - Deve mostrar "✅ Configurado" para os 3 usuários

### 4️⃣ **Testar Login**

Agora você pode fazer login com qualquer uma destas credenciais:

| Usuário | Email | Senha | Acesso |
|---------|-------|-------|--------|
| **Admin** | `admin@sbce.com` | `admin123` | Acesso total |
| **Manager** | `manager@sbce.com` | `manager123` | Gestão de equipe |
| **Closer** | `closer@sbce.com` | `closer123` | Vendas e leads |

## 🔧 Comandos Úteis para Verificação

Execute estes comandos no SQL Editor para verificar o status:

```sql
-- Verificar usuários criados
SELECT * FROM check_demo_users();

-- Criar profiles faltantes (se necessário)
SELECT create_missing_profiles();

-- Configurar dados demo completos
SELECT setup_demo_data();

-- Verificar se tudo está funcionando
SELECT 
  p.name,
  p.email,
  p.role,
  u.email as auth_email,
  u.email_confirmed_at IS NOT NULL as email_confirmed
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email IN ('admin@sbce.com', 'manager@sbce.com', 'closer@sbce.com');
```

## 🚨 Troubleshooting

### "Invalid login credentials"
- ✅ Verifique se os usuários foram criados no Supabase Auth
- ✅ Execute `SELECT setup_demo_data();`
- ✅ Confirme que os emails estão marcados como confirmados

### "User not found"
- ✅ Verifique se os emails estão exatamente como especificado
- ✅ Execute `SELECT * FROM check_demo_users();` para verificar

### Dados não aparecem no dashboard
- ✅ Execute `SELECT setup_demo_data();` novamente
- ✅ Verifique se os profiles foram criados corretamente

## ✅ Checklist Final

- [ ] Schema do banco aplicado
- [ ] Variáveis de ambiente configuradas
- [ ] **3 usuários criados no Supabase Auth** ← **FAZER AGORA**
- [ ] Função `setup_demo_data()` executada
- [ ] Login funcionando
- [ ] Dados aparecendo no dashboard

**Após seguir estes passos, o login deve funcionar perfeitamente! 🎉**