import React, { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Mic, 
  Upload, 
  FileText, 
  Database, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  Search, 
  BarChart3,
  Target,
  CheckCircle,
  BookOpen,
  Zap,
  Activity,
  RefreshCw
} from 'lucide-react';
import { PerformanceData, Closer } from '../utils/types';

interface AIPerformanceProps {
  performanceData: PerformanceData[];
  closers: Closer[];
}

interface Script {
  id: string;
  name: string;
  type: 'discovery' | 'presentation' | 'objection' | 'closing' | 'follow-up';
  content: string;
  keywords: string[];
  expectedOutcomes: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  version: string;
}

interface SchoolDatabase {
  id: string;
  name: string;
  description: string;
  courses: Course[];
  uploadedAt: Date;
  fileSize: number;
  recordCount: number;
}

interface Course {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  description: string;
  benefits: string[];
  targetAudience: string[];
  prerequisites: string[];
}

interface AIAnalysis {
  id: string;
  closerId: string;
  meetingId: string;
  date: Date;
  scriptAdherence: number;
  objectionHandling: number;
  keywordUsage: number;
  sentimentScore: number;
  talkTimeRatio: number;
  outcome: string;
  improvements: string[];
  strengths: string[];
  transcript: string;
}

const AIPerformance: React.FC<AIPerformanceProps> = ({ performanceData, closers }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'scripts' | 'database' | 'analysis'>('overview');
  const [scripts, setScripts] = useState<Script[]>([]);
  const [databases, setDatabases] = useState<SchoolDatabase[]>([]);
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [isUploadingScript, setIsUploadingScript] = useState(false);
  const [isUploadingDatabase, setIsUploadingDatabase] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Mock data initialization
  React.useEffect(() => {
    const mockScripts: Script[] = [
      {
        id: '1',
        name: 'Script de Descoberta - MBA',
        type: 'discovery',
        content: `
# Script de Descoberta - MBA Executivo

## Abertura (30 segundos)
- Olá [NOME], como está? Obrigado por estar aqui hoje!
- Estou muito animado para conhecer mais sobre você e seus objetivos profissionais.

## Descoberta de Necessidades (5-7 minutos)
1. **Situação Atual**
   - Me conta um pouco sobre sua trajetória profissional
   - Qual sua posição atual na empresa?
   - Há quanto tempo está nessa função?

2. **Desafios e Dores**
   - Quais são os principais desafios que você enfrenta no dia a dia?
   - O que te impede de alcançar o próximo nível na carreira?
   - Como você se sente em relação ao seu crescimento profissional?

3. **Objetivos e Sonhos**
   - Onde você se vê daqui a 2-3 anos?
   - Qual seria sua posição ideal?
   - O que significaria para você alcançar esse objetivo?

## Palavras-chave importantes
- Crescimento profissional
- Liderança
- Networking
- Mercado competitivo
- Diferencial
        `,
        keywords: ['crescimento', 'liderança', 'networking', 'carreira', 'objetivos'],
        expectedOutcomes: ['Identificar dores', 'Mapear objetivos', 'Criar conexão'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15'),
        isActive: true,
        version: '2.1'
      },
      {
        id: '2',
        name: 'Script de Apresentação - Pós-Graduação',
        type: 'presentation',
        content: `
# Script de Apresentação - Pós-Graduação

## Introdução (1 minuto)
- Baseado no que você me contou sobre [RESUMIR NECESSIDADES]
- Vou te mostrar como nossa Pós-Graduação pode te ajudar a alcançar [OBJETIVO ESPECÍFICO]

## Apresentação da Solução (8-10 minutos)
1. **Metodologia Exclusiva**
   - Professores com experiência de mercado
   - Cases reais de empresas líderes
   - Networking com executivos

2. **Benefícios Específicos**
   - [CONECTAR COM A DOR IDENTIFICADA]
   - ROI comprovado de 300% em 2 anos
   - Certificação reconhecida pelo MEC

3. **Diferencial Competitivo**
   - Única pós com foco em [ÁREA ESPECÍFICA]
   - Mentoria individual
   - Job placement program

## Fechamento
- Como você se sente em relação ao que apresentei?
- Qual parte mais fez sentido para você?
        `,
        keywords: ['solução', 'benefícios', 'ROI', 'diferencial', 'networking'],
        expectedOutcomes: ['Demonstrar valor', 'Conectar com necessidades', 'Gerar interesse'],
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-14'),
        isActive: true,
        version: '1.8'
      }
    ];

    const mockDatabases: SchoolDatabase[] = [
      {
        id: '1',
        name: 'Base de Cursos 2024',
        description: 'Catálogo completo de cursos, preços e informações atualizadas',
        courses: [
          {
            id: '1',
            name: 'MBA Executivo em Gestão Empresarial',
            category: 'MBA',
            duration: '18 meses',
            price: 15000,
            description: 'Formação completa para líderes e gestores',
            benefits: ['Networking executivo', 'Metodologia Harvard', 'Certificação internacional'],
            targetAudience: ['Gestores', 'Coordenadores', 'Empreendedores'],
            prerequisites: ['Graduação completa', '2 anos de experiência']
          },
          {
            id: '2',
            name: 'Pós-Graduação em Marketing Digital',
            category: 'Pós-Graduação',
            duration: '12 meses',
            price: 8500,
            description: 'Especialização em estratégias digitais',
            benefits: ['Cases práticos', 'Ferramentas premium', 'Mentoria individual'],
            targetAudience: ['Profissionais de marketing', 'Empreendedores', 'Analistas'],
            prerequisites: ['Graduação completa']
          }
        ],
        uploadedAt: new Date('2024-01-15'),
        fileSize: 2.5,
        recordCount: 45
      }
    ];

    const mockAnalyses: AIAnalysis[] = [
      {
        id: '1',
        closerId: '1',
        meetingId: 'meet_1',
        date: new Date('2024-01-15'),
        scriptAdherence: 85,
        objectionHandling: 90,
        keywordUsage: 78,
        sentimentScore: 82,
        talkTimeRatio: 45,
        outcome: 'Agendou próxima reunião',
        improvements: [
          'Usar mais palavras-chave do script de descoberta',
          'Fazer mais perguntas abertas',
          'Conectar melhor os benefícios com as dores identificadas'
        ],
        strengths: [
          'Excelente rapport inicial',
          'Boa condução das objeções',
          'Tom de voz adequado'
        ],
        transcript: 'Transcrição completa da reunião...'
      }
    ];

    setScripts(mockScripts);
    setDatabases(mockDatabases);
    setAnalyses(mockAnalyses);
  }, []);

  const handleScriptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingScript(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newScript: Script = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name.replace('.txt', '').replace('.md', ''),
        type: 'discovery',
        content: 'Conteúdo do script carregado...',
        keywords: [],
        expectedOutcomes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: false,
        version: '1.0'
      };
      
      setScripts(prev => [...prev, newScript]);
      setIsUploadingScript(false);
    }, 2000);
  };

  const handleDatabaseUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingDatabase(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newDatabase: SchoolDatabase = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        description: 'Base de dados importada',
        courses: [],
        uploadedAt: new Date(),
        fileSize: file.size / (1024 * 1024), // Convert to MB
        recordCount: Math.floor(Math.random() * 100) + 10
      };
      
      setDatabases(prev => [...prev, newDatabase]);
      setIsUploadingDatabase(false);
    }, 3000);
  };

  const toggleScriptStatus = (scriptId: string) => {
    setScripts(prev => prev.map(script =>
      script.id === scriptId ? { ...script, isActive: !script.isActive } : script
    ));
  };

  const deleteScript = (scriptId: string) => {
    setScripts(prev => prev.filter(script => script.id !== scriptId));
  };

  const deleteDatabase = (databaseId: string) => {
    setDatabases(prev => prev.filter(db => db.id !== databaseId));
  };

  const getScriptTypeColor = (type: string) => {
    switch (type) {
      case 'discovery': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'presentation': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'objection': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'closing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'follow-up': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getScriptTypeName = (type: string) => {
    switch (type) {
      case 'discovery': return 'Descoberta';
      case 'presentation': return 'Apresentação';
      case 'objection': return 'Objeções';
      case 'closing': return 'Fechamento';
      case 'follow-up': return 'Follow-up';
      default: return type;
    }
  };

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || script.type === filterType;
    return matchesSearch && matchesType;
  });

  const averagePerformance = analyses.length > 0 ? {
    scriptAdherence: analyses.reduce((sum, a) => sum + a.scriptAdherence, 0) / analyses.length,
    objectionHandling: analyses.reduce((sum, a) => sum + a.objectionHandling, 0) / analyses.length,
    keywordUsage: analyses.reduce((sum, a) => sum + a.keywordUsage, 0) / analyses.length,
    sentimentScore: analyses.reduce((sum, a) => sum + a.sentimentScore, 0) / analyses.length,
    talkTimeRatio: analyses.reduce((sum, a) => sum + a.talkTimeRatio, 0) / analyses.length
  } : {
    scriptAdherence: 0,
    objectionHandling: 0,
    keywordUsage: 0,
    sentimentScore: 0,
    talkTimeRatio: 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span>AI Performance & Script Management</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie scripts de vendas, base de dados da escola e análise de performance com IA
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-600 dark:text-gray-400">
                IA Ativa • {scripts.filter(s => s.isActive).length} scripts ativos • {performanceData.length} registros
              </span>
            </div>
            
            <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>Sincronizar IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'scripts', label: 'Scripts de Vendas', icon: FileText },
            { id: 'database', label: 'Base da Escola', icon: Database },
            { id: 'analysis', label: 'Análises IA', icon: Brain }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'scripts' | 'database' | 'analysis')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Aderência ao Script</p>
                      <p className="text-2xl font-bold">{averagePerformance.scriptAdherence.toFixed(0)}%</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Contorno de Objeções</p>
                      <p className="text-2xl font-bold">{averagePerformance.objectionHandling.toFixed(0)}%</p>
                    </div>
                    <Target className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Uso de Palavras-chave</p>
                      <p className="text-2xl font-bold">{averagePerformance.keywordUsage.toFixed(0)}%</p>
                    </div>
                    <Zap className="w-8 h-8 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Sentimento</p>
                      <p className="text-2xl font-bold">{averagePerformance.sentimentScore.toFixed(0)}%</p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-100 text-sm">Talk Time Ratio</p>
                      <p className="text-2xl font-bold">{averagePerformance.talkTimeRatio.toFixed(0)}%</p>
                    </div>
                    <Mic className="w-8 h-8 text-teal-200" />
                  </div>
                </div>
              </div>

              {/* Recent Analyses */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Análises Recentes
                </h4>
                
                <div className="space-y-4">
                  {analyses.slice(0, 3).map(analysis => {
                    const closer = closers.find(c => c.id === analysis.closerId);
                    return (
                      <div key={analysis.id} className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {closer?.name.split(' ').map(n => n[0]).join('') || 'NA'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {closer?.name || 'Closer não encontrado'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {analysis.date.toLocaleDateString('pt-BR')} • {analysis.outcome}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-purple-600">
                              {Math.round((analysis.scriptAdherence + analysis.objectionHandling + analysis.keywordUsage + analysis.sentimentScore) / 4)}%
                            </p>
                            <p className="text-xs text-gray-500">Score Geral</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-medium text-gray-900 dark:text-white">{analysis.scriptAdherence}%</p>
                            <p className="text-gray-600 dark:text-gray-400">Script</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-900 dark:text-white">{analysis.objectionHandling}%</p>
                            <p className="text-gray-600 dark:text-gray-400">Objeções</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-900 dark:text-white">{analysis.keywordUsage}%</p>
                            <p className="text-gray-600 dark:text-gray-400">Keywords</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-900 dark:text-white">{analysis.sentimentScore}%</p>
                            <p className="text-gray-600 dark:text-gray-400">Sentimento</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scripts' && (
            <div className="space-y-6">
              {/* Scripts Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Scripts de Vendas ({scripts.length})
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Gerencie os scripts que a IA usa para análise e recomendações
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleScriptUpload}
                    className="hidden"
                    id="script-upload"
                  />
                  <label
                    htmlFor="script-upload"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                      isUploadingScript
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {isUploadingScript ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{isUploadingScript ? 'Carregando...' : 'Upload Script'}</span>
                  </label>
                </div>
              </div>

              {/* Scripts Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar scripts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="discovery">Descoberta</option>
                  <option value="presentation">Apresentação</option>
                  <option value="objection">Objeções</option>
                  <option value="closing">Fechamento</option>
                  <option value="follow-up">Follow-up</option>
                </select>
              </div>

              {/* Scripts List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredScripts.map(script => (
                  <div key={script.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            {script.name}
                          </h5>
                          <span className={`px-2 py-1 text-xs rounded-full ${getScriptTypeColor(script.type)}`}>
                            {getScriptTypeName(script.type)}
                          </span>
                          {script.isActive && (
                            <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              <span>Ativo</span>
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <span>v{script.version}</span>
                          <span>•</span>
                          <span>{script.keywords.length} palavras-chave</span>
                          <span>•</span>
                          <span>{script.updatedAt.toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {script.keywords.slice(0, 3).map(keyword => (
                            <span key={keyword} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded">
                              {keyword}
                            </span>
                          ))}
                          {script.keywords.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs rounded">
                              +{script.keywords.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedScript(selectedScript === script.id ? null : script.id)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                          <Edit3 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => deleteScript(script.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {script.expectedOutcomes.length} resultados esperados
                        </span>
                      </div>
                      
                      <button
                        onClick={() => toggleScriptStatus(script.id)}
                        className={`flex items-center space-x-1 px-3 py-1 text-xs rounded transition-colors ${
                          script.isActive
                            ? 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}
                      >
                        <span>{script.isActive ? 'Desativar' : 'Ativar'}</span>
                      </button>
                    </div>

                    {/* Script Content Preview */}
                    {selectedScript === script.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {script.content.substring(0, 500)}
                            {script.content.length > 500 && '...'}
                          </pre>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {script.content.length} caracteres
                          </div>
                          <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              {/* Database Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Base de Dados da Escola ({databases.length})
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload da base de cursos, preços e informações para a IA usar nas recomendações
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.json"
                    onChange={handleDatabaseUpload}
                    className="hidden"
                    id="database-upload"
                  />
                  <label
                    htmlFor="database-upload"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                      isUploadingDatabase
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                  >
                    {isUploadingDatabase ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{isUploadingDatabase ? 'Carregando...' : 'Upload Base'}</span>
                  </label>
                </div>
              </div>

              {/* Database List */}
              <div className="space-y-4">
                {databases.map(database => (
                  <div key={database.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Database className="w-6 h-6 text-green-600" />
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            {database.name}
                          </h5>
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs rounded-full">
                            Ativo
                          </span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {database.description}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Registros</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {database.recordCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Tamanho</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {database.fileSize.toFixed(1)} MB
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Upload</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {database.uploadedAt.toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        {/* Courses Preview */}
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Cursos Disponíveis ({database.courses.length})
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {database.courses.slice(0, 2).map(course => (
                              <div key={course.id} className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                <h6 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                                  {course.name}
                                </h6>
                                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                  <span>{course.category}</span>
                                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(course.price)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                          <Download className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => deleteDatabase(database.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <Database className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                      Formato da Base de Dados
                    </h5>
                    <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <p>• <strong>Formatos aceitos:</strong> CSV, Excel (.xlsx), JSON</p>
                      <p>• <strong>Campos obrigatórios:</strong> nome, categoria, preço, descrição</p>
                      <p>• <strong>Campos opcionais:</strong> duração, benefícios, público-alvo, pré-requisitos</p>
                      <p>• <strong>Tamanho máximo:</strong> 50MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Análises de Performance com IA
                </h4>
                <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Brain className="w-4 h-4" />
                  <span>Nova Análise</span>
                </button>
              </div>

              <div className="space-y-4">
                {analyses.map(analysis => {
                  const closer = closers.find(c => c.id === analysis.closerId);
                  return (
                    <div key={analysis.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {closer?.name.split(' ').map(n => n[0]).join('') || 'NA'}
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900 dark:text-white">
                              {closer?.name || 'Closer não encontrado'}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {analysis.date.toLocaleDateString('pt-BR')} • {analysis.outcome}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">
                            {Math.round((analysis.scriptAdherence + analysis.objectionHandling + analysis.keywordUsage + analysis.sentimentScore) / 4)}%
                          </p>
                          <p className="text-sm text-gray-500">Score Geral</p>
                        </div>
                      </div>
                      
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{analysis.scriptAdherence}%</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Script</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{analysis.objectionHandling}%</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Objeções</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">{analysis.keywordUsage}%</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Keywords</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-orange-600">{analysis.sentimentScore}%</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Sentimento</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-teal-600">{analysis.talkTimeRatio}%</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Talk Time</p>
                        </div>
                      </div>
                      
                      {/* Insights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-medium text-green-900 dark:text-green-300 mb-2 flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>Pontos Fortes</span>
                          </h6>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            {analysis.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h6 className="font-medium text-orange-900 dark:text-orange-300 mb-2 flex items-center space-x-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>Melhorias</span>
                          </h6>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            {analysis.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-orange-500 mt-1">•</span>
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPerformance;