import { supabase } from '../lib/supabase';

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: string;
  };
}

export interface FormConfig {
  id: string;
  name: string;
  instance_id: string;
  fields: FormField[];
  settings: {
    title: string;
    description?: string;
    submitText: string;
    successMessage: string;
    redirectUrl?: string;
    emailNotification?: boolean;
    emailTo?: string;
    autoAssign?: boolean;
    assignTo?: string;
  };
  embed_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  lead_id?: string;
  data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface LeadFromForm {
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: 'form';
  source_data: {
    form_id: string;
    form_name: string;
    submission_data: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
  };
  auto_created: true;
}

class FormService {
  /**
   * Create new form
   */
  async createForm(
    instanceId: string,
    name: string,
    fields: FormField[],
    settings: FormConfig['settings']
  ): Promise<FormConfig | null> {
    try {
      // Generate embed code
      const embedCode = this.generateEmbedCode(instanceId, fields, settings);

      const { data: form, error } = await supabase
        .from('forms')
        .insert({
          name,
          instance_id: instanceId,
          fields,
          settings,
          embed_code: embedCode,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating form:', error);
        return null;
      }

      console.log('✅ Form created:', form);
      return form;
    } catch (error) {
      console.error('❌ Error creating form:', error);
      return null;
    }
  }

  /**
   * Get form by ID
   */
  async getForm(formId: string): Promise<FormConfig | null> {
    try {
      const { data: form, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Error getting form:', error);
        return null;
      }

      return form;
    } catch (error) {
      console.error('❌ Error getting form:', error);
      return null;
    }
  }

  /**
   * Get forms by instance
   */
  async getFormsByInstance(instanceId: string): Promise<FormConfig[]> {
    try {
      const { data: forms, error } = await supabase
        .from('forms')
        .select('*')
        .eq('instance_id', instanceId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error getting forms:', error);
        return [];
      }

      return forms || [];
    } catch (error) {
      console.error('❌ Error getting forms:', error);
      return [];
    }
  }

  /**
   * Update form
   */
  async updateForm(
    formId: string,
    updates: Partial<Pick<FormConfig, 'name' | 'fields' | 'settings' | 'is_active'>>
  ): Promise<FormConfig | null> {
    try {
      // If fields or settings changed, regenerate embed code
      if (updates.fields || updates.settings) {
        const form = await this.getForm(formId);
        if (form) {
          updates.embed_code = this.generateEmbedCode(
            form.instance_id,
            updates.fields || form.fields,
            updates.settings || form.settings
          );
        }
      }

      const { data: form, error } = await supabase
        .from('forms')
        .update(updates)
        .eq('id', formId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating form:', error);
        return null;
      }

      console.log('✅ Form updated:', form);
      return form;
    } catch (error) {
      console.error('❌ Error updating form:', error);
      return null;
    }
  }

  /**
   * Delete form
   */
  async deleteForm(formId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('forms')
        .update({ is_active: false })
        .eq('id', formId);

      if (error) {
        console.error('❌ Error deleting form:', error);
        return false;
      }

      console.log('✅ Form deleted:', formId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting form:', error);
      return false;
    }
  }

  /**
   * Process form submission
   */
  async processSubmission(
    formId: string,
    data: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<FormSubmission | null> {
    try {
      // Get form configuration
      const form = await this.getForm(formId);
      if (!form) {
        console.error('❌ Form not found:', formId);
        return null;
      }

      // Validate submission data
      const validationResult = this.validateSubmission(data, form.fields);
      if (!validationResult.isValid) {
        console.error('❌ Form validation failed:', validationResult.errors);
        return null;
      }

      // Create submission record
      const { data: submission, error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          form_id: formId,
          data,
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .select()
        .single();

      if (submissionError) {
        console.error('❌ Error creating submission:', submissionError);
        return null;
      }

      console.log('✅ Form submission processed:', submission);
      return submission;
    } catch (error) {
      console.error('❌ Error processing form submission:', error);
      return null;
    }
  }

  /**
   * Create lead from form submission
   */
  async createLeadFromSubmission(submission: FormSubmission): Promise<LeadFromForm | null> {
    try {
      const form = await this.getForm(submission.form_id);
      if (!form) {
        console.error('❌ Form not found for submission:', submission.form_id);
        return null;
      }

      // Extract lead data from submission
      const leadData = this.extractLeadData(submission.data, form.fields);

      const lead: LeadFromForm = {
        name: leadData.name || 'Lead Form',
        email: leadData.email || '',
        phone: leadData.phone || '',
        company: leadData.company,
        source: 'form',
        source_data: {
          form_id: submission.form_id,
          form_name: form.name,
          submission_data: submission.data,
          ip_address: submission.ip_address,
          user_agent: submission.user_agent,
        },
        auto_created: true,
      };

      console.log('✅ Lead created from form:', lead);
      return lead;
    } catch (error) {
      console.error('❌ Error creating lead from form:', error);
      return null;
    }
  }

  /**
   * Generate embed code for form
   */
  private generateEmbedCode(instanceId: string, fields: FormField[], settings: FormConfig['settings']): string {
    const formId = `form_${Date.now()}`;
    const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/forms/submit`;
    
    const fieldsHtml = fields.map(field => this.generateFieldHtml(field)).join('\n');
    
    return `
<!-- SBCE CRM Form - ${settings.title} -->
<div id="${formId}" class="sbce-form">
  <form id="${formId}_form" action="${apiUrl}" method="POST">
    <input type="hidden" name="form_id" value="${formId}">
    <input type="hidden" name="instance_id" value="${instanceId}">
    
    <div class="sbce-form-header">
      <h3>${settings.title}</h3>
      ${settings.description ? `<p>${settings.description}</p>` : ''}
    </div>
    
    <div class="sbce-form-fields">
      ${fieldsHtml}
    </div>
    
    <div class="sbce-form-actions">
      <button type="submit" class="sbce-btn sbce-btn-primary">
        ${settings.submitText}
      </button>
    </div>
  </form>
  
  <div id="${formId}_message" class="sbce-form-message" style="display: none;"></div>
</div>

<style>
.sbce-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: Arial, sans-serif;
}

.sbce-form-header h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.sbce-form-fields {
  margin: 20px 0;
}

.sbce-form-field {
  margin-bottom: 15px;
}

.sbce-form-field label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.sbce-form-field input,
.sbce-form-field textarea,
.sbce-form-field select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.sbce-form-field input:focus,
.sbce-form-field textarea:focus,
.sbce-form-field select:focus {
  outline: none;
  border-color: #007bff;
}

.sbce-form-actions {
  text-align: center;
}

.sbce-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sbce-btn-primary {
  background-color: #007bff;
  color: white;
}

.sbce-btn-primary:hover {
  background-color: #0056b3;
}

.sbce-form-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.sbce-form-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.sbce-form-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('${formId}_form');
  const messageDiv = document.getElementById('${formId}_message');
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const response = await fetch('${apiUrl}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        messageDiv.innerHTML = '${settings.successMessage}';
        messageDiv.className = 'sbce-form-message success';
        messageDiv.style.display = 'block';
        form.reset();
        
        ${settings.redirectUrl ? `setTimeout(() => { window.location.href = '${settings.redirectUrl}'; }, 2000);` : ''}
      } else {
        throw new Error(result.error || 'Erro ao enviar formulário');
      }
    } catch (error) {
      messageDiv.innerHTML = 'Erro ao enviar formulário. Tente novamente.';
      messageDiv.className = 'sbce-form-message error';
      messageDiv.style.display = 'block';
    }
  });
});
</script>
<!-- End SBCE CRM Form -->`;
  }

  /**
   * Generate HTML for form field
   */
  private generateFieldHtml(field: FormField): string {
    const fieldId = `field_${field.id}`;
    const required = field.required ? 'required' : '';
    
    switch (field.type) {
      case 'textarea':
        return `
          <div class="sbce-form-field">
            <label for="${fieldId}">${field.label}${field.required ? ' *' : ''}</label>
            <textarea 
              id="${fieldId}" 
              name="${field.name}" 
              placeholder="${field.placeholder || ''}"
              ${required}
              ${field.validation?.minLength ? `minlength="${field.validation.minLength}"` : ''}
              ${field.validation?.maxLength ? `maxlength="${field.validation.maxLength}"` : ''}
            ></textarea>
          </div>
        `;
        
      case 'select': {
        const options = field.options?.map(option => 
          `<option value="${option}">${option}</option>`
        ).join('') || '';
        return `
          <div class="sbce-form-field">
            <label for="${fieldId}">${field.label}${field.required ? ' *' : ''}</label>
            <select id="${fieldId}" name="${field.name}" ${required}>
              <option value="">Selecione...</option>
              ${options}
            </select>
          </div>
        `;
      }
        
      case 'checkbox': {
        const checkboxes = field.options?.map(option => 
          `<label><input type="checkbox" name="${field.name}[]" value="${option}"> ${option}</label>`
        ).join('<br>') || '';
        return `
          <div class="sbce-form-field">
            <label>${field.label}${field.required ? ' *' : ''}</label>
            ${checkboxes}
          </div>
        `;
      }
        
      case 'radio': {
        const radios = field.options?.map(option => 
          `<label><input type="radio" name="${field.name}" value="${option}"> ${option}</label>`
        ).join('<br>') || '';
        return `
          <div class="sbce-form-field">
            <label>${field.label}${field.required ? ' *' : ''}</label>
            ${radios}
          </div>
        `;
      }
        
      default:
        return `
          <div class="sbce-form-field">
            <label for="${fieldId}">${field.label}${field.required ? ' *' : ''}</label>
            <input 
              type="${field.type}" 
              id="${fieldId}" 
              name="${field.name}" 
              placeholder="${field.placeholder || ''}"
              ${required}
              ${field.validation?.minLength ? `minlength="${field.validation.minLength}"` : ''}
              ${field.validation?.maxLength ? `maxlength="${field.validation.maxLength}"` : ''}
              ${field.validation?.pattern ? `pattern="${field.validation.pattern}"` : ''}
            />
          </div>
        `;
    }
  }

  /**
   * Validate form submission
   */
  private validateSubmission(data: Record<string, any>, fields: FormField[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const field of fields) {
      const value = data[field.name];
      
      // Check required fields
      if (field.required && (!value || value.toString().trim() === '')) {
        errors.push(`${field.label} é obrigatório`);
        continue;
      }

      // Skip validation if field is empty and not required
      if (!value || value.toString().trim() === '') {
        continue;
      }

      // Type-specific validation
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${field.label} deve ser um email válido`);
        }
      }

      if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-+()]+$/;
        if (!phoneRegex.test(value)) {
          errors.push(`${field.label} deve ser um telefone válido`);
        }
      }

      // Length validation
      if (field.validation?.minLength && value.length < field.validation.minLength) {
        errors.push(`${field.label} deve ter pelo menos ${field.validation.minLength} caracteres`);
      }

      if (field.validation?.maxLength && value.length > field.validation.maxLength) {
        errors.push(`${field.label} deve ter no máximo ${field.validation.maxLength} caracteres`);
      }

      // Pattern validation
      if (field.validation?.pattern && value) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          errors.push(`${field.label} tem formato inválido`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Extract lead data from form submission
   */
  private extractLeadData(data: Record<string, any>, fields: FormField[]): {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  } {
    const result: any = {};

    // Map common field names to lead properties
    const fieldMapping: Record<string, string> = {
      'name': 'name',
      'nome': 'name',
      'full_name': 'name',
      'email': 'email',
      'e-mail': 'email',
      'phone': 'phone',
      'telefone': 'phone',
      'celular': 'phone',
      'company': 'company',
      'empresa': 'company',
      'organizacao': 'company',
    };

    for (const field of fields) {
      const value = data[field.name];
      if (value) {
        const mappedField = fieldMapping[field.name.toLowerCase()];
        if (mappedField) {
          result[mappedField] = value;
        }
      }
    }

    return result;
  }
}

// Export singleton instance
export const formService = new FormService();

