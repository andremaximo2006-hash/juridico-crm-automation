// Email IA Types
export interface EmailTemplate {
  id: string;
  nome: string;
  descricao?: string;
  assunto: string;
  corpo: string;
  variaveis: string[];
  isAtivo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailCampanha {
  id: string;
  nome: string;
  descricao?: string;
  templateId: string;
  template?: EmailTemplate;
  destinatarios: string[];
  tagsDestino: string[];
  status: "rascunho" | "agendado" | "enviando" | "enviado" | "falha";
  agendadoEm?: Date;
  enviadoEm?: Date;
  totalDestina: number;
  enviados: number;
  abertos: number;
  clicados: number;
  falhas: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailMensagem {
  id: string;
  campaignId: string;
  campanha?: EmailCampanha;
  templateId: string;
  template?: EmailTemplate;
  paraEmail: string;
  paraNome?: string;
  parametros: Record<string, string>;
  status: "enviando" | "enviado" | "falha";
  msgId?: string;
  errorMsg?: string;
  abertoEm?: Date;
  clicadoEm?: Date;
  descadastradoEm?: Date;
  createdAt: Date;
  updatedAt: Date;
  enviadoEm?: Date;
  interacoes?: EmailInteracao[];
}

export interface EmailInteracao {
  id: string;
  mensagemId: string;
  mensagem?: EmailMensagem;
  tipo: "aberto" | "clicado" | "descadastrado" | "reclamacao";
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface EmailConfig {
  id: string;
  provider: "sendgrid" | "smtp" | "mailgun" | "aws";
  apiKey?: string;
  fromEmail: string;
  fromName?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  isAtivo: boolean;
  webhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

export interface CampaignStats {
  totalDestinario: number;
  enviados: number;
  abertos: number;
  clicados: number;
  falhas: number;
  taxaEntrega: number;
  taxaAbertura: number;
  taxaClique: number;
}
