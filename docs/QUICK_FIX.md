# 🚨 SOLUÇÃO RÁPIDA - Login não funciona

## O Problema
Você está tentando fazer login mas recebe "Invalid login credentials" porque **os usuários demo ainda não foram criados no Supabase**.

## ⚡ Solução em 5 Minutos

### 1. Abra o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Selecione seu projeto SBCE CRM
- Clique em: **Authentication** → **Users**

### 2. Crie os 3 Usuários Demo
Clique em **"Add user"** e crie cada um:

**Usuário 1:**
- Email: `admin@sbce.com`
- Password: `admin123`
- ✅ Marque "Auto Confirm User"

**Usuário 2:**
- Email: `manager@sbce.com`
- Password: `manager123`
- ✅ Marque "Auto Confirm User"

**Usuário 3:**
- Email: `closer@sbce.com`
- Password: `closer123`
- ✅ Marque "Auto Confirm User"

### 3. Configure os Dados Demo
- Vá para: **SQL Editor**
- Cole e execute este comando:

```sql
SELECT setup_demo_data();
```

### 4. Teste o Login
Agora volte para o CRM e faça login com:
- `admin@sbce.com` / `admin123`
- `manager@sbce.com` / `manager123`
- `closer@sbce.com` / `closer123`

## ✅ Pronto!
O login deve funcionar agora. Você verá:
- Dashboard com dados reais
- 5 leads no pipeline
- Tarefas de follow-up
- Mensagens WhatsApp
- Reuniões agendadas

**Tempo total: ~5 minutos** ⏱️