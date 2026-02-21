import { supabase } from '../lib/supabase';
import { LeadFromWhatsApp } from './whatsappService';
import { LeadFromForm } from './formService';
import { LeadFromExcel } from './excelService';

export type AutoLead = LeadFromWhatsApp | LeadFromForm | LeadFromExcel;

export interface LeadCreationResult {
  success: boolean;
  leadId?: string;
  error?: string;
}

class LeadAutoCreationService {
  /**
   * Create lead from any source
   */
  async createLeadFromSource(
    lead: AutoLead,
    instanceId: string,
    assignedTo?: string
  ): Promise<LeadCreationResult> {
    try {
      console.log('🔍 Creating lead from source:', lead);

      // Validate lead data
      const validation = this.validateLead(lead);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
        };
      }

      // Get the first column (usually "Contato Inicial")
      const { data: columns, error: columnsError } = await supabase
        .from('kanban_columns')
        .select('id')
        .eq('instance_id', instanceId)
        .order('order_index', { ascending: true })
        .limit(1);

      if (columnsError || !columns || columns.length === 0) {
        return {
          success: false,
          error: 'No columns found for instance',
        };
      }

      const columnId = columns[0].id;

      // Create lead in database
      const { data: createdLead, error: leadError } = await supabase
        .from('leads')
        .insert({
          name: lead.name,
          email: lead.email || null,
          phone: lead.phone || null,
          company: lead.company || null,
          source: lead.source,
          source_data: lead.source_data,
          auto_created: lead.auto_created,
          instance_id: instanceId,
          column_id: columnId,
          assigned_to: assignedTo || null,
          status: 'new',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (leadError) {
        console.error('❌ Error creating lead:', leadError);
        return {
          success: false,
          error: `Database error: ${leadError.message}`,
        };
      }

      console.log('✅ Lead created successfully:', createdLead);

      // Create follow-up task if it's a WhatsApp lead
      if (lead.source === 'whatsapp') {
        await this.createWhatsAppFollowUpTask(createdLead.id, instanceId, lead);
      }

      // Send notification if configured
      await this.sendNotification(createdLead, instanceId);

      return {
        success: true,
        leadId: createdLead.id,
      };
    } catch (error) {
      console.error('❌ Error creating lead from source:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create lead from WhatsApp message
   */
  async createLeadFromWhatsApp(
    lead: LeadFromWhatsApp,
    instanceId: string,
    assignedTo?: string
  ): Promise<LeadCreationResult> {
    return this.createLeadFromSource(lead, instanceId, assignedTo);
  }

  /**
   * Create lead from form submission
   */
  async createLeadFromForm(
    lead: LeadFromForm,
    instanceId: string,
    assignedTo?: string
  ): Promise<LeadCreationResult> {
    return this.createLeadFromSource(lead, instanceId, assignedTo);
  }

  /**
   * Create lead from Excel import
   */
  async createLeadFromExcel(
    lead: LeadFromExcel,
    instanceId: string,
    assignedTo?: string
  ): Promise<LeadCreationResult> {
    return this.createLeadFromSource(lead, instanceId, assignedTo);
  }

  /**
   * Create multiple leads from Excel import
   */
  async createLeadsFromExcel(
    leads: LeadFromExcel[],
    instanceId: string,
    assignedTo?: string
  ): Promise<{
    success: boolean;
    created: number;
    failed: number;
    errors: string[];
  }> {
    const result = {
      success: true,
      created: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      const creationResult = await this.createLeadFromExcel(lead, instanceId, assignedTo);
      
      if (creationResult.success) {
        result.created++;
      } else {
        result.failed++;
        result.errors.push(`Row ${i + 1}: ${creationResult.error}`);
      }
    }

    result.success = result.failed === 0;
    return result;
  }

  /**
   * Validate lead data
   */
  private validateLead(lead: AutoLead): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required fields
    if (!lead.name || lead.name.trim() === '') {
      errors.push('Name is required');
    }

    // Check source-specific requirements
    if (lead.source === 'whatsapp' && !lead.phone) {
      errors.push('Phone is required for WhatsApp leads');
    }

    if (lead.source === 'form' && !lead.email) {
      errors.push('Email is required for form leads');
    }

    // Validate email format if provided
    if (lead.email && !this.isValidEmail(lead.email)) {
      errors.push('Invalid email format');
    }

    // Validate phone format if provided
    if (lead.phone && !this.isValidPhone(lead.phone)) {
      errors.push('Invalid phone format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-+()]+$/;
    return phoneRegex.test(phone);
  }

  /**
   * Create follow-up task for WhatsApp lead
   */
  private async createWhatsAppFollowUpTask(
    leadId: string,
    instanceId: string,
    lead: LeadFromWhatsApp
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('follow_up_tasks')
        .insert({
          lead_id: leadId,
          instance_id: instanceId,
          title: 'Contato inicial via WhatsApp',
          description: `Lead criado automaticamente via WhatsApp. Mensagem: "${lead.source_data.message}"`,
          type: 'call',
          priority: 'medium',
          status: 'pending',
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('❌ Error creating follow-up task:', error);
      } else {
        console.log('✅ Follow-up task created for WhatsApp lead');
      }
    } catch (error) {
      console.error('❌ Error creating follow-up task:', error);
    }
  }

  /**
   * Send notification about new lead
   */
  private async sendNotification(
    lead: any,
    instanceId: string
  ): Promise<void> {
    try {
      // Get instance users to notify
      const { data: users, error: usersError } = await supabase
        .from('instance_users')
        .select(`
          user_id,
          role,
          profiles (
            email,
            name
          )
        `)
        .eq('instance_id', instanceId)
        .eq('is_active', true);

      if (usersError || !users) {
        console.error('❌ Error getting users for notification:', usersError);
        return;
      }

      // For now, just log the notification
      // In production, you'd send email, push notification, etc.
      console.log('🔔 New lead notification:', {
        lead: lead.name,
        source: lead.source,
        instanceId,
        users: users.length,
      });

      // TODO: Implement actual notification sending
      // - Email notification
      // - Push notification
      // - Slack/Discord webhook
      // - WhatsApp notification to assigned user

    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  }

  /**
   * Get lead statistics by source
   */
  async getLeadStatsBySource(instanceId: string): Promise<{
    total: number;
    bySource: Record<string, number>;
    autoCreated: number;
    manual: number;
  }> {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('source, auto_created')
        .eq('instance_id', instanceId);

      if (error) {
        console.error('❌ Error getting lead stats:', error);
        return {
          total: 0,
          bySource: {},
          autoCreated: 0,
          manual: 0,
        };
      }

      const stats = {
        total: leads?.length || 0,
        bySource: {} as Record<string, number>,
        autoCreated: 0,
        manual: 0,
      };

      leads?.forEach(lead => {
        // Count by source
        stats.bySource[lead.source] = (stats.bySource[lead.source] || 0) + 1;
        
        // Count auto vs manual
        if (lead.auto_created) {
          stats.autoCreated++;
        } else {
          stats.manual++;
        }
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting lead stats:', error);
      return {
        total: 0,
        bySource: {},
        autoCreated: 0,
        manual: 0,
      };
    }
  }

  /**
   * Get recent auto-created leads
   */
  async getRecentAutoLeads(instanceId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('instance_id', instanceId)
        .eq('auto_created', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error getting recent auto leads:', error);
        return [];
      }

      return leads || [];
    } catch (error) {
      console.error('❌ Error getting recent auto leads:', error);
      return [];
    }
  }
}

// Export singleton instance
export const leadAutoCreationService = new LeadAutoCreationService();



