-- =====================================================
-- CRIAÇÃO DE USUÁRIOS DEMO - SUPABASE AUTH
-- =====================================================
-- Este arquivo contém as instruções para criar usuários demo

-- IMPORTANTE: Este SQL NÃO pode ser executado diretamente!
-- Os usuários devem ser criados através da interface do Supabase Dashboard

-- =====================================================
-- PASSO A PASSO PARA CRIAR USUÁRIOS DEMO
-- =====================================================

/*
1. VÁ PARA O SUPABASE DASHBOARD:
   - Acesse: https://supabase.com/dashboard
   - Selecione seu projeto SBCE CRM
   - Vá para: Authentication > Users

2. CLIQUE EM "ADD USER" E CRIE ESTES 3 USUÁRIOS:

   👨‍💼 ADMIN:
   - Email: admin@sbce.com
   - Password: admin123
   - Email Confirm: ✅ Marque como confirmado
   - Auto Confirm User: ✅ Sim

   👩‍💼 MANAGER:
   - Email: manager@sbce.com  
   - Password: manager123
   - Email Confirm: ✅ Marque como confirmado
   - Auto Confirm User: ✅ Sim

   👨‍💻 CLOSER:
   - Email: closer@sbce.com
   - Password: closer123
   - Email Confirm: ✅ Marque como confirmado
   - Auto Confirm User: ✅ Sim

3. APÓS CRIAR OS 3 USUÁRIOS, EXECUTE ESTA FUNÇÃO:
   - Vá para: SQL Editor
   - Execute: SELECT setup_demo_data();

4. VERIFIQUE SE FUNCIONOU:
   - Execute: SELECT * FROM public.profiles;
   - Deve mostrar os 3 perfis criados

5. TESTE O LOGIN:
   - Use qualquer uma das credenciais acima no CRM
*/

-- =====================================================
-- FUNÇÃO PARA VERIFICAR USUÁRIOS CRIADOS
-- =====================================================

CREATE OR REPLACE FUNCTION check_demo_users()
RETURNS TABLE(
  email TEXT,
  user_exists BOOLEAN,
  profile_exists BOOLEAN,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.email::TEXT,
    (u.id IS NOT NULL) as user_exists,
    (p.id IS NOT NULL) as profile_exists,
    CASE 
      WHEN u.id IS NOT NULL AND p.id IS NOT NULL THEN '✅ Configurado'
      WHEN u.id IS NOT NULL AND p.id IS NULL THEN '⚠️ Usuário existe, falta profile'
      ELSE '❌ Usuário não existe'
    END as status
  FROM (
    VALUES 
      ('admin@sbce.com'),
      ('manager@sbce.com'),
      ('closer@sbce.com')
  ) AS emails(email)
  LEFT JOIN auth.users u ON u.email = emails.email
  LEFT JOIN public.profiles p ON p.id = u.id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO PARA CRIAR PROFILES AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS TEXT AS $$
DECLARE
  result_text TEXT := '';
  user_record RECORD;
BEGIN
  -- Criar profiles para usuários que não têm
  FOR user_record IN 
    SELECT u.id, u.email
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE u.email IN ('admin@sbce.com', 'manager@sbce.com', 'closer@sbce.com')
    AND p.id IS NULL
  LOOP
    INSERT INTO public.profiles (
      id, email, name, role, team, status,
      leads_assigned, leads_converted, conversion_rate, revenue, calls_today, meetings_scheduled
    ) VALUES (
      user_record.id,
      user_record.email,
      CASE 
        WHEN user_record.email = 'admin@sbce.com' THEN 'Admin SBCE'
        WHEN user_record.email = 'manager@sbce.com' THEN 'Manager SBCE'
        WHEN user_record.email = 'closer@sbce.com' THEN 'Closer SBCE'
      END,
      CASE 
        WHEN user_record.email = 'admin@sbce.com' THEN 'admin'::TEXT
        WHEN user_record.email = 'manager@sbce.com' THEN 'manager'::TEXT
        WHEN user_record.email = 'closer@sbce.com' THEN 'closer'::TEXT
      END,
      CASE 
        WHEN user_record.email = 'admin@sbce.com' THEN 'Administração'
        ELSE 'Vendas'
      END,
      'offline',
      CASE WHEN user_record.email = 'closer@sbce.com' THEN 15 ELSE 0 END,
      CASE WHEN user_record.email = 'closer@sbce.com' THEN 8 ELSE 0 END,
      CASE WHEN user_record.email = 'closer@sbce.com' THEN 53.33 ELSE 0 END,
      CASE WHEN user_record.email = 'closer@sbce.com' THEN 24500.00 ELSE 0 END,
      CASE WHEN user_record.email = 'closer@sbce.com' THEN 3 ELSE 0 END,
      CASE WHEN user_record.email = 'closer@sbce.com' THEN 2 ELSE 0 END
    );
    
    result_text := result_text || 'Profile criado para: ' || user_record.email || E'\n';
  END LOOP;
  
  IF result_text = '' THEN
    result_text := 'Todos os profiles já existem!';
  END IF;
  
  RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMANDOS ÚTEIS PARA VERIFICAÇÃO
-- =====================================================

-- Verificar status dos usuários demo:
-- SELECT * FROM check_demo_users();

-- Criar profiles faltantes:
-- SELECT create_missing_profiles();

-- Verificar se tudo está funcionando:
-- SELECT 
--   p.name,
--   p.email,
--   p.role,
--   u.email as auth_email,
--   u.email_confirmed_at IS NOT NULL as email_confirmed
-- FROM public.profiles p
-- JOIN auth.users u ON p.id = u.id
-- WHERE p.email IN ('admin@sbce.com', 'manager@sbce.com', 'closer@sbce.com');