// IA Factory Types - Sistema Extensível de IAs

export enum IACanal {
  WHATSAPP = "whatsapp",
  EMAIL = "email",
  WEBCHAT = "webchat",
  TELEFONE = "telefone",
  INSTAGRAM = "instagram",
  LINKEDIN = "linkedin",
  CUSTOM = "custom",
}

export enum IATemplateTipo {
  SDR_QUALIFICACAO = "sdr_qualificacao",
  SUPORTE_TECNICO = "suporte_tecnico",
  EMAIL_RESPONDER = "email_responder",
  CHATBOT_VISITANTE = "chatbot_visitante",
  CONSULTOR_LEGAL = "consultor_legal",
  PROSPECCAO = "prospeccao",
  CUSTOM = "custom",
}

export interface IATemplate {
  id: string;
  nome: string;
  descricao?: string;
  templateTipo: IATemplateTipo;
  isPublico: boolean;

  // Config padrão
  systemPrompt: string;
  modelo: "haiku" | "sonnet" | "opus";
  temperature: number;
  maxTokens: number;

  // Comportamento
  comportamento: Record<string, any>;
  toolsDisponiveis: string[];
  validacoes?: Record<string, any>;

  versao: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAInstance {
  id: string;
  userId: string;

  // Info básica
  nome: string;
  descricao?: string;
  icone?: string;

  // Template
  templateId?: string;

  // Config
  canal: IACanal;
  modelo: "haiku" | "sonnet" | "opus";
  temperature: number;
  maxTokens: number;

  // Prompt customizável
  systemPrompt: string;

  // Comportamento
  comportamento: Record<string, any>;
  toolsAtivas: string[];

  // Status
  isAtiva: boolean;
  isPublicada: boolean;

  // Credenciais
  canalConfig: Record<string, any>;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;

  // Stats
  totalConversas: number;
  totalTokensUsado: number;
  totalCusto: number;
}

export interface IAConversa {
  id: string;
  iaId: string;

  // Participante
  participante: string;
  participanteId?: string;
  contactoInfo: Record<string, any>;

  // Conversa
  mensagens: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    tokens?: number;
  }>;
  dados: Record<string, any>;

  // Status
  status: "ativa" | "concluida" | "escalonada";
  escalonadoEm?: Date;

  // Metadata
  canal: IACanal;
  createdAt: Date;
  updatedAt: Date;
}

export interface IALog {
  id: string;
  iaId: string;

  nivel: "info" | "warning" | "error";
  mensagem: string;
  dados?: Record<string, any>;

  createdAt: Date;
}

export interface IAAnaliticsDia {
  id: string;
  iaId: string;

  data: Date;

  conversas: number;
  mensagens: number;
  tokens: number;
  custo: number;
  avgResponseTime: number;
  erros: number;
}

export interface CriarIARequest {
  nome: string;
  descricao?: string;
  canal: IACanal;
  templateId?: string;
  systemPrompt: string;
  modelo: "haiku" | "sonnet" | "opus";
  temperature: number;
  maxTokens: number;
  toolsAtivas?: string[];
  canalConfig?: Record<string, any>;
  icone?: string;
}

export interface EditarIARequest {
  nome?: string;
  descricao?: string;
  systemPrompt?: string;
  temperatura?: number;
  maxTokens?: number;
  toolsAtivas?: string[];
  isAtiva?: boolean;
  canalConfig?: Record<string, any>;
}

export interface CriarIAResponse {
  id: string;
  nome: string;
  canal: IACanal;
  status: "criada" | "erro";
  mensagem: string;
  proximosPassos: string[];
}

export interface IATemplateConfig {
  nome: string;
  template: IATemplateTipo;
  systemPrompt: string;
  modelo: "haiku" | "sonnet" | "opus";
  temperature: number;
  maxTokens: number;
  comportamento: Record<string, any>;
  toolsDisponiveis: string[];
}

export interface IAStats {
  iaId: string;
  nomeia: string;
  totalConversas: number;
  totalTokens: number;
  totalCusto: number;
  avgResponseTime: number;
  taxaErro: number;
  uptime: number;
}
