-- =====================================================
-- SBCE CRM - Multi-tenant e tabelas/colunas esperadas pela app
-- Executar DEPOIS de 20250629144213 e 20250629150639
-- =====================================================

-- 1. TABELA INSTANCES (multi-tenant)
CREATE TABLE IF NOT EXISTS public.instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'matriz' CHECK (type IN ('matriz', 'franqueado')),
  owner_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA INSTANCE_USERS (usuário <-> instância com role)
CREATE TABLE IF NOT EXISTS public.instance_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'closer' CHECK (role IN ('super_admin', 'manager', 'closer', 'viewer')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(instance_id, user_id)
);

-- 3. ALTERAR PROFILES: colunas usadas pela app
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS instance_id UUID REFERENCES public.instances(id),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Permitir role super_admin (remover check antigo e recriar se necessário)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'manager', 'closer', 'super_admin'));

-- Atualizar full_name a partir de name onde estiver vazio
UPDATE public.profiles SET full_name = name WHERE full_name IS NULL;

-- 4. LEADS: instance_id (multi-tenant)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS instance_id UUID REFERENCES public.instances(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS auto_created BOOLEAN DEFAULT false;

-- 5. KANBAN_COLUMNS: instance_id (cada instância pode ter suas colunas)
ALTER TABLE public.kanban_columns ADD COLUMN IF NOT EXISTS instance_id UUID REFERENCES public.instances(id);

-- 6. FOLLOW_UP_TASKS: instance_id
ALTER TABLE public.follow_up_tasks ADD COLUMN IF NOT EXISTS instance_id UUID REFERENCES public.instances(id);

-- 7. TABELA FOLLOW_UP_MESSAGES
CREATE TABLE IF NOT EXISTS public.follow_up_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.follow_up_tasks(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA WHATSAPP_INSTANCES
CREATE TABLE IF NOT EXISTS public.whatsapp_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.instances(id) ON DELETE CASCADE,
  evolution_instance_id TEXT,
  qr_code TEXT,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting')),
  last_connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABELAS FORMS (formulários e submissões)
CREATE TABLE IF NOT EXISTS public.forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.instances(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES public.instances(id),
  data JSONB NOT NULL DEFAULT '{}',
  lead_id UUID REFERENCES public.leads(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. EXCEL_IMPORTS
CREATE TABLE IF NOT EXISTS public.excel_imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.instances(id) ON DELETE CASCADE,
  file_name TEXT,
  row_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. FIELD_CONFIGS e FOLLOW_UP_TEMPLATES (InstanceManagement)
CREATE TABLE IF NOT EXISTS public.field_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.instances(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.follow_up_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.instances(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. PARTNER_CLOSERS, CONVERSATION_ASSIGNMENTS, CLOSER_NOTIFICATIONS (whatsappCompleteService)
CREATE TABLE IF NOT EXISTS public.partner_closers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.instances(id) ON DELETE CASCADE,
  closer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(instance_id, closer_id)
);

CREATE TABLE IF NOT EXISTS public.conversation_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.instances(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  closer_id UUID NOT NULL REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.closer_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.instances(id) ON DELETE CASCADE,
  closer_id UUID NOT NULL REFERENCES public.profiles(id),
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. RLS para novas tabelas
ALTER TABLE public.instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instance_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excel_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_closers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closer_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas básicas: autenticados podem ler/escrever conforme role (simplificado para primeiro uso)
CREATE POLICY "Authenticated read instances" ON public.instances FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read instance_users" ON public.instance_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read whatsapp_instances" ON public.whatsapp_instances FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated all whatsapp_instances" ON public.whatsapp_instances FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read forms" ON public.forms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated all forms" ON public.forms FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read form_submissions" ON public.form_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated all form_submissions" ON public.form_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read excel_imports" ON public.excel_imports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated all excel_imports" ON public.excel_imports FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read field_configs" ON public.field_configs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated all field_configs" ON public.field_configs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read follow_up_templates" ON public.follow_up_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated all follow_up_templates" ON public.follow_up_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read follow_up_messages" ON public.follow_up_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated all follow_up_messages" ON public.follow_up_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read partner_closers" ON public.partner_closers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated all partner_closers" ON public.partner_closers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read conversation_assignments" ON public.conversation_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated all conversation_assignments" ON public.conversation_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read closer_notifications" ON public.closer_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated all closer_notifications" ON public.closer_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para instances e instance_users (admin pode criar/editar)
CREATE POLICY "Admins manage instances" ON public.instances FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')))
  WITH CHECK (true);
CREATE POLICY "Admins manage instance_users" ON public.instance_users FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'super_admin')))
  WITH CHECK (true);

-- 14. Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_instance_id ON public.leads(instance_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_instance_id ON public.follow_up_tasks(instance_id);
CREATE INDEX IF NOT EXISTS idx_kanban_columns_instance_id ON public.kanban_columns(instance_id);
CREATE INDEX IF NOT EXISTS idx_instance_users_user_id ON public.instance_users(user_id);
CREATE INDEX IF NOT EXISTS idx_instance_users_instance_id ON public.instance_users(instance_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_instance_id ON public.whatsapp_instances(instance_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_evolution ON public.whatsapp_instances(evolution_instance_id);

-- 15. Trigger updated_at para instances
CREATE TRIGGER update_instances_updated_at BEFORE UPDATE ON public.instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. Função opcional: criar instância "Matriz" e vincular um admin (rodar após criar usuário no Auth)
-- Uso: SELECT create_default_instance('admin@sbce.com');
CREATE OR REPLACE FUNCTION public.create_default_instance(p_admin_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_instance_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_admin_email LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado em auth.users. Crie o usuário no Supabase Auth primeiro.', p_admin_email;
  END IF;

  INSERT INTO public.instances (id, name, slug, type, status)
  VALUES (gen_random_uuid(), 'Matriz', 'matriz', 'matriz', 'active')
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO v_instance_id FROM public.instances WHERE slug = 'matriz' LIMIT 1;
  IF v_instance_id IS NULL THEN
    RAISE EXCEPTION 'Falha ao criar instância Matriz.';
  END IF;

  INSERT INTO public.instance_users (instance_id, user_id, role, is_active)
  VALUES (v_instance_id, v_user_id, 'super_admin', true)
  ON CONFLICT (instance_id, user_id) DO UPDATE SET role = 'super_admin', is_active = true;

  UPDATE public.profiles SET role = 'super_admin' WHERE id = v_user_id;

  -- Colunas kanban padrão para a instância Matriz (se ainda não existirem)
  INSERT INTO public.kanban_columns (name, color, order_index, instance_id)
  SELECT 'Novos Leads', '#3B82F6', 0, v_instance_id
  UNION ALL SELECT 'Qualificação', '#F59E0B', 1, v_instance_id
  UNION ALL SELECT 'Apresentação', '#8B5CF6', 2, v_instance_id
  UNION ALL SELECT 'Proposta', '#EC4899', 3, v_instance_id
  UNION ALL SELECT 'Negociação', '#EF4444', 4, v_instance_id
  UNION ALL SELECT 'Fechamento', '#10B981', 5, v_instance_id
  WHERE NOT EXISTS (SELECT 1 FROM public.kanban_columns WHERE instance_id = v_instance_id LIMIT 1);

  RETURN v_instance_id;
END;
$$;

COMMENT ON TABLE public.instances IS 'Instâncias multi-tenant (matriz/franqueados)';
COMMENT ON TABLE public.instance_users IS 'Associação usuário-instância com role';
COMMENT ON COLUMN public.leads.instance_id IS 'Instância dona do lead (multi-tenant)';
