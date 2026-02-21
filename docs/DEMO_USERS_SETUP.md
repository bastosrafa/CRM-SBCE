# 🔐 Configuração de Usuários Demo - SBCE CRM

## ✅ Passo a Passo para Criar Usuários Demo

### 1. **Executar a Migration**
A migration `20250629145636_round_meadow.sql` já foi executada e criou:
- ✅ Dados de exemplo (leads, tarefas, mensagens)
- ✅ Perfis de usuários demo (com IDs temporários)
- ✅ Estrutura completa do banco

### 2. **Criar Usuários no Supabase Auth**

Vá para o **Supabase Dashboard** → **Authentication** → **Users** → **Add user**

Crie estes 3 usuários:

#### 👨‍💼 **Admin**
- **Email**: `admin@sbce.com`
- **Password**: `admin123`
- **Email Confirm**: ✅ Sim

#### 👩‍💼 **Manager** 
- **Email**: `manager@sbce.com`
- **Password**: `manager123`
- **Email Confirm**: ✅ Sim

#### 👨‍💻 **Closer**
- **Email**: `closer@sbce.com`
- **Password**: `closer123`
- **Email Confirm**: ✅ Sim

### 3. **Sincronizar IDs dos Usuários**

Após criar os usuários, execute esta função no **SQL Editor**:

```sql
SELECT sync_demo_users();
```

Esta função irá:
- ✅ Conectar os perfis criados com os usuários reais do Auth
- ✅ Atualizar todas as referências (leads, tarefas, mensagens)
- ✅ Garantir que tudo funcione corretamente

### 4. **Verificar se Funcionou**

Execute esta query para verificar:

```sql
SELECT 
  p.name,
  p.email,
  p.role,
  u.email as auth_email,
  CASE WHEN p.id = u.id THEN '✅ Sincronizado' ELSE '❌ Erro' END as status
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email IN ('admin@sbce.com', 'manager@sbce.com', 'closer@sbce.com');
```

Deve retornar algo como:
```
name         | email            | role    | auth_email       | status
-------------|------------------|---------|------------------|-------------
Admin SBCE   | admin@sbce.com   | admin   | admin@sbce.com   | ✅ Sincronizado
Manager SBCE | manager@sbce.com | manager | manager@sbce.com | ✅ Sincronizado  
Closer SBCE  | closer@sbce.com  | closer  | closer@sbce.com  | ✅ Sincronizado
```

## 🎯 **Credenciais para Login**

Após a configuração, use estas credenciais no CRM:

| Usuário | Email | Senha | Acesso |
|---------|-------|-------|--------|
| **Admin** | `admin@sbce.com` | `admin123` | Acesso total |
| **Manager** | `manager@sbce.com` | `manager123` | Gestão de equipe |
| **Closer** | `closer@sbce.com` | `closer123` | Vendas e leads |

## 🔧 **Dados de Exemplo Incluídos**

✅ **5 Leads** distribuídos no pipeline  
✅ **3 Tarefas** de follow-up  
✅ **3 Mensagens** WhatsApp  
✅ **2 Reuniões** agendadas  
✅ **2 Análises** de performance  
✅ **Métricas** realistas de conversão  

## 🚨 **Troubleshooting**

### Problema: "Invalid login credentials"
**Solução**: Verifique se os usuários foram criados no Supabase Auth e execute `SELECT sync_demo_users();`

### Problema: "User not found"
**Solução**: Confirme que os emails estão exatamente como especificado (com @sbce.com)

### Problema: Dados não aparecem
**Solução**: Execute a função de sincronização novamente e verifique se os IDs foram atualizados

## ✅ **Verificação Final**

1. ✅ Usuários criados no Supabase Auth
2. ✅ Função `sync_demo_users()` executada
3. ✅ Login funcionando com as credenciais
4. ✅ Dados aparecendo no dashboard
5. ✅ Leads atribuídos ao closer correto

**Pronto! Seu SBCE CRM está funcionando com dados reais! 🎉**