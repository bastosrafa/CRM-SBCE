import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Eye, Save, Settings } from 'lucide-react';
import { formService, FormConfig, FormField } from '../services/formService';
import { useInstance } from '../contexts/InstanceContext';

interface FormGeneratorProps {
  onFormCreated?: (form: FormConfig) => void;
  onFormUpdated?: (form: FormConfig) => void;
}

const FormGenerator: React.FC<FormGeneratorProps> = ({ onFormCreated, onFormUpdated }) => {
  const { currentInstance } = useInstance();
  const [forms, setForms] = useState<FormConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingForm, setEditingForm] = useState<FormConfig | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewForm, setPreviewForm] = useState<FormConfig | null>(null);

  // Form creation state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    submitText: 'Enviar',
    successMessage: 'Obrigado! Seu formulário foi enviado com sucesso.',
    redirectUrl: '',
    emailNotification: false,
    emailTo: '',
    autoAssign: false,
    assignTo: '',
  });

  const [fields, setFields] = useState<FormField[]>([
    {
      id: '1',
      name: 'name',
      type: 'text',
      label: 'Nome',
      placeholder: 'Digite seu nome',
      required: true,
    },
    {
      id: '2',
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'Digite seu email',
      required: true,
    },
    {
      id: '3',
      name: 'phone',
      type: 'tel',
      label: 'Telefone',
      placeholder: 'Digite seu telefone',
      required: false,
    },
  ]);

  useEffect(() => {
    if (currentInstance) {
      loadForms();
    }
  }, [currentInstance]);

  const loadForms = async () => {
    if (!currentInstance) return;

    try {
      setLoading(true);
      const formsData = await formService.getFormsByInstance(currentInstance.id);
      setForms(formsData);
    } catch (err) {
      setError('Erro ao carregar formulários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async () => {
    if (!currentInstance) return;

    try {
      setLoading(true);
      setError(null);

      const form = await formService.createForm(
        currentInstance.id,
        formData.name,
        fields,
        {
          title: formData.title,
          description: formData.description,
          submitText: formData.submitText,
          successMessage: formData.successMessage,
          redirectUrl: formData.redirectUrl,
          emailNotification: formData.emailNotification,
          emailTo: formData.emailTo,
          autoAssign: formData.autoAssign,
          assignTo: formData.assignTo,
        }
      );

      if (form) {
        setForms(prev => [form, ...prev]);
        setShowCreateForm(false);
        resetForm();
        onFormCreated?.(form);
      } else {
        setError('Erro ao criar formulário');
      }
    } catch (err) {
      setError('Erro ao criar formulário');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateForm = async () => {
    if (!editingForm || !currentInstance) return;

    try {
      setLoading(true);
      setError(null);

      const updatedForm = await formService.updateForm(editingForm.id, {
        name: formData.name,
        fields,
        settings: {
          title: formData.title,
          description: formData.description,
          submitText: formData.submitText,
          successMessage: formData.successMessage,
          redirectUrl: formData.redirectUrl,
          emailNotification: formData.emailNotification,
          emailTo: formData.emailTo,
          autoAssign: formData.autoAssign,
          assignTo: formData.assignTo,
        },
      });

      if (updatedForm) {
        setForms(prev => prev.map(f => f.id === updatedForm.id ? updatedForm : f));
        setEditingForm(null);
        resetForm();
        onFormUpdated?.(updatedForm);
      } else {
        setError('Erro ao atualizar formulário');
      }
    } catch (err) {
      setError('Erro ao atualizar formulário');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Tem certeza que deseja excluir este formulário?')) return;

    try {
      const success = await formService.deleteForm(formId);
      if (success) {
        setForms(prev => prev.filter(f => f.id !== formId));
      } else {
        setError('Erro ao excluir formulário');
      }
    } catch (err) {
      setError('Erro ao excluir formulário');
    }
  };

  const handleEditForm = (form: FormConfig) => {
    setEditingForm(form);
    setFormData({
      name: form.name,
      title: form.settings.title,
      description: form.settings.description || '',
      submitText: form.settings.submitText,
      successMessage: form.settings.successMessage,
      redirectUrl: form.settings.redirectUrl || '',
      emailNotification: form.settings.emailNotification || false,
      emailTo: form.settings.emailTo || '',
      autoAssign: form.settings.autoAssign || false,
      assignTo: form.settings.assignTo || '',
    });
    setFields(form.fields);
    setShowCreateForm(true);
  };

  const handlePreviewForm = (form: FormConfig) => {
    setPreviewForm(form);
    setShowPreview(true);
  };

  const handleCopyEmbedCode = (form: FormConfig) => {
    navigator.clipboard.writeText(form.embed_code);
    // You could add a toast notification here
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      description: '',
      submitText: 'Enviar',
      successMessage: 'Obrigado! Seu formulário foi enviado com sucesso.',
      redirectUrl: '',
      emailNotification: false,
      emailTo: '',
      autoAssign: false,
      assignTo: '',
    });
    setFields([
      {
        id: '1',
        name: 'name',
        type: 'text',
        label: 'Nome',
        placeholder: 'Digite seu nome',
        required: true,
      },
      {
        id: '2',
        name: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'Digite seu email',
        required: true,
      },
      {
        id: '3',
        name: 'phone',
        type: 'tel',
        label: 'Telefone',
        placeholder: 'Digite seu telefone',
        required: false,
      },
    ]);
  };

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: `field_${Date.now()}`,
      type: 'text',
      label: 'Novo Campo',
      placeholder: 'Digite aqui',
      required: false,
    };
    setFields(prev => [...prev, newField]);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const removeField = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
  };

  const getFieldTypeOptions = () => [
    { value: 'text', label: 'Texto' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Telefone' },
    { value: 'textarea', label: 'Texto Longo' },
    { value: 'select', label: 'Seleção' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio' },
  ];

  if (loading && forms.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando formulários...</p>
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
            Gerador de Formulários
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Crie formulários para suas landing pages
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Formulário</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Forms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div key={form.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {form.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {form.fields.length} campos
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePreviewForm(form)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  title="Visualizar"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditForm(form)}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                  title="Editar"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopyEmbedCode(form)}
                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                  title="Copiar Código"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteForm(form.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Título:</strong> {form.settings.title}
              </p>
              {form.settings.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Descrição:</strong> {form.settings.description}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Criado:</strong> {new Date(form.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingForm ? 'Editar Formulário' : 'Criar Formulário'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingForm(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Form Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome do Formulário
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Ex: Formulário de Contato"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Ex: Entre em Contato"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Descrição do formulário (opcional)"
                  />
                </div>

                {/* Fields */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      Campos do Formulário
                    </h4>
                    <button
                      onClick={addField}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Campo</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field) => (
                      <div key={field.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Nome do Campo
                            </label>
                            <input
                              type="text"
                              value={field.name}
                              onChange={(e) => updateField(field.id, { name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Tipo
                            </label>
                            <select
                              value={field.type}
                              onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                              {getFieldTypeOptions().map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Label
                            </label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => removeField(field.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Placeholder
                            </label>
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Obrigatório</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingForm(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editingForm ? handleUpdateForm : handleCreateForm}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingForm ? 'Atualizar' : 'Criar'} Formulário</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Preview do Formulário
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div dangerouslySetInnerHTML={{ __html: previewForm.embed_code }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormGenerator;



