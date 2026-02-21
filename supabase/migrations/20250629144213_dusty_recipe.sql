-- =====================================================
-- SCHEMA COMPLETO SBCE CRM - SUPABASE
-- =====================================================

-- 1. TABELA DE USUÁRIOS (PROFILES) - Estende auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'closer' CHECK (role IN ('admin', 'manager', 'closer')),
  team TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'busy', 'away', 'offline')),
  
  -- Performance tracking
  leads_assigned INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  calls_today INTEGER DEFAULT 0,
  meetings_scheduled INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE COLUNAS DO KANBAN
CREATE TABLE IF NOT EXISTS public.kanban_columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE LEADS (PRINCIPAL) - Baseada nos dados do seu CRM
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Campos básicos obrigatórios
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  course TEXT NOT NULL,
  source TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL DEFAULT 0,
  column_id UUID REFERENCES public.kanban_columns(id) NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  next_follow_up TIMESTAMP WITH TIME ZONE,
  
  -- Campos Kommo-style (do seu sistema atual)
  company TEXT,
  commercial_phone TEXT,
  commercial_email TEXT,
  private_email TEXT,
  other_email TEXT,
  home_number TEXT,
  state TEXT,
  city TEXT,
  address TEXT,
  website TEXT,
  
  -- Campos de vendas específicos
  sale_value DECIMAL(10,2),
  product TEXT,
  sale_amount DECIMAL(10,2),
  enrollment_value DECIMAL(10,2),
  installments INTEGER,
  mec TEXT,
  payment_method TEXT CHECK (payment_method IN ('Boleto', 'Cartão', 'PIX', 'Transferência')),
  payment_start_month TEXT,
  week_day INTEGER,
  auto_scheduled BOOLEAN DEFAULT FALSE,
  meeting_date DATE,
  meeting_time TEXT,
  contactor_id TEXT,
  meeting_link TEXT,
  meeting_datetime TIMESTAMP WITH TIME ZONE,
  shift TEXT CHECK (shift IN ('Manhã', 'Tarde', 'Noite')),
  practitioner TEXT CHECK (practitioner IN ('Sim', 'Não', 'Talvez')),
  
  -- Campos de controle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE TAREFAS DE FOLLOW-UP
CREATE TABLE IF NOT EXISTS public.follow_up_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  closer_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  type TEXT NOT NULL DEFAULT 'call' CHECK (type IN ('call', 'email', 'whatsapp', 'meeting', 'proposal')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE MENSAGENS WHATSAPP
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id),
  closer_id UUID REFERENCES public.profiles(id),
  message_id TEXT UNIQUE, -- ID da mensagem do WhatsApp API
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('incoming', 'outgoing')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attachments TEXT[], -- URLs de anexos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE CONVERSAS WHATSAPP (AGRUPAMENTO)
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) UNIQUE,
  closer_id UUID REFERENCES public.profiles(id),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'responded', 'no-response', 'closed')),
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE REUNIÕES/MEETINGS
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id),
  closer_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_link TEXT,
  attendees TEXT[], -- Array de emails
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled', 'no-show')),
  
  -- Google Calendar integration
  google_event_id TEXT,
  google_calendar_id TEXT,
  
  -- AI Analysis (para o futuro)
  recording_url TEXT,
  transcript TEXT,
  ai_analysis JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA DE PERFORMANCE/ANALYTICS
CREATE TABLE IF NOT EXISTS public.performance_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  closer_id UUID REFERENCES public.profiles(id),
  lead_id UUID REFERENCES public.leads(id),
  meeting_id UUID REFERENCES public.meetings(id),
  date DATE NOT NULL,
  
  -- Métricas de performance
  call_duration INTEGER, -- em minutos
  pitch_adherence INTEGER CHECK (pitch_adherence >= 0 AND pitch_adherence <= 100),
  objection_handling INTEGER CHECK (objection_handling >= 0 AND objection_handling <= 100),
  closing_technique INTEGER CHECK (closing_technique >= 0 AND closing_technique <= 100),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  
  meeting_type TEXT CHECK (meeting_type IN ('discovery', 'presentation', 'closing', 'follow-up')),
  outcome TEXT CHECK (outcome IN ('scheduled', 'closed', 'objection', 'no-show')),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABELA DE MENSAGENS AGENDADAS
CREATE TABLE IF NOT EXISTS public.scheduled_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id),
  closer_id UUID REFERENCES public.profiles(id),
  message TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABELA DE CONFIGURAÇÕES DO SISTEMA
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSERIR DADOS INICIAIS
-- =====================================================

-- Inserir colunas padrão do kanban
INSERT INTO public.kanban_columns (name, color, order_index) VALUES
('Novos Leads', '#3B82F6', 0),
('Qualificação', '#F59E0B', 1),
('Apresentação', '#8B5CF6', 2),
('Proposta', '#EC4899', 3),
('Negociação', '#EF4444', 4),
('Fechamento', '#10B981', 5)
ON CONFLICT DO NOTHING;

-- Inserir configurações padrão do sistema
INSERT INTO public.system_settings (key, value, description) VALUES
('funnel_metrics', '{"enabled": true, "auto_calculate": true}', 'Configurações de métricas do funil'),
('whatsapp_integration', '{"enabled": false, "webhook_url": ""}', 'Configurações do WhatsApp'),
('google_integration', '{"calendar_enabled": false, "meet_enabled": false}', 'Configurações do Google'),
('notifications', '{"browser_enabled": true, "email_enabled": true}', 'Configurações de notificações')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (RLS POLICIES)
-- =====================================================

-- Profiles: Usuários podem ver e editar próprio perfil, managers podem ver todos
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Managers can read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Leads: Todos autenticados podem ver, closers só podem editar seus próprios
CREATE POLICY "Authenticated users can read leads" ON public.leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage assigned leads" ON public.leads
  FOR ALL TO authenticated USING (
    assigned_to = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Kanban Columns: Todos podem ler, só admins podem modificar
CREATE POLICY "Everyone can read kanban columns" ON public.kanban_columns
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can modify kanban columns" ON public.kanban_columns
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Follow-up Tasks: Usuários podem gerenciar suas próprias tarefas
CREATE POLICY "Users can manage own tasks" ON public.follow_up_tasks
  FOR ALL TO authenticated USING (
    closer_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- WhatsApp Messages: Usuários podem ver mensagens dos seus leads
CREATE POLICY "Users can manage own messages" ON public.whatsapp_messages
  FOR ALL TO authenticated USING (
    closer_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- WhatsApp Conversations: Mesma regra das mensagens
CREATE POLICY "Users can manage own conversations" ON public.whatsapp_conversations
  FOR ALL TO authenticated USING (
    closer_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Meetings: Usuários podem gerenciar suas próprias reuniões
CREATE POLICY "Users can manage own meetings" ON public.meetings
  FOR ALL TO authenticated USING (
    closer_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Performance Data: Usuários podem ver própria performance, managers veem todos
CREATE POLICY "Users can read own performance" ON public.performance_data
  FOR SELECT TO authenticated USING (
    closer_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can insert own performance" ON public.performance_data
  FOR INSERT TO authenticated WITH CHECK (closer_id = auth.uid());

-- Scheduled Messages: Usuários podem gerenciar suas próprias mensagens agendadas
CREATE POLICY "Users can manage own scheduled messages" ON public.scheduled_messages
  FOR ALL TO authenticated USING (
    closer_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- System Settings: Só admins podem modificar
CREATE POLICY "Everyone can read system settings" ON public.system_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can modify system settings" ON public.system_settings
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- TRIGGERS PARA UPDATED_AT AUTOMÁTICO
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas que têm updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_up_tasks_updated_at BEFORE UPDATE ON public.follow_up_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_conversations_updated_at BEFORE UPDATE ON public.whatsapp_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_column_id ON public.leads(column_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);

CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_closer_id ON public.follow_up_tasks(closer_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_due_date ON public.follow_up_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_status ON public.follow_up_tasks(status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_lead_id ON public.whatsapp_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON public.whatsapp_messages(timestamp);

CREATE INDEX IF NOT EXISTS idx_meetings_closer_id ON public.meetings(closer_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON public.meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON public.meetings(status);

CREATE INDEX IF NOT EXISTS idx_performance_data_closer_id ON public.performance_data(closer_id);
CREATE INDEX IF NOT EXISTS idx_performance_data_date ON public.performance_data(date);

-- =====================================================
-- VIEWS PARA RELATÓRIOS E ANALYTICS
-- =====================================================

-- View para métricas de performance por closer
CREATE OR REPLACE VIEW public.closer_performance_summary AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.role,
  p.team,
  p.status,
  COUNT(l.id) as total_leads,
  COUNT(CASE WHEN l.column_id = (SELECT id FROM kanban_columns WHERE name = 'Fechamento') THEN 1 END) as closed_leads,
  ROUND(
    COUNT(CASE WHEN l.column_id = (SELECT id FROM kanban_columns WHERE name = 'Fechamento') THEN 1 END)::DECIMAL / 
    NULLIF(COUNT(l.id), 0) * 100, 2
  ) as conversion_rate,
  COALESCE(SUM(CASE WHEN l.column_id = (SELECT id FROM kanban_columns WHERE name = 'Fechamento') THEN l.value END), 0) as total_revenue,
  COUNT(m.id) as total_meetings,
  COUNT(ft.id) as pending_tasks
FROM public.profiles p
LEFT JOIN public.leads l ON l.assigned_to = p.id
LEFT JOIN public.meetings m ON m.closer_id = p.id AND m.start_time >= CURRENT_DATE
LEFT JOIN public.follow_up_tasks ft ON ft.closer_id = p.id AND ft.status = 'pending'
WHERE p.role IN ('closer', 'manager')
GROUP BY p.id, p.name, p.email, p.role, p.team, p.status;

-- View para funil de vendas
CREATE OR REPLACE VIEW public.sales_funnel_metrics AS
SELECT 
  kc.name as stage_name,
  kc.color as stage_color,
  kc.order_index,
  COUNT(l.id) as lead_count,
  COALESCE(SUM(l.value), 0) as total_value,
  ROUND(AVG(l.value), 2) as avg_value
FROM public.kanban_columns kc
LEFT JOIN public.leads l ON l.column_id = kc.id
GROUP BY kc.id, kc.name, kc.color, kc.order_index
ORDER BY kc.order_index;

-- =====================================================
-- FUNÇÕES PARA CÁLCULOS AUTOMÁTICOS
-- =====================================================

-- Função para atualizar performance do closer automaticamente
CREATE OR REPLACE FUNCTION update_closer_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar estatísticas do closer quando um lead é movido
  IF TG_OP = 'UPDATE' AND OLD.column_id != NEW.column_id THEN
    UPDATE public.profiles 
    SET 
      leads_converted = (
        SELECT COUNT(*) FROM public.leads 
        WHERE assigned_to = NEW.assigned_to 
        AND column_id = (SELECT id FROM kanban_columns WHERE name = 'Fechamento')
      ),
      conversion_rate = (
        SELECT ROUND(
          COUNT(CASE WHEN column_id = (SELECT id FROM kanban_columns WHERE name = 'Fechamento') THEN 1 END)::DECIMAL / 
          NULLIF(COUNT(*), 0) * 100, 2
        )
        FROM public.leads 
        WHERE assigned_to = NEW.assigned_to
      ),
      revenue = (
        SELECT COALESCE(SUM(value), 0) FROM public.leads 
        WHERE assigned_to = NEW.assigned_to 
        AND column_id = (SELECT id FROM kanban_columns WHERE name = 'Fechamento')
      )
    WHERE id = NEW.assigned_to;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar performance automaticamente
CREATE TRIGGER update_closer_performance_trigger
  AFTER UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_closer_performance();

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema (closers, managers, admins)';
COMMENT ON TABLE public.leads IS 'Leads/prospects do CRM com todos os campos necessários';
COMMENT ON TABLE public.kanban_columns IS 'Colunas do quadro Kanban para pipeline de vendas';
COMMENT ON TABLE public.follow_up_tasks IS 'Tarefas de follow-up agendadas pelos closers';
COMMENT ON TABLE public.whatsapp_messages IS 'Mensagens do WhatsApp Business API';
COMMENT ON TABLE public.whatsapp_conversations IS 'Agrupamento de conversas por lead';
COMMENT ON TABLE public.meetings IS 'Reuniões agendadas com integração Google Calendar';
COMMENT ON TABLE public.performance_data IS 'Dados de performance e análise de chamadas';
COMMENT ON TABLE public.scheduled_messages IS 'Mensagens agendadas para envio futuro';
COMMENT ON TABLE public.system_settings IS 'Configurações globais do sistema';

-- =====================================================
-- SCHEMA COMPLETO - PRONTO PARA PRODUÇÃO! ✅
-- =====================================================