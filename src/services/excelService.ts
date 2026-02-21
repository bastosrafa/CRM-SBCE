import { supabase } from '../lib/supabase';

export interface ExcelImport {
  id: string;
  instance_id: string;
  filename: string;
  file_size: number;
  total_rows: number;
  processed_rows: number;
  error_rows: number;
  status: 'processing' | 'completed' | 'failed';
  mapping: Record<string, string>;
  errors: any[];
  created_by: string;
  created_at: string;
  completed_at?: string;
}

export interface ColumnMapping {
  excelColumn: string;
  leadField: string;
  required: boolean;
  transform?: (value: any) => any;
}

export interface LeadFromExcel {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source: 'excel';
  source_data: {
    import_id: string;
    filename: string;
    row_number: number;
    original_data: Record<string, any>;
  };
  auto_created: true;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  errorRows: number;
  errors: string[];
  leads: LeadFromExcel[];
}

class ExcelService {
  /**
   * Parse Excel file and return data
   */
  async parseExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Failed to read file'));
            return;
          }

          // For now, we'll use a simple CSV parser
          // In production, you'd want to use a proper Excel library like xlsx
          const text = typeof data === 'string' ? data : new TextDecoder().decode(data as ArrayBuffer);
          const rows = this.parseCSV(text);
          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      // Read as text for CSV, or as ArrayBuffer for Excel
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }

  /**
   * Parse CSV content
   */
  private parseCSV(csv: string): any[] {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      rows.push(row);
    }

    return rows;
  }

  /**
   * Create import record
   */
  async createImport(
    instanceId: string,
    filename: string,
    fileSize: number,
    mapping: Record<string, string>,
    createdBy: string
  ): Promise<ExcelImport | null> {
    try {
      const { data: importRecord, error } = await supabase
        .from('excel_imports')
        .insert({
          instance_id: instanceId,
          filename,
          file_size: fileSize,
          total_rows: 0, // Will be updated after parsing
          mapping,
          created_by: createdBy,
          status: 'processing',
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating import record:', error);
        return null;
      }

      console.log('✅ Import record created:', importRecord);
      return importRecord;
    } catch (error) {
      console.error('❌ Error creating import record:', error);
      return null;
    }
  }

  /**
   * Process Excel import
   */
  async processImport(
    importId: string,
    data: any[],
    mapping: ColumnMapping[]
  ): Promise<ImportResult> {
    try {
      const result: ImportResult = {
        success: true,
        totalRows: data.length,
        processedRows: 0,
        errorRows: 0,
        errors: [],
        leads: [],
      };

      // Update import record with total rows
      await supabase
        .from('excel_imports')
        .update({ total_rows: data.length })
        .eq('id', importId);

      // Process each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 1;

        try {
          const lead = await this.processRow(row, mapping, importId, rowNumber);
          if (lead) {
            result.leads.push(lead);
            result.processedRows++;
          } else {
            result.errorRows++;
            result.errors.push(`Row ${rowNumber}: Failed to process lead data`);
          }
        } catch (error) {
          result.errorRows++;
          result.errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Update import record with results
      await supabase
        .from('excel_imports')
        .update({
          processed_rows: result.processedRows,
          error_rows: result.errorRows,
          status: result.errorRows === 0 ? 'completed' : 'completed',
          errors: result.errors,
          completed_at: new Date().toISOString(),
        })
        .eq('id', importId);

      console.log('✅ Import processed:', result);
      return result;
    } catch (error) {
      console.error('❌ Error processing import:', error);
      
      // Update import record with error
      await supabase
        .from('excel_imports')
        .update({
          status: 'failed',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        })
        .eq('id', importId);

      return {
        success: false,
        totalRows: data.length,
        processedRows: 0,
        errorRows: data.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        leads: [],
      };
    }
  }

  /**
   * Process individual row
   */
  private async processRow(
    row: any,
    mapping: ColumnMapping[],
    importId: string,
    rowNumber: number
  ): Promise<LeadFromExcel | null> {
    try {
      const leadData: any = {};

      // Map columns according to mapping configuration
      for (const map of mapping) {
        const value = row[map.excelColumn];
        if (value !== undefined && value !== null && value !== '') {
          let transformedValue = value;
          
          // Apply transformation if provided
          if (map.transform) {
            transformedValue = map.transform(value);
          }

          leadData[map.leadField] = transformedValue;
        }
      }

      // Validate required fields
      const requiredMappings = mapping.filter(m => m.required);
      for (const map of requiredMappings) {
        if (!leadData[map.leadField]) {
          throw new Error(`Required field ${map.leadField} is missing`);
        }
      }

      // Create lead object
      const lead: LeadFromExcel = {
        name: leadData.name || `Lead ${rowNumber}`,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        source: 'excel',
        source_data: {
          import_id: importId,
          filename: 'imported_file.xlsx', // This should come from the import record
          row_number: rowNumber,
          original_data: row,
        },
        auto_created: true,
      };

      return lead;
    } catch (error) {
      console.error(`❌ Error processing row ${rowNumber}:`, error);
      return null;
    }
  }

  /**
   * Get import by ID
   */
  async getImport(importId: string): Promise<ExcelImport | null> {
    try {
      const { data: importRecord, error } = await supabase
        .from('excel_imports')
        .select('*')
        .eq('id', importId)
        .single();

      if (error) {
        console.error('❌ Error getting import:', error);
        return null;
      }

      return importRecord;
    } catch (error) {
      console.error('❌ Error getting import:', error);
      return null;
    }
  }

  /**
   * Get imports by instance
   */
  async getImportsByInstance(instanceId: string): Promise<ExcelImport[]> {
    try {
      const { data: imports, error } = await supabase
        .from('excel_imports')
        .select('*')
        .eq('instance_id', instanceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error getting imports:', error);
        return [];
      }

      return imports || [];
    } catch (error) {
      console.error('❌ Error getting imports:', error);
      return [];
    }
  }

  /**
   * Delete import
   */
  async deleteImport(importId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('excel_imports')
        .delete()
        .eq('id', importId);

      if (error) {
        console.error('❌ Error deleting import:', error);
        return false;
      }

      console.log('✅ Import deleted:', importId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting import:', error);
      return false;
    }
  }

  /**
   * Get default column mapping
   */
  getDefaultMapping(): ColumnMapping[] {
    return [
      {
        excelColumn: 'Nome',
        leadField: 'name',
        required: true,
      },
      {
        excelColumn: 'Email',
        leadField: 'email',
        required: false,
        transform: (value: any) => value?.toString().toLowerCase().trim(),
      },
      {
        excelColumn: 'Telefone',
        leadField: 'phone',
        required: false,
        transform: (value: any) => this.formatPhoneNumber(value?.toString()),
      },
      {
        excelColumn: 'Empresa',
        leadField: 'company',
        required: false,
      },
      {
        excelColumn: 'Name',
        leadField: 'name',
        required: true,
      },
      {
        excelColumn: 'E-mail',
        leadField: 'email',
        required: false,
        transform: (value: any) => value?.toString().toLowerCase().trim(),
      },
      {
        excelColumn: 'Phone',
        leadField: 'phone',
        required: false,
        transform: (value: any) => this.formatPhoneNumber(value?.toString()),
      },
      {
        excelColumn: 'Company',
        leadField: 'company',
        required: false,
      },
    ];
  }

  /**
   * Format phone number
   */
  private formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
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

  /**
   * Validate file type
   */
  validateFileType(file: File): boolean {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];
    
    const allowedExtensions = ['.xls', '.xlsx', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
  }

  /**
   * Get file size in MB
   */
  getFileSizeMB(file: File): number {
    return file.size / (1024 * 1024);
  }

  /**
   * Check if file is too large
   */
  isFileTooLarge(file: File, maxSizeMB: number = 10): boolean {
    return this.getFileSizeMB(file) > maxSizeMB;
  }
}

// Export singleton instance
export const excelService = new ExcelService();



