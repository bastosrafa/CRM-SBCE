# SBCE CRM - Sistema de Gestão Comercial

Um CRM completo e moderno para gestão de leads, vendas e performance de equipes comerciais.

## 🚀 Funcionalidades Principais

### ✅ Implementado (Demo/Mock)
- **Dashboard Analytics** - Métricas de funil de vendas em tempo real
- **Pipeline de Leads** - Kanban board com drag & drop
- **Follow-up System** - Tarefas e mensagens agendadas
- **WhatsApp Shadow** - Monitoramento de conversas (simulado)
- **AI Performance** - Scripts de vendas e análise com IA
- **Team Management** - Gestão de performance da equipe
- **Meetings** - Central de reuniões com assistente IA
- **Integrations** - Painel de integrações Google Workspace

### 🔧 Para Implementar (Produção)

#### **Crítico - Backend & Database**
- [ ] **Banco de Dados Real** (PostgreSQL/Supabase)
- [ ] **API REST Endpoints** (CRUD leads, usuários, tarefas)
- [ ] **Autenticação JWT** (Login/logout real)
- [ ] **Sistema de Permissões** (Admin/Manager/Closer)
- [ ] **Deploy em Produção** (Vercel/AWS/Railway)

#### **Alto - Integrações**
- [ ] **WhatsApp Business API** (Envio/recebimento real)
- [ ] **WhatsApp Webhook** (Mensagens em tempo real)
- [ ] **Google Calendar OAuth** (Integração real)
- [ ] **Email Service** (SMTP/SendGrid)

#### **Médio - UX & Analytics**
- [ ] **Notificações Real-time** (WebSocket/SSE)
- [ ] **Push Notifications** (Browser)
- [ ] **Métricas Reais** (Cálculos baseados em dados reais)
- [ ] **Relatórios PDF/Excel**

#### **Baixo - Extras**
- [ ] **Gestão de Usuários** (CRUD interface)
- [ ] **Preferências do Usuário**
- [ ] **Backup Automático**
- [ ] **Logs de Auditoria**

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)
- **Vite** (Build tool)

### Backend (A Implementar)
- **Node.js** + **Express** ou **Next.js API Routes**
- **PostgreSQL** ou **Supabase**
- **JWT** (Autenticação)
- **WebSocket** (Real-time)

### Integrações
- **WhatsApp Business API**
- **Google Workspace APIs**
- **Facebook/Meta Ads API**
- **SendGrid** (Email)

## 📋 Checklist de Produção

Acesse a aba **"Production Checklist"** no CRM para ver o status detalhado de cada item necessário para produção.

### Itens Críticos
1. **Database Service** - Implementar conexão real com banco
2. **Auth Service** - Sistema de login/logout funcional
3. **API Endpoints** - Backend para CRUD operations
4. **Environment Variables** - Configurar todas as chaves de API
5. **Hosting** - Deploy em ambiente de produção

### Próximos Passos Recomendados

1. **Configurar Supabase**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Implementar Backend API**
   ```bash
   # Opção 1: Express.js separado
   mkdir sbce-crm-api
   cd sbce-crm-api
   npm init -y
   npm install express cors helmet morgan
   
   # Opção 2: Next.js API Routes
   npx create-next-app@latest sbce-crm-full --typescript
   ```

3. **Configurar WhatsApp Business**
   - Criar conta Meta Business
   - Configurar WhatsApp Business API
   - Implementar webhook endpoint

4. **Deploy**
   ```bash
   # Frontend (Vercel)
   vercel --prod
   
   # Backend (Railway/Render)
   railway deploy
   ```

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
├── services/           # Serviços (API, Auth, etc.)
├── hooks/              # Custom hooks
├── contexts/           # React contexts
├── utils/              # Utilitários e tipos
└── main.tsx           # Entry point
```

## 🔐 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Database
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# WhatsApp Business API
VITE_WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
VITE_WHATSAPP_ACCESS_TOKEN=your-access-token

# Google APIs
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service
VITE_SENDGRID_API_KEY=your-sendgrid-key
```

## 📞 Suporte

Para implementação em produção ou dúvidas técnicas, consulte:
- **Production Checklist** (aba no CRM)
- **Documentação das APIs** (links nos serviços)
- **Issues** neste repositório

---

**Status Atual:** ✅ Demo Funcional | 🔧 Pronto para Implementação Real