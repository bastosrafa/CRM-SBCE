import { supabase } from '../lib/supabase';

export interface WhatsAppInstance {
  id: string;
  instance_id: string;
  phone_number: string;
  evolution_manager_url: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EvolutionManagerConfig {
  baseUrl: string;
  token: string;
  defaultChannel: string;
}

export interface CreateInstanceRequest {
  name: string;
  phoneNumber: string;
  channel: string;
  baseUrl: string;
  token: string;
}

export interface WhatsAppMessage {
  from: string;
  to: string;
  message: string;
  timestamp: string;
  messageId?: string;
  type?: 'text' | 'image' | 'document' | 'audio' | 'video';
}

export interface LeadFromWhatsApp {
  name: string;
  phone: string;
  source: 'whatsapp';
  source_data: {
    message: string;
    timestamp: string;
    phone_number: string;
    instance_id: string;
  };
  auto_created: true;
}

class WhatsAppService {
  private baseUrl: string;
  private apiKey: string;

  constructor(evolutionManagerUrl: string, apiKey: string) {
    this.baseUrl = evolutionManagerUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  /**
   * Send message via Evolution Manager
   */
  async sendMessage(to: string, message: string, instanceName?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/message/sendText/${instanceName || 'default'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({
          number: to,
          text: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ WhatsApp message sent:', result);
      return true;
    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Send media message (image, document, etc.)
   */
  async sendMedia(to: string, mediaUrl: string, caption?: string, instanceName?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/message/sendMedia/${instanceName || 'default'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({
          number: to,
          media: mediaUrl,
          caption: caption || '',
        }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ WhatsApp media sent:', result);
      return true;
    } catch (error) {
      console.error('❌ Error sending WhatsApp media:', error);
      return false;
    }
  }

  /**
   * Get instance status
   */
  async getInstanceStatus(instanceName?: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/connectionState/${instanceName || 'default'}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error getting instance status:', error);
      return null;
    }
  }

  /**
   * Create QR code for instance
   */
  async createQRCode(instanceName?: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/connect/${instanceName || 'default'}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.base64 || result.qrcode || null;
    } catch (error) {
      console.error('❌ Error creating QR code:', error);
      return null;
    }
  }

  /**
   * Process incoming WhatsApp message and create lead
   */
  async processIncomingMessage(message: WhatsAppMessage, instanceId: string): Promise<LeadFromWhatsApp | null> {
    try {
      // Extract name from message or use phone number
      const name = this.extractNameFromMessage(message.message) || 
                   this.formatPhoneNumber(message.from) || 
                   'Lead WhatsApp';

      const lead: LeadFromWhatsApp = {
        name,
        phone: this.formatPhoneNumber(message.from),
        source: 'whatsapp',
        source_data: {
          message: message.message,
          timestamp: message.timestamp,
          phone_number: message.from,
          instance_id: instanceId,
        },
        auto_created: true,
      };

      console.log('✅ Lead created from WhatsApp:', lead);
      return lead;
    } catch (error) {
      console.error('❌ Error processing WhatsApp message:', error);
      return null;
    }
  }

  /**
   * Extract name from message content
   */
  private extractNameFromMessage(message: string): string | null {
    // Simple name extraction patterns
    const patterns = [
      /meu nome é\s+([a-zA-Z\s]+)/i,
      /sou o\s+([a-zA-Z\s]+)/i,
      /sou a\s+([a-zA-Z\s]+)/i,
      /chamo-me\s+([a-zA-Z\s]+)/i,
      /sou\s+([a-zA-Z\s]+)/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Format phone number to Brazilian format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if missing
    if (cleaned.length === 11 && cleaned.startsWith('11')) {
      return `+55${cleaned}`;
    } else if (cleaned.length === 10) {
      return `+5511${cleaned}`;
    } else if (cleaned.length === 13 && cleaned.startsWith('55')) {
      return `+${cleaned}`;
    }
    
    return `+${cleaned}`;
  }
}

/**
 * WhatsApp Service Manager - Manages multiple instances
 */
export class WhatsAppServiceManager {
  private instances: Map<string, WhatsAppService> = new Map();

  /**
   * Add WhatsApp instance
   */
  async addInstance(instance: WhatsAppInstance): Promise<void> {
    const service = new WhatsAppService(
      instance.evolution_manager_url,
      instance.api_key
    );
    
    this.instances.set(instance.id, service);
    console.log(`✅ WhatsApp instance added: ${instance.phone_number}`);
  }

  /**
   * Get WhatsApp instance
   */
  getInstance(instanceId: string): WhatsAppService | null {
    return this.instances.get(instanceId) || null;
  }

  /**
   * Remove WhatsApp instance
   */
  removeInstance(instanceId: string): void {
    this.instances.delete(instanceId);
    console.log(`✅ WhatsApp instance removed: ${instanceId}`);
  }

  /**
   * Load instances from database
   */
  async loadInstancesFromDatabase(instanceId: string): Promise<void> {
    try {
      const { data: whatsappInstances, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('instance_id', instanceId)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error loading WhatsApp instances:', error);
        return;
      }

      for (const instance of whatsappInstances || []) {
        await this.addInstance(instance);
      }

      console.log(`✅ Loaded ${whatsappInstances?.length || 0} WhatsApp instances`);
    } catch (error) {
      console.error('❌ Error loading WhatsApp instances from database:', error);
    }
  }

  /**
   * Send message to specific instance
   */
  async sendMessage(instanceId: string, to: string, message: string): Promise<boolean> {
    const service = this.getInstance(instanceId);
    if (!service) {
      console.error('❌ WhatsApp instance not found:', instanceId);
      return false;
    }

    return await service.sendMessage(to, message);
  }

  /**
   * Process incoming message for specific instance
   */
  async processIncomingMessage(instanceId: string, message: WhatsAppMessage): Promise<LeadFromWhatsApp | null> {
    const service = this.getInstance(instanceId);
    if (!service) {
      console.error('❌ WhatsApp instance not found:', instanceId);
      return null;
    }

    return await service.processIncomingMessage(message, instanceId);
  }
}

// Export singleton instance
export const whatsappManager = new WhatsAppServiceManager();
