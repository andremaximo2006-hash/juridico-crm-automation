// IA Atendimento Types

export enum IAType {
  SUPER_AGENT = "super_agent",
  WHATSAPP_IA = "whatsapp_ia",
  MARKETING_IA = "marketing_ia",
}

export enum AIChatStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  ESCALATED = "escalated",
}

export enum AIModel {
  HAIKU = "haiku",
  SONNET = "sonnet",
  OPUS = "opus",
}

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tokens?: number;
  toolsUsed?: string[];
}

export interface AIChat {
  id: string;
  userId: string;
  iaType: IAType;
  messages: AIMessage[];
  sessionId?: string;
  totalTokens: number;
  totalCost: number;
  status: AIChatStatus;
  startedAt: Date;
  endedAt?: Date;
  lastMessageAt: Date;
  clientId?: string;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIConfiguration {
  id: string;
  userId: string;

  // API Keys
  anthropic_api_key_encrypted?: string;
  serper_api_key_encrypted?: string;
  lastKeyUpdate?: Date;

  // Modelo padrão
  defaultModel: AIModel;
  maxTokens: number;
  temperature: number;

  // Super Agent
  superAgentEnabled: boolean;
  superAgentAutoSearch: boolean;
  superAgentAutoAlerts: boolean;

  // WhatsApp IA
  whatsappIaEnabled: boolean;
  whatsappIaAutoRespond: boolean;
  whatsappIaApprovalRequired: boolean;
  whatsappIaEscalateDelaySeconds: number;

  // Marketing IA
  marketingIaEnabled: boolean;
  marketingIaAnalysisModels: string[];

  // Privacidade
  logConversations: boolean;
  anonymizeSensitiveData: boolean;
  encryptAtRest: boolean;
  dataRetentionDays: number;

  // Monitoramento
  maxCallsPerHour: number;
  maxTokensPerDay: number;
  rateLimitAlert: boolean;
  errorAlertSlack: boolean;
  autoRetryEnabled: boolean;
  autoRetryMaxAttempts: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface AIAnalytics {
  id: string;
  userId: string;
  date: Date;
  iaType: IAType;

  totalConversations: number;
  totalMessages: number;
  totalTokensUsed: number;
  totalCost: number;

  avgResponseTimeMs: number;
  avgSatisfactionScore: number;

  errorsCount: number;
  retriesCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface ChatResponse {
  response: string;
  tokens_used: number;
  tools_used: string[];
  session_id: string;
}

export interface AnalyticsResponse {
  period: {
    startDate: Date;
    endDate: Date;
  };
  overview: {
    totalConversations: number;
    avgResponseTime: number;
    avgSatisfaction: number;
    totalCost: number;
  };
  breakdown: {
    [key in IAType]?: {
      conversations: number;
      cost: number;
      percentage: number;
    };
  };
  trends: {
    date: Date;
    conversations: number;
    tokens: number;
  }[];
}
