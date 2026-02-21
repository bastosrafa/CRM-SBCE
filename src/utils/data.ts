import { Lead, KanbanColumn, Closer, PerformanceData, FunnelMetrics, WhatsAppMessage, FollowUpTask } from './types';

export const mockColumns: KanbanColumn[] = [
  { id: '1', name: 'Novos Leads', color: '#3B82F6', order: 0 },
  { id: '2', name: 'Qualificação', color: '#F59E0B', order: 1 },
  { id: '3', name: 'Apresentação', color: '#8B5CF6', order: 2 },
  { id: '4', name: 'Proposta', color: '#EC4899', order: 3 },
  { id: '5', name: 'Negociação', color: '#EF4444', order: 4 },
  { id: '6', name: 'Fechamento', color: '#10B981', order: 5 }
];

export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Fábio Ernani Souza Borges',
    email: 'fsouzaborges@hotmail.com',
    phone: '+55 63 99214-6663',
    course: 'Pós Graduação',
    source: 'Meta',
    value: 6150,
    columnId: '1',
    assignedTo: 'João Santos',
    tags: ['hot-lead', 'executivo'],
    createdAt: new Date('2024-01-15'),
    lastUpdated: new Date('2024-01-15'),
    nextFollowUp: new Date('2024-01-16'),
    
    // Kommo-style fields
    company: 'Company name not specified',
    commercialPhone: '+55',
    commercialEmail: 'fsouzaborges@hotmail.com',
    privateEmail: 'fsouzaborges@hotmail.com',
    otherEmail: 'fsouzaborges@hotmail.com',
    homeNumber: '211',
    state: 'TO',
    city: 'Palmas',
    
    // Sales fields
    saleValue: 6150,
    product: 'Pós Graduação',
    saleAmount: 6150,
    enrollmentValue: 120,
    installments: 16,
    mec: 'será pago de forma opcional pelo aluno no final do curso',
    paymentMethod: 'Boleto',
    paymentStartMonth: 'Maio/2025',
    weekDay: 20,
    autoScheduled: true,
    meetingDate: new Date('2025-04-23'),
    meetingTime: '22:00',
    contactorId: '111111',
    meetingLink: 'https://meet.google.com/iym-hcoo-odj',
    meetingDateTime: new Date('2025-04-23T22:00:00'),
    shift: 'Noite',
    practitioner: 'Não'
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    email: 'carlos@empresa.com',
    phone: '+55 11 88888-5678',
    course: 'MBA Executivo',
    source: 'Google',
    value: 15000,
    columnId: '2',
    assignedTo: 'Maria Costa',
    tags: ['qualificado', 'tecnologia'],
    createdAt: new Date('2024-01-14'),
    lastUpdated: new Date('2024-01-15'),
    nextFollowUp: new Date('2024-01-17'),
    
    company: 'Tech Solutions Ltda',
    commercialPhone: '+55 11 88888-5678',
    commercialEmail: 'carlos@empresa.com',
    state: 'SP',
    city: 'São Paulo',
    
    saleValue: 15000,
    product: 'MBA Executivo',
    saleAmount: 15000,
    enrollmentValue: 500,
    installments: 24,
    paymentMethod: 'Cartão',
    autoScheduled: false,
    shift: 'Noite'
  },
  {
    id: '3',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@gmail.com',
    phone: '+55 11 77777-9012',
    course: 'MBA Executivo',
    source: 'Indicação',
    value: 15000,
    columnId: '3',
    assignedTo: 'Pedro Alves',
    tags: ['indicação', 'alta-prioridade'],
    createdAt: new Date('2024-01-13'),
    lastUpdated: new Date('2024-01-15'),
    nextFollowUp: new Date('2024-01-18'),
    
    company: 'Consultoria Lima & Associados',
    commercialEmail: 'fernanda.lima@gmail.com',
    state: 'RJ',
    city: 'Rio de Janeiro',
    
    saleValue: 15000,
    product: 'MBA Executivo',
    paymentMethod: 'PIX',
    autoScheduled: true,
    shift: 'Manhã'
  },
  {
    id: '4',
    name: 'Roberto Mendes',
    email: 'roberto@consultoria.com',
    phone: '+55 11 66666-3456',
    course: 'Curso de Extensão',
    source: 'Facebook Ads',
    value: 3500,
    columnId: '4',
    assignedTo: 'Ana Rodrigues',
    tags: ['proposta-enviada'],
    createdAt: new Date('2024-01-12'),
    lastUpdated: new Date('2024-01-15'),
    nextFollowUp: new Date('2024-01-19'),
    
    company: 'Mendes Consultoria',
    state: 'MG',
    city: 'Belo Horizonte',
    
    saleValue: 3500,
    product: 'Curso de Extensão',
    paymentMethod: 'Boleto',
    shift: 'Tarde'
  },
  {
    id: '5',
    name: 'Juliana Santos',
    email: 'juliana@startup.com',
    phone: '+55 11 55555-7890',
    course: 'Graduação EAD',
    source: 'Instagram',
    value: 12000,
    columnId: '5',
    assignedTo: 'Carlos Silva',
    tags: ['negociação', 'desconto'],
    createdAt: new Date('2024-01-11'),
    lastUpdated: new Date('2024-01-15'),
    nextFollowUp: new Date('2024-01-20'),
    
    company: 'StartupTech',
    state: 'SC',
    city: 'Florianópolis',
    
    saleValue: 12000,
    product: 'Graduação EAD',
    paymentMethod: 'Cartão',
    installments: 48,
    shift: 'Noite'
  }
];

export const mockClosers: Closer[] = [
  {
    id: '1',
    name: 'João Santos',
    email: 'joao@educrm.com',
    role: 'Senior Closer',
    team: 'MBA Team',
    performance: {
      leadsAssigned: 25,
      leadsConverted: 8,
      conversionRate: 32,
      revenue: 120000,
      callsToday: 12,
      meetingsScheduled: 5
    },
    status: 'online'
  },
  {
    id: '2',
    name: 'Maria Costa',
    email: 'maria@educrm.com',
    role: 'Closer',
    team: 'Digital Team',
    performance: {
      leadsAssigned: 30,
      leadsConverted: 12,
      conversionRate: 40,
      revenue: 102000,
      callsToday: 8,
      meetingsScheduled: 3
    },
    status: 'busy'
  },
  {
    id: '3',
    name: 'Pedro Alves',
    email: 'pedro@educrm.com',
    role: 'Junior Closer',
    team: 'MBA Team',
    performance: {
      leadsAssigned: 20,
      leadsConverted: 5,
      conversionRate: 25,
      revenue: 75000,
      callsToday: 6,
      meetingsScheduled: 2
    },
    status: 'online'
  },
  {
    id: '4',
    name: 'Ana Rodrigues',
    email: 'ana@educrm.com',
    role: 'Closer',
    team: 'Extension Team',
    performance: {
      leadsAssigned: 35,
      leadsConverted: 15,
      conversionRate: 43,
      revenue: 52500,
      callsToday: 10,
      meetingsScheduled: 4
    },
    status: 'away'
  },
  {
    id: '5',
    name: 'Carlos Silva',
    email: 'carlos@educrm.com',
    role: 'Senior Closer',
    team: 'EAD Team',
    performance: {
      leadsAssigned: 28,
      leadsConverted: 10,
      conversionRate: 36,
      revenue: 144000,
      callsToday: 9,
      meetingsScheduled: 6
    },
    status: 'online'
  }
];

export const mockFunnelMetrics: FunnelMetrics = {
  // Ad Spend (Facebook & Google Ads API)
  adSpendMeta: 15000,
  adSpendGoogle: 12000,
  
  // Traffic & Leads (Facebook & Google Ads API)
  landingPageVisits: 8500,
  leadsMeta: 450,
  leadsGoogle: 380,
  totalLeads: 830,
  landingPageConversion: 9.8,
  
  // CPL (Calculated from Ad Spend / Leads)
  cplMeta: 33.33,
  cplGoogle: 31.58,
  averageCPL: 32.53,
  
  // Contact & Response (WhatsApp Business API)
  contacted: 720,
  contactedPercentage: 86.7,
  responded: 432,
  responseRate: 60.0,
  
  // Meetings (Google Calendar API)
  meetingsScheduledManual: 180,
  meetingsScheduledAuto: 95,
  totalMeetingsScheduled: 275,
  responseToMeetingConversion: 63.7,
  leadToMeetingConversion: 33.1,
  
  // Meeting Execution (Google Meet API)
  meetingsHeld: 220,
  meetingsHeldPercentage: 80.0,
  leadToMeetingHeldConversion: 26.5,
  noShows: 55,
  
  // Sales (Lead Pipeline + Google Forms API)
  enrollments: 85,
  salesMeta: 65,
  salesOthers: 20,
  totalSales: 85,
  meetingToSaleConversion: 38.6,
  leadToSaleConversion: 10.2,
  
  // Revenue (Lead Pipeline Data)
  revenueContracted: 1275000,
  revenueBilled: 1020000,
  revenueNet: 918000,
  averageTicket: 15000
};

export const mockPerformanceData: PerformanceData[] = [
  {
    id: '1',
    closerId: '1',
    date: new Date('2024-01-15'),
    callDuration: 45,
    pitchAdherence: 85,
    objectionHandling: 90,
    closingTechnique: 80,
    overallScore: 85,
    leadId: '1',
    meetingType: 'discovery',
    outcome: 'scheduled',
    notes: 'Lead muito interessado, agendou apresentação para amanhã'
  },
  {
    id: '2',
    closerId: '2',
    date: new Date('2024-01-15'),
    callDuration: 32,
    pitchAdherence: 92,
    objectionHandling: 88,
    closingTechnique: 85,
    overallScore: 88,
    leadId: '2',
    meetingType: 'presentation',
    outcome: 'scheduled',
    notes: 'Apresentação bem sucedida, lead pediu proposta'
  },
  {
    id: '3',
    closerId: '3',
    date: new Date('2024-01-15'),
    callDuration: 28,
    pitchAdherence: 75,
    objectionHandling: 70,
    closingTechnique: 65,
    overallScore: 70,
    leadId: '3',
    meetingType: 'closing',
    outcome: 'objection',
    notes: 'Lead teve objeção de preço, precisa trabalhar valor'
  }
];

export const mockWhatsAppMessages: WhatsAppMessage[] = [
  {
    id: '1',
    leadId: '1',
    closerId: '1',
    message: 'Olá Fábio! Obrigado pelo interesse na nossa Pós-graduação. Quando podemos conversar?',
    timestamp: new Date('2024-01-15T10:30:00'),
    type: 'outgoing',
    status: 'read'
  },
  {
    id: '2',
    leadId: '1',
    closerId: '1',
    message: 'Oi! Posso falar agora sim. Tenho algumas dúvidas sobre o curso.',
    timestamp: new Date('2024-01-15T10:35:00'),
    type: 'incoming',
    status: 'read'
  },
  {
    id: '3',
    leadId: '2',
    closerId: '2',
    message: 'Carlos, conforme conversamos, segue o link para agendar sua apresentação: https://calendly.com/maria',
    timestamp: new Date('2024-01-15T14:20:00'),
    type: 'outgoing',
    status: 'delivered'
  }
];

export const mockFollowUpTasks: FollowUpTask[] = [
  {
    id: '1',
    leadId: '1',
    closerId: '1',
    title: 'Ligar para Fábio Ernani',
    description: 'Follow-up após interesse demonstrado na Pós-graduação',
    dueDate: new Date('2024-01-16T09:00:00'),
    priority: 'high',
    status: 'pending',
    type: 'call'
  },
  {
    id: '2',
    leadId: '2',
    closerId: '2',
    title: 'Enviar proposta para Carlos',
    description: 'Enviar proposta personalizada do MBA Executivo',
    dueDate: new Date('2024-01-17T10:00:00'),
    priority: 'urgent',
    status: 'pending',
    type: 'email'
  },
  {
    id: '3',
    leadId: '3',
    closerId: '3',
    title: 'Reunião com Fernanda',
    description: 'Apresentação do MBA Executivo',
    dueDate: new Date('2024-01-18T15:00:00'),
    priority: 'high',
    status: 'pending',
    type: 'meeting'
  }
];

// Legacy data for compatibility
export const mockContacts = [];
export const mockNotes = [];
export const mockReminders = [];