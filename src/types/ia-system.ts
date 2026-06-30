// Sistema Multi-Agente de IA para Atendimento Jurídico

export type TipoBeneficio = 
  | "inss"
  | "bpc_loas"
  | "salario_maternidade"
  | "auxilio_acidente"
  | "pensao_morte"
  | "desemprego"
  | "nao_identificado";

export interface ConfigRoteiro {
  id: string;
  nome: string;
  descricao: string;
  mensagemInicial: string;
  perguntasIniciais: string[];
  regras: RegraConversa[];
  isAtivo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface RegraConversa {
  id: string;
  tipo: "inviolavel" | "transicao" | "acolhimento";
  conteudo: string;
  descricao: string;
}

export interface EspecialistaIA {
  id: string;
  nome: string;
  expertise: TipoBeneficio;
  descricao: string;
  prompt: string; // Sistema prompt da IA
  perguntas: string[];
  respostaPadrao: string;
  isAtivo: boolean;
}

export interface ConversaLead {
  id: string;
  leadId: string;
  telefone: string;
  nomeCompleto?: string;
  primeiroNome?: string;
  etapaAtual: "recepcao" | "qualificacao" | "especialista" | "encaminhamento";
  tipoBeneficio?: TipoBeneficio;
  especialistaAtribuida?: string;
  mensagens: MensagemConversa[];
  score: number; // 0-100 (qualificação)
  viabilidade: "viavel" | "talvez" | "inviavel" | "pendente";
  dados: Record<string, any>; // Dados coletados durante conversa
  criadoEm: Date;
  atualizadoEm: Date;
  concluida: boolean;
}

export interface MensagemConversa {
  id: string;
  remetente: "lead" | "marta" | "especialista" | "sistema";
  conteudo: string;
  timestamp: Date;
  metadados?: {
    tipoResposta?: string;
    campoPreenchido?: string;
    iaUsada?: string;
  };
}

export interface ResultadoOrquestracao {
  proximoAgente: "marta" | TipoBeneficio | "encerrar";
  motivo: string;
  score: number;
  dadosColetados: Record<string, any>;
}
