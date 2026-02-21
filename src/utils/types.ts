export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  course: string;
  source: string;
  value: number;
  columnId: string;
  assignedTo?: string;
  tags: string[];
  createdAt: Date;
  lastUpdated: Date;
  notes?: string;
  nextFollowUp?: Date;
  
  // Kommo-style fields
  company?: string;
  commercialPhone?: string;
  commercialEmail?: string;
  privateEmail?: string;
  otherEmail?: string;
  homeNumber?: string;
  state?: string;
  city?: string;
  address?: string;
  website?: string;
  
  // Sales fields
  saleValue?: number;
  product?: string;
  saleAmount?: number;
  enrollmentValue?: number;
  installments?: number;
  mec?: string;
  paymentMethod?: string;
  paymentStartMonth?: string;
  weekDay?: number;
  autoScheduled?: boolean;
  meetingDate?: Date;
  meetingTime?: string;
  contactorId?: string;
  meetingLink?: string;
  meetingDateTime?: Date;
  shift?: string;
  practitioner?: string;
  
  // Custom fields (dynamic)
  customFields?: Record<string, any>;
}

export interface KanbanColumn {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface Closer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  team: string;
  performance: {
    leadsAssigned: number;
    leadsConverted: number;
    conversionRate: number;
    revenue: number;
    callsToday: number;
    meetingsScheduled: number;
  };
  status: 'online' | 'busy' | 'away' | 'offline';
}

export interface PerformanceData {
  id: string;
  closerId: string;
  date: Date;
  callDuration: number;
  pitchAdherence: number;
  objectionHandling: number;
  closingTechnique: number;
  overallScore: number;
  leadId: string;
  meetingType: 'discovery' | 'presentation' | 'closing' | 'follow-up';
  outcome: 'scheduled' | 'closed' | 'objection' | 'no-show';
  notes: string;
}

export interface FunnelMetrics {
  // Ad Spend
  adSpendMeta: number;
  adSpendGoogle: number;
  
  // Traffic & Leads
  landingPageVisits: number;
  leadsMeta: number;
  leadsGoogle: number;
  totalLeads: number;
  landingPageConversion: number;
  
  // CPL (Cost Per Lead)
  cplMeta: number;
  cplGoogle: number;
  averageCPL: number;
  
  // Contact & Response
  contacted: number;
  contactedPercentage: number;
  responded: number;
  responseRate: number;
  
  // Meetings
  meetingsScheduledManual: number;
  meetingsScheduledAuto: number;
  totalMeetingsScheduled: number;
  responseToMeetingConversion: number;
  leadToMeetingConversion: number;
  
  // Meeting Execution
  meetingsHeld: number;
  meetingsHeldPercentage: number;
  leadToMeetingHeldConversion: number;
  noShows?: number;
  
  // Sales
  enrollments: number;
  salesMeta: number;
  salesOthers: number;
  totalSales: number;
  meetingToSaleConversion: number;
  leadToSaleConversion: number;
  
  // Revenue
  revenueContracted: number;
  revenueBilled: number;
  revenueNet: number;
  averageTicket: number;
}

// Field Configuration for Admin
export interface FieldConfig {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'datetime' | 'select' | 'boolean' | 'textarea';
  required: boolean;
  visible: boolean;
  order: number;
  options?: string[]; // For select fields
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface LeadCardConfig {
  id: string;
  name: string;
  fields: FieldConfig[];
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Data Types
export interface WhatsAppData {
  uniqueContactedLeads: number;
  uniqueRespondedLeads: number;
  totalMessages: number;
  totalCalls: number;
  responseTime: number;
  conversations: WhatsAppConversation[];
}

export interface WhatsAppConversation {
  leadId: string;
  closerId: string;
  messages: WhatsAppMessage[];
  lastActivity: Date;
  status: 'active' | 'responded' | 'no-response';
}

export interface WhatsAppMessage {
  id: string;
  leadId: string;
  closerId: string;
  message: string;
  timestamp: Date;
  type: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read';
  attachments?: string[];
}

export interface CalendarData {
  manuallyScheduled: number;
  autoScheduled: number;
  totalScheduled: number;
  meetings: CalendarMeeting[];
}

export interface CalendarMeeting {
  id: string;
  leadId: string;
  closerId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  status: 'scheduled' | 'live' | 'completed' | 'cancelled' | 'no-show';
  meetingLink?: string;
}

export interface MeetData {
  completedMeetings: number;
  noShows: number;
  totalScheduled: number;
  averageDuration: number;
  meetings: MeetingData[];
}

export interface MeetingData {
  id: string;
  calendarEventId: string;
  leadId: string;
  closerId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  attendeeJoined: boolean;
  closerJoined: boolean;
  recordingUrl?: string;
  transcription?: string;
  aiAnalysis?: {
    pitchAdherence: number;
    objectionHandling: number;
    closingTechnique: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    keyTopics: string[];
    nextSteps: string[];
  };
}

export interface FormsData {
  enrollments: number;
  formSubmissions: FormSubmission[];
}

export interface FormSubmission {
  id: string;
  formId: string;
  leadId?: string;
  submissionDate: Date;
  data: Record<string, any>;
  type: 'enrollment' | 'interest' | 'contact';
}

export interface FollowUpTask {
  id: string;
  leadId: string;
  closerId: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'overdue';
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'proposal';
}

export interface ScheduledMessage {
  id: string;
  leadId: string;
  closerId: string;
  message: string;
  scheduledDate: Date;
  type: 'whatsapp' | 'email' | 'sms';
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  createdAt: Date;
  sentAt?: Date;
}

// Legacy types for compatibility
export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  lastContact?: Date;
  nextReminder?: Date;
  tags: string[];
  notes: Note[];
  starred: boolean;
  metAt?: string;
  relationship: string;
  sentiment: 'positive' | 'neutral' | 'needs-attention';
}

export interface Note {
  id: string;
  contactId: string;
  content: string;
  date: Date;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'needs-attention';
  type: 'note' | 'call' | 'meeting' | 'email';
}

export interface Reminder {
  id: string;
  contactId: string;
  contactName: string;
  message: string;
  date: Date;
  completed: boolean;
}

// =====================================================
// MULTI-TENANT TYPES
// =====================================================

export interface Instance {
  id: string;
  name: string;
  slug: string;
  type: 'matriz' | 'franqueado';
  ownerId: string;
  status: 'active' | 'suspended' | 'inactive';
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstanceUser {
  id: string;
  instanceId: string;
  userId: string;
  role: UserRole;
  permissions: Record<string, boolean>;
  isActive: boolean;
  createdAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  MANAGER = 'manager',
  CLOSER = 'closer',
  VIEWER = 'viewer'
}

export interface InstancePermissions {
  canViewAllInstances: boolean;
  canCreateInstances: boolean;
  canManageUsers: boolean;
  canViewAllData: boolean;
  canSwitchInstances: boolean;
  canViewOwnInstance: boolean;
  canManageOwnUsers: boolean;
  canViewOwnData: boolean;
  canManageOwnLeads: boolean;
}

export interface InstanceContextType {
  currentInstance: Instance | null;
  availableInstances: Instance[];
  switchInstance: (instanceId: string) => Promise<void>;
  userRole: UserRole;
  permissions: InstancePermissions;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Extend existing types with instance_id
export interface LeadWithInstance extends Lead {
  instanceId: string;
}

export interface KanbanColumnWithInstance extends KanbanColumn {
  instanceId: string;
}

export interface FollowUpTaskWithInstance extends FollowUpTask {
  instanceId: string;
}

export interface ProfileWithInstance {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  instanceId: string;
  createdAt: Date;
  updatedAt: Date;
}