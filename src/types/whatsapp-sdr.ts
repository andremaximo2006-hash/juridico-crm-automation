// WhatsApp IA SDR Types

export interface WhatsAppRoteiro {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  steps?: WhatsAppRoteiroStep[];
}

export interface WhatsAppRoteiroStep {
  id: string;
  roteiroId: string;
  order: number;
  pergunta: string;
  tipo: "text" | "multiple_choice" | "date" | "phone";
  isRequired: boolean;
  respostas?: Array<{ label: string; value: string }>;
  proximoStep?: number;
  condicoes?: BranchingCondition[];
  regex?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchingCondition {
  if: string; // ex: "area == 'familia'"
  then: {
    goto: number;
  };
}

export interface WhatsAppQualificacao {
  id: string;
  conversationId: string;
  dados: Record<string, any>;
  score: number; // 0-100
  viabilidade: "viavel" | "inviavel" | "pendente";
  motivo?: string;
  encaminhadoEm?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppTarefa {
  id: string;
  conversationId: string;
  tipo: string; // "enviar_documento", "agendar_reuniao", "coletar_cpf"
  descricao: string;
  status: "pendente" | "completo" | "erro";
  resultado?: any;
  createdAt: Date;
  completadoEm?: Date;
}

export interface ScoringCriteria {
  areaViavel?: number;
  situacaoComum?: number;
  documentosCompletos?: number;
  descricaoClara?: number;
  urgencia?: number;
  clientePotencial?: number;
}

export interface LeadScore {
  totalScore: number;
  viabilidade: "viavel" | "inviavel" | "talvez";
  motivo: string;
  proximosPassos: string[];
  recomendacaoEncaminhamento: "imediato" | "com_ressalva" | "nao_viavel";
}

export interface RoteiroFlowRequest {
  conversationId: string;
  roteiroId: string;
  leadData?: Record<string, any>;
}

export interface RoteiroFlowResponse {
  pergunta: string;
  tipo: "text" | "multiple_choice" | "date" | "phone";
  respostas?: Array<{ label: string; value: string }>;
  passo: number;
  totalPassos: number;
  isUltimoPasso: boolean;
}

export interface RespostaPerguntaRequest {
  conversationId: string;
  resposta: string;
}

export interface RespostaPerguntaResponse {
  proximaPergunta?: RoteiroFlowResponse;
  qualificacaoCompleta?: WhatsAppQualificacao;
  status: "continua" | "finalizado" | "encaminhado";
  mensagem?: string;
}

export interface FilaQualificacaoItem {
  conversationId: string;
  leadName: string;
  area: string;
  score: number;
  viabilidade: "viavel" | "inviavel";
  encaminhadoEm: Date;
  roteiro: string;
  tempoAtendimento: string; // "8m 30s"
}

export interface FilaQualificacaoStats {
  totalLeads: number;
  leadsCriticos: number; // score >= 85
  leadsMediaos: number; // score 70-84
  leadsNaoQualificados: number; // score < 70
  taxaConclusao: number; // percentual
  taxaQualificacao: number; // percentual de viáveis
  tempoMedio: string;
}

export interface RoteiroStats {
  roteiroId: string;
  roteiroNome: string;
  totalConversas: number;
  taxaConclusao: number;
  scoreMediano: number;
  taxaViabilidade: number;
  encaminhadosPara: number;
  converstoPara: number;
  tempoMedio: string;
}
