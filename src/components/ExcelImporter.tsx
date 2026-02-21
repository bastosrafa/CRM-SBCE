import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { excelService, ExcelImport, ColumnMapping } from '../services/excelService';
import { leadAutoCreationService } from '../services/leadAutoCreationService';
import { useInstance } from '../contexts/InstanceContext';

interface ExcelImporterProps {
  onImportComplete?: (result: any) => void;
}

const ExcelImporter: React.FC<ExcelImporterProps> = ({ onImportComplete }) => {
  const { currentInstance } = useInstance();
  const [imports, setImports] = useState<ExcelImport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'processing' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentInstance) {
      loadImports();
    }
  }, [currentInstance]);

  const loadImports = async () => {
    if (!currentInstance) return;

    try {
      setLoading(true);
      const importsData = await excelService.getImportsByInstance(currentInstance.id);
      setImports(importsData);
    } catch (err) {
      setError('Erro ao carregar importações');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!currentInstance) return;

    try {
      setError(null);
      setLoading(true);

      // Validate file type
      if (!excelService.validateFileType(file)) {
        setError('Tipo de arquivo não suportado. Use .xlsx, .xls ou .csv');
        return;
      }

      // Check file size
      if (excelService.isFileTooLarge(file, 10)) {
        setError('Arquivo muito grande. Máximo 10MB');
        return;
      }

      setSelectedFile(file);

      // Parse file
      const data = await excelService.parseExcelFile(file);
      setParsedData(data);

      // Set up default mapping
      const defaultMapping = excelService.getDefaultMapping();
      setColumnMapping(defaultMapping);

      setImportStep('mapping');
    } catch (err) {
      setError('Erro ao processar arquivo');
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleMappingChange = (index: number, field: keyof ColumnMapping, value: any) => {
    setColumnMapping(prev => prev.map((mapping, i) => 
      i === index ? { ...mapping, [field]: value } : mapping
    ));
  };

  const addMapping = () => {
    const newMapping: ColumnMapping = {
      excelColumn: '',
      leadField: 'name',
      required: false,
    };
    setColumnMapping(prev => [...prev, newMapping]);
  };

  const removeMapping = (index: number) => {
    setColumnMapping(prev => prev.filter((_, i) => i !== index));
  };

  const getAvailableColumns = () => {
    if (parsedData.length === 0) return [];
    return Object.keys(parsedData[0]);
  };

  const getLeadFields = () => [
    { value: 'name', label: 'Nome' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Telefone' },
    { value: 'company', label: 'Empresa' },
  ];

  const handleStartImport = async () => {
    if (!currentInstance || !selectedFile) return;

    try {
      setLoading(true);
      setImportStep('processing');

      // Create import record
      const importRecord = await excelService.createImport(
        currentInstance.id,
        selectedFile.name,
        selectedFile.size,
        columnMapping.reduce((acc, mapping) => {
          acc[mapping.excelColumn] = mapping.leadField;
          return acc;
        }, {} as Record<string, string>),
        'current_user_id' // This should come from auth context
      );

      if (!importRecord) {
        setError('Erro ao criar registro de importação');
        return;
      }

      // Process import
      const result = await excelService.processImport(importRecord.id, parsedData, columnMapping);
      
      if (result.success) {
        // Create leads
        const leadResult = await leadAutoCreationService.createLeadsFromExcel(
          result.leads,
          currentInstance.id
        );

        setImportResult({
          ...result,
          leadsCreated: leadResult.created,
          leadsFailed: leadResult.failed,
        });

        setImportStep('complete');
        onImportComplete?.(result);
        loadImports(); // Refresh imports list
      } else {
        setError('Erro ao processar importação');
        setImportStep('mapping');
      }
    } catch (err) {
      setError('Erro ao processar importação');
      setImportStep('mapping');
    } finally {
      setLoading(false);
    }
  };

  const resetImport = () => {
    setShowImportModal(false);
    setImportStep('upload');
    setSelectedFile(null);
    setParsedData([]);
    setColumnMapping([]);
    setImportResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'failed':
        return 'Falhou';
      case 'processing':
        return 'Processando';
      default:
        return 'Desconhecido';
    }
  };

  if (loading && imports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando importações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Importação de Excel
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Importe leads de arquivos Excel ou CSV
          </p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Importar Arquivo</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Imports List */}
      <div className="space-y-4">
        {imports.map((importRecord) => (
          <div key={importRecord.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(importRecord.status)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {importRecord.filename}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span>Status: {getStatusText(importRecord.status)}</span>
                    <span>•</span>
                    <span>Total: {importRecord.total_rows} linhas</span>
                    <span>•</span>
                    <span>Processadas: {importRecord.processed_rows}</span>
                    {importRecord.error_rows > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-red-600">Erros: {importRecord.error_rows}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Importado em {new Date(importRecord.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {importRecord.file_size > 1024 * 1024 
                    ? `${(importRecord.file_size / (1024 * 1024)).toFixed(1)} MB`
                    : `${(importRecord.file_size / 1024).toFixed(1)} KB`
                  }
                </span>
              </div>
            </div>
            
            {importRecord.errors && importRecord.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Erros encontrados:
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {importRecord.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {importRecord.errors.length > 5 && (
                    <li>• ... e mais {importRecord.errors.length - 5} erros</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Importar Arquivo Excel
                </h3>
                <button
                  onClick={resetImport}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Step 1: Upload */}
              {importStep === 'upload' && (
                <div className="space-y-6">
                  <div
                    onDrop={handleFileDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Arraste e solte seu arquivo aqui
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      ou clique para selecionar
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Selecionar Arquivo
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                      Formatos suportados: .xlsx, .xls, .csv (máximo 10MB)
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Mapping */}
              {importStep === 'mapping' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Mapear Colunas
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Defina qual coluna do Excel corresponde a cada campo do lead
                    </p>
                  </div>

                  <div className="space-y-4">
                    {columnMapping.map((mapping, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Coluna do Excel
                          </label>
                          <select
                            value={mapping.excelColumn}
                            onChange={(e) => handleMappingChange(index, 'excelColumn', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Selecione uma coluna</option>
                            {getAvailableColumns().map(column => (
                              <option key={column} value={column}>{column}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Campo do Lead
                          </label>
                          <select
                            value={mapping.leadField}
                            onChange={(e) => handleMappingChange(index, 'leadField', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          >
                            {getLeadFields().map(field => (
                              <option key={field.value} value={field.value}>{field.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={mapping.required}
                              onChange={(e) => handleMappingChange(index, 'required', e.target.checked)}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Obrigatório</span>
                          </label>
                        </div>
                        <button
                          onClick={() => removeMapping(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addMapping}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Adicionar Mapeamento</span>
                  </button>

                  <div className="flex items-center justify-end space-x-4">
                    <button
                      onClick={() => setImportStep('upload')}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleStartImport}
                      disabled={loading || columnMapping.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processando...' : 'Iniciar Importação'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Processing */}
              {importStep === 'processing' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Processando Importação
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Aguarde enquanto processamos seu arquivo...
                  </p>
                </div>
              )}

              {/* Step 4: Complete */}
              {importStep === 'complete' && importResult && (
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Importação Concluída!
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Seu arquivo foi processado com sucesso
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-4">
                      Resumo da Importação
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{importResult.totalRows}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total de Linhas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{importResult.processedRows}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Processadas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{importResult.errorRows}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Com Erro</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{importResult.leadsCreated || 0}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Leads Criados</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      onClick={resetImport}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelImporter;



