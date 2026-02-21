import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Video, Mic, MicOff, Camera, CameraOff, Users, Clock, Play, Pause, Square, Volume2, VolumeX, MessageSquare, FileText, Target, TrendingUp, AlertTriangle, CheckCircle, Brain, Lightbulb, Star, ArrowRight, Phone, PhoneOff, Settings, Maximize, Minimize, RotateCcw, Download, Share, Eye, EyeOff, Zap, Activity, BarChart3, User, MapPin, DollarSign, BookOpen, Headphones, AudioWaveform as Waveform } from 'lucide-react';
import { Lead, Closer, CalendarMeeting, MeetingData } from '../utils/types';

interface MeetingsProps {
  leads: Lead[];
  closers: Closer[];
  isManager: boolean;
  currentCloserId?: string;
}

interface AIInsight {
  id: string;
  type: 'script_adherence' | 'objection_handling' | 'next_step' | 'sentiment' | 'opportunity';
  title: string;
  message: string;
  confidence: number;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionable: boolean;
}

interface TranscriptionSegment {
  id: string;
  speaker: 'closer' | 'lead';
  text: string;
  timestamp: Date;
  confidence: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
}

interface MeetingSession {
  id: string;
  meetingId: string;
  leadId: string;
  closerId: string;
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  transcription: TranscriptionSegment[];
  aiInsights: AIInsight[];
  performance: {
    scriptAdherence: number;
    objectionHandling: number;
    engagementLevel: number;
    talkTimeRatio: number;
    sentimentScore: number;
  };
  recording?: {
    url: string;
    duration: number;
    size: number;
  };
}

const Meetings: React.FC<MeetingsProps> = ({ leads, closers, isManager, currentCloserId }) => {
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<MeetingSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiAssistantVisible, setAiAssistantVisible] = useState(true);
  const [transcriptionVisible, setTranscriptionVisible] = useState(true);
  const [meetings, setMeetings] = useState<CalendarMeeting[]>([]);
  const [meetingSessions, setMeetingSessions] = useState<MeetingSession[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const transcriptionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mock meetings data
  useEffect(() => {
    const mockMeetings: CalendarMeeting[] = [
      {
        id: 'meet_1',
        leadId: '1',
        closerId: currentCloserId || '1',
        title: 'Apresentação MBA - Fábio Ernani',
        startTime: new Date('2024-01-16T10:00:00'),
        endTime: new Date('2024-01-16T11:00:00'),
        attendees: ['fsouzaborges@hotmail.com'],
        status: 'scheduled',
        meetingLink: 'https://meet.google.com/iym-hcoo-odj'
      },
      {
        id: 'meet_2',
        leadId: '2',
        closerId: currentCloserId || '1',
        title: 'Follow-up - Carlos Oliveira',
        startTime: new Date('2024-01-16T14:00:00'),
        endTime: new Date('2024-01-16T14:30:00'),
        attendees: ['carlos@empresa.com'],
        status: 'scheduled',
        meetingLink: 'https://meet.google.com/abc-defg-hij'
      },
      {
        id: 'meet_3',
        leadId: '3',
        closerId: currentCloserId || '1',
        title: 'Fechamento - Fernanda Lima',
        startTime: new Date('2024-01-16T16:00:00'),
        endTime: new Date('2024-01-16T17:00:00'),
        attendees: ['fernanda.lima@gmail.com'],
        status: 'live',
        meetingLink: 'https://meet.google.com/xyz-uvwx-123'
      }
    ];

    setMeetings(mockMeetings);

    // Mock active meeting session
    const mockSession: MeetingSession = {
      id: 'session_1',
      meetingId: 'meet_3',
      leadId: '3',
      closerId: currentCloserId || '1',
      startTime: new Date('2024-01-16T16:00:00'),
      status: 'live',
      transcription: [
        {
          id: 'trans_1',
          speaker: 'closer',
          text: 'Olá Fernanda! Como está? Obrigado por estar aqui hoje.',
          timestamp: new Date('2024-01-16T16:01:00'),
          confidence: 0.95,
          sentiment: 'positive',
          keywords: ['saudação', 'agradecimento']
        },
        {
          id: 'trans_2',
          speaker: 'lead',
          text: 'Oi! Estou bem, obrigada. Estou ansiosa para saber mais sobre o MBA.',
          timestamp: new Date('2024-01-16T16:01:15'),
          confidence: 0.92,
          sentiment: 'positive',
          keywords: ['interesse', 'MBA', 'ansiedade']
        },
        {
          id: 'trans_3',
          speaker: 'closer',
          text: 'Perfeito! Vou te mostrar como o MBA pode transformar sua carreira. Primeiro, me conta um pouco sobre seus objetivos profissionais.',
          timestamp: new Date('2024-01-16T16:01:30'),
          confidence: 0.94,
          sentiment: 'positive',
          keywords: ['descoberta', 'objetivos', 'carreira']
        }
      ],
      aiInsights: [
        {
          id: 'insight_1',
          type: 'script_adherence',
          title: 'Ótimo início!',
          message: 'Você seguiu perfeitamente o script de abertura. Continue com a descoberta de necessidades.',
          confidence: 0.95,
          timestamp: new Date('2024-01-16T16:01:45'),
          priority: 'medium',
          actionable: true
        },
        {
          id: 'insight_2',
          type: 'sentiment',
          title: 'Lead engajado',
          message: 'Fernanda demonstra alto interesse. Momento ideal para aprofundar os benefícios.',
          confidence: 0.88,
          timestamp: new Date('2024-01-16T16:02:00'),
          priority: 'high',
          actionable: true
        },
        {
          id: 'insight_3',
          type: 'next_step',
          title: 'Próximo passo sugerido',
          message: 'Faça perguntas sobre desafios atuais na carreira dela antes de apresentar soluções.',
          confidence: 0.91,
          timestamp: new Date('2024-01-16T16:02:15'),
          priority: 'high',
          actionable: true
        }
      ],
      performance: {
        scriptAdherence: 92,
        objectionHandling: 0, // Nenhuma objeção ainda
        engagementLevel: 88,
        talkTimeRatio: 45, // 45% closer, 55% lead (ideal)
        sentimentScore: 85
      }
    };

    setMeetingSessions([mockSession]);
    if (mockMeetings.find(m => m.status === 'live')) {
      setActiveMeeting(mockSession);
      setSelectedMeeting('meet_3');
    }
  }, [currentCloserId]);

  const startMeeting = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;

    const session: MeetingSession = {
      id: `session_${Date.now()}`,
      meetingId,
      leadId: meeting.leadId,
      closerId: meeting.closerId,
      startTime: new Date(),
      status: 'live',
      transcription: [],
      aiInsights: [],
      performance: {
        scriptAdherence: 0,
        objectionHandling: 0,
        engagementLevel: 0,
        talkTimeRatio: 0,
        sentimentScore: 0
      }
    };

    setActiveMeeting(session);
    setSelectedMeeting(meetingId);
    setIsTranscribing(true);
    setIsRecording(true);

    // Update meeting status
    setMeetings(prev => prev.map(m => 
      m.id === meetingId ? { ...m, status: 'live' as const } : m
    ));
  };

  const endMeeting = () => {
    if (!activeMeeting) return;

    const updatedSession = {
      ...activeMeeting,
      endTime: new Date(),
      status: 'completed' as const
    };

    setMeetingSessions(prev => [...prev, updatedSession]);
    setActiveMeeting(null);
    setIsTranscribing(false);
    setIsRecording(false);

    // Update meeting status
    setMeetings(prev => prev.map(m => 
      m.id === activeMeeting.meetingId ? { ...m, status: 'completed' as const } : m
    ));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    setIsCameraOff(!isCameraOff);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = Math.floor((endTime.getTime() - start.getTime()) / 1000 / 60);
    return `${duration}min`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500 animate-pulse';
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'Ao Vivo';
      case 'scheduled': return 'Agendada';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'script_adherence': return <BookOpen className="w-4 h-4" />;
      case 'objection_handling': return <Target className="w-4 h-4" />;
      case 'next_step': return <ArrowRight className="w-4 h-4" />;
      case 'sentiment': return <Activity className="w-4 h-4" />;
      case 'opportunity': return <Star className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const meetingDate = meeting.startTime.toISOString().split('T')[0];
    const matchesDate = selectedDate === meetingDate;
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;
    const matchesCloser = !isManager || !currentCloserId || meeting.closerId === currentCloserId;
    
    return matchesDate && matchesStatus && matchesCloser;
  });

  const selectedMeetingData = meetings.find(m => m.id === selectedMeeting);
  const selectedLead = selectedMeetingData ? leads.find(l => l.id === selectedMeetingData.leadId) : null;

  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
    }
  }, [activeMeeting?.transcription]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Video className="w-5 h-5 text-blue-600" />
              <span>Central de Reuniões</span>
              {activeMeeting && (
                <span className="flex items-center space-x-2 ml-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-600 dark:text-red-400 font-medium">AO VIVO</span>
                </span>
              )}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeMeeting 
                ? `Reunião com ${selectedLead?.name} • ${formatDuration(activeMeeting.startTime)}`
                : 'Gerencie suas reuniões com assistente de IA em tempo real'
              }
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Date Filter */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="scheduled">Agendadas</option>
              <option value="live">Ao Vivo</option>
              <option value="completed">Concluídas</option>
            </select>

            {/* AI Assistant Toggle */}
            <button
              onClick={() => setAiAssistantVisible(!aiAssistantVisible)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                aiAssistantVisible 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>IA</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Meetings List */}
        <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Reuniões de Hoje ({filteredMeetings.length})
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredMeetings.length === 0 ? (
              <div className="p-6 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhuma reunião
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Não há reuniões agendadas para esta data
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredMeetings.map(meeting => {
                  const lead = leads.find(l => l.id === meeting.leadId);
                  const isSelected = selectedMeeting === meeting.id;
                  const isLive = meeting.status === 'live';
                  
                  return (
                    <div
                      key={meeting.id}
                      onClick={() => setSelectedMeeting(meeting.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(meeting.status)}`} />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {getStatusText(meeting.status)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTime(meeting.startTime)}
                        </span>
                      </div>

                      <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                        {lead?.name || 'Lead não encontrado'}
                      </h5>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {meeting.title}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>{meeting.attendees.length + 1} participantes</span>
                        </div>
                        
                        {meeting.status === 'scheduled' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startMeeting(meeting.id);
                            }}
                            className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                          >
                            <Play className="w-3 h-3" />
                            <span>Iniciar</span>
                          </button>
                        )}
                        
                        {isLive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              endMeeting();
                            }}
                            className="flex items-center space-x-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                          >
                            <Square className="w-3 h-3" />
                            <span>Finalizar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Meeting Area */}
        <div className="flex-1 flex flex-col">
          {activeMeeting && selectedLead ? (
            <>
              {/* Meeting Header */}
              <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedLead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {selectedLead.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{selectedLead.course}</span>
                        <span>•</span>
                        <span>{selectedLead.phone}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3" />
                          <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedLead.value)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Meeting Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className={`p-3 rounded-full transition-colors ${
                        isMuted 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={toggleCamera}
                      className={`p-3 rounded-full transition-colors ${
                        isCameraOff 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {isCameraOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={toggleRecording}
                      className={`p-3 rounded-full transition-colors ${
                        isRecording 
                          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Video className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setTranscriptionVisible(!transcriptionVisible)}
                      className={`p-3 rounded-full transition-colors ${
                        transcriptionVisible 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Headphones className="w-5 h-5" />
                    </button>

                    <button
                      onClick={endMeeting}
                      className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                    >
                      <PhoneOff className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Performance Indicators */}
                <div className="mt-4 grid grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {activeMeeting.performance.scriptAdherence}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Script</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {activeMeeting.performance.engagementLevel}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Engajamento</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {activeMeeting.performance.talkTimeRatio}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Talk Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {activeMeeting.performance.sentimentScore}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Sentimento</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {activeMeeting.performance.objectionHandling || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Objeções</div>
                  </div>
                </div>
              </div>

              {/* Meeting Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Video Area */}
                <div className="flex-1 bg-gray-900 relative">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                  />
                  
                  {/* Video Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4 mx-auto">
                        {selectedLead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{selectedLead.name}</h3>
                      <p className="text-blue-200">Reunião em andamento</p>
                    </div>
                  </div>

                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-sm font-medium">REC</span>
                    </div>
                  )}

                  {/* Meeting Duration */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full">
                    <span className="text-sm font-medium">
                      {formatDuration(activeMeeting.startTime)}
                    </span>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col">
                  {/* Panel Tabs */}
                  <div className="flex border-b border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => setAiAssistantVisible(true)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
                        aiAssistantVisible
                          ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Brain className="w-4 h-4" />
                      <span>IA Assistant</span>
                    </button>
                    <button
                      onClick={() => setAiAssistantVisible(false)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
                        !aiAssistantVisible
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Transcrição</span>
                    </button>
                  </div>

                  {/* Panel Content */}
                  <div className="flex-1 overflow-hidden">
                    {aiAssistantVisible ? (
                      /* AI Assistant Panel */
                      <div className="h-full flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              IA Assistente Ativo
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {activeMeeting.aiInsights.map(insight => (
                            <div
                              key={insight.id}
                              className={`p-4 rounded-lg border-l-4 ${getPriorityColor(insight.priority)}`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                  {getInsightIcon(insight.type)}
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                                    {insight.title}
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {insight.message}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                      Confiança: {Math.round(insight.confidence * 100)}%
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatTime(insight.timestamp)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Real-time suggestions */}
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center space-x-2 mb-2">
                              <Zap className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                                Sugestão em Tempo Real
                              </span>
                            </div>
                            <p className="text-sm text-purple-800 dark:text-purple-200">
                              O lead demonstra interesse. Agora é o momento ideal para apresentar os benefícios específicos do MBA para o perfil dela.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Transcription Panel */
                      <div className="h-full flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Waveform className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Transcrição ao Vivo
                              </span>
                            </div>
                            {isTranscribing && (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-xs text-red-600">Ouvindo</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div 
                          ref={transcriptionRef}
                          className="flex-1 overflow-y-auto p-4 space-y-4"
                        >
                          {activeMeeting.transcription.map(segment => (
                            <div
                              key={segment.id}
                              className={`flex space-x-3 ${
                                segment.speaker === 'closer' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-xs p-3 rounded-lg ${
                                  segment.speaker === 'closer'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                }`}
                              >
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs font-medium">
                                    {segment.speaker === 'closer' ? 'Você' : selectedLead.name}
                                  </span>
                                  <span className="text-xs opacity-75">
                                    {formatTime(segment.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm">{segment.text}</p>
                                
                                {/* Sentiment indicator */}
                                <div className="flex items-center justify-between mt-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    segment.sentiment === 'positive' ? 'bg-green-400' :
                                    segment.sentiment === 'negative' ? 'bg-red-400' : 'bg-yellow-400'
                                  }`} />
                                  <span className="text-xs opacity-75">
                                    {Math.round(segment.confidence * 100)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* No Active Meeting */
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
              <div className="text-center">
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {selectedMeetingData ? 'Reunião Selecionada' : 'Selecione uma reunião'}
                </h3>
                {selectedMeetingData ? (
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedMeetingData.title}
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <span>{formatTime(selectedMeetingData.startTime)}</span>
                      <span>•</span>
                      <span>{selectedLead?.name}</span>
                      <span>•</span>
                      <span>{getStatusText(selectedMeetingData.status)}</span>
                    </div>
                    {selectedMeetingData.status === 'scheduled' && (
                      <button
                        onClick={() => startMeeting(selectedMeetingData.id)}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors mx-auto"
                      >
                        <Play className="w-5 h-5" />
                        <span>Iniciar Reunião</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    Escolha uma reunião da lista para começar
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Meetings;