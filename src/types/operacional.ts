// Types and constants for the Operacional Kanban module

// Basic type definitions
export type AreaAtuacao = "Previdenciario" | "Trabalhista" | "Civil" | "Familia" | "Tributario";
export type TipoRequerimento = "RequerimentoAdministrativo" | "PeticaoInicial" | "InicialJudicial" | "MandadoDeSeguranca" | "MinutaDeAcordo" | "Contestacao" | "Replica" | "PeticaoIntermediaria" | "RecursoOrdinario" | "RecursoInominado" | "RecursoEspecial" | "EmbargosDeDeclaracao" | "AgravoDeInstrumento" | "AgravoDePeticao" | "Apelacao" | "CumprimentoDeSentenca" | "CumprimentoDeExigencia" | "HabilitacaoEmExecucao" | "EmendaAInicial" | "RazoeFinais" | "Contrarrazoes" | "Impugnacao" | "DefesaIDPJ" | "AnaliseDeViabilidade";
export type Responsavel = "DraGabrielle" | "DrThauan" | "DrRafael" | "NicoliMoreira" | "CinthiaFerreira" | "DanielMartins" | "VanderliFernandes" | "KailaneSantos" | "FhellipeMatheus" | "HeloisaEstag" | "GabriellyEstag" | "GiuliaEstag";
export type StatusCadSenha = "Vazio" | "Pendente" | "AguardandoAssinatura" | "OK" | "Bloqueado" | "Verificar" | null;
export type StatusConformidade = "Vazio" | "AguardandoLaudosMedicos" | "AguardandoCadUnico" | "AguardandoCadUnicoAtualizado" | "AguardandoDocumentos" | "AguardandoAcessoGOV" | "AguardandoExtratosBancarios" | "AguardandoTituloDeEleitor" | "Pendente" | "OK" | "SemViabilidade" | "Desistencia" | null;
export type StatusGuia = "GuiaEmitidaAguardandoPagamento" | "GuiaEmitidaPagamentoRealizado" | "GuiaEncaminhadaPagamentoRealizado" | "NaoEmitida" | null;
export type KanbanColuna = "novo" | "triagem" | "andamento" | "concluido";
export type Prioridade = "baixa" | "normal" | "alta" | "urgente";
export type ContribuicaoSM = "CI" | "FBR" | null;
export type QuemPagaSM = "GN" | "Cliente" | null;
export type NaturezaFicha = "LEAD" | "ORGANICO";

// Ficha database model
export interface FichaOperacional {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  nome: string;
  contato: string | null;
  natureza: NaturezaFicha;
  area: AreaAtuacao;
  beneficio: string;
  tipoRequerimento: TipoRequerimento | null;
  numeroProcesso: string | null;
  dataEntrada: Date;
  dataProtocolo: Date | null;
  numeroProtocolo: string | null;
  responsavel: Responsavel;
  setor: string | null;
  coluna: KanbanColuna;
  prioridade: Prioridade;
  cadSenha: StatusCadSenha;
  conformidade: StatusConformidade;
  smContribuicao: ContribuicaoSM;
  smDpp: Date | null;
  smQuemPaga: QuemPagaSM;
  smStatusGuia: StatusGuia;
  observacoes: string | null;
  historicoLog: string | null;
}

// UI-specific ficha with computed fields
export type FichaCard = FichaOperacional & {
  diasAte_DPP?: number;
  alertas: string[];
  podeAvançarColuna: boolean;
  bloqueadoMoverAndamento: boolean;
};

// Form submission type
export type FichaFormData = Omit<FichaOperacional, 'id' | 'createdAt' | 'updatedAt'>;

// Filter state type
export interface FilterState {
  areas?: AreaAtuacao[];
  natureza?: NaturezaFicha;
  prioridade?: Prioridade;
  responsavel?: Responsavel;
  status?: KanbanColuna;
  semRetorno?: boolean;
  dppProxima?: boolean;
  aguardandoDocs?: boolean;
  search?: string;
}

// Stats type
export interface StatsMetrics {
  total: number;
  novo: number;
  triagem: number;
  andamento: number;
  concluido: number;
  urgentes: number;
  aguardandoDocs: number;
  dppProxima: number;
}

// Avatar definition
export interface AvatarDef {
  iniciais: string;
  cor: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────

export const BENEFICIOS: Record<AreaAtuacao, string[]> = {
  Previdenciario: [
    "BPC/LOAS",
    "BPC/LOAS Judicial",
    "BPC/LOAS — restabelecimento",
    "BPC/LOAS — cessado",
    "BPC/LOAS idoso",
    "BPC/LOAS deficiente",
    "Salário Maternidade Urbano",
    "Salário Maternidade Rural",
    "Auxílio Doença",
    "Auxílio Doença Acidentário",
    "Auxílio Doença/Salário Maternidade",
    "Auxílio Acidente",
    "Aposentadoria por Incapacidade Permanente",
    "Aposentadoria por Incapacidade Temporária",
    "Aposentadoria Especial",
    "Aposentadoria por Idade",
    "Aposentadoria — revisão",
    "Aposentadoria — conversão",
    "Pensão por Morte",
    "Adicional de 25%",
    "Benefício por Incapacidade Temporária",
    "Benefício por Incapacidade Total e Permanente",
    "Mandado de Segurança — demora na análise",
    "Mandado de Segurança — falta de notificação",
    "Retificação de CNIS",
    "Recurso Ordinário",
    "Recurso Inominado",
    "Cumprimento de Exigência",
    "Levantamento de RPV",
    "Pedido de Pagamento não Recebido",
  ],
  Trabalhista: [
    "Reclamação Trabalhista",
    "Defesa em Reclamação Trabalhista",
    "Reconhecimento de Vínculo + Gestante",
    "Ação Trabalhista",
    "Impugnação aos Cálculos",
    "Recurso Ordinário Trabalhista",
    "Agravo de Petição",
    "Razões Finais",
    "Defesa IDPJ",
  ],
  Civil: [
    "Ação de Cobrança",
    "Ação Indenizatória",
    "RPV — Levantamento de Valores",
    "Contestação",
    "Réplica",
    "Embargos de Declaração",
    "Agravo de Instrumento",
    "Agravo em Recurso Especial",
    "Agravo Interno",
    "Apelação",
    "Cumprimento de Sentença",
    "Negativação Indevida",
    "Busca e Apreensão",
    "Obrigação de Fazer",
    "Danos Morais",
    "Auxílio Funeral",
    "Arbitramento de Honorários",
    "Anulação de Contrato de Empréstimo Consignado",
  ],
  Familia: [
    "Ação de Alimentos",
    "Exoneração de Alimentos",
    "Divórcio",
    "Divórcio Litigioso",
    "Reconhecimento de União Estável",
    "Inventário",
    "Regulamentação de Visitas",
    "Curatela",
    "Reconhecimento de Testamento",
    "Execução — Alimentos",
    "Cumprimento de Sentença — Alimentos",
    "Habilitação em Execução",
  ],
  Tributario: [
    "Petição Intermediária",
    "Réplica Tributária",
    "Pedido de Uniformização de Jurisprudência",
  ],
};

export const AVATARES: Record<Responsavel, AvatarDef> = {
  DraGabrielle: { iniciais: "GN", cor: "#9b59f5" },
  DrThauan: { iniciais: "TH", cor: "#4a7cf7" },
  DrRafael: { iniciais: "RF", cor: "#f04b4b" },
  NicoliMoreira: { iniciais: "NM", cor: "#34c77a" },
  CinthiaFerreira: { iniciais: "CF", cor: "#f5a623" },
  DanielMartins: { iniciais: "DM", cor: "#5af5f0" },
  VanderliFernandes: { iniciais: "VF", cor: "#f55af0" },
  KailaneSantos: { iniciais: "KS", cor: "#f5e55a" },
  FhellipeMatheus: { iniciais: "FM", cor: "#ff8855" },
  HeloisaEstag: { iniciais: "HL", cor: "#aaaaff" },
  GabriellyEstag: { iniciais: "GB", cor: "#ffaaaa" },
  GiuliaEstag: { iniciais: "GI", cor: "#aaffaa" },
};

export const CORES_AREA: Record<AreaAtuacao, { bg: string; text: string; border: string }> = {
  Previdenciario: { bg: "#1a2a4a", text: "#6aacf5", border: "#2a4a7a" },
  Trabalhista: { bg: "#2a1f00", text: "#f5c642", border: "#4a3800" },
  Civil: { bg: "#1a1a3a", text: "#9b8ff5", border: "#3a3070" },
  Familia: { bg: "#2a1a2a", text: "#e07af5", border: "#4a2a4a" },
  Tributario: { bg: "#1a1a3a", text: "#9b8ff5", border: "#3a3070" },
};

export const CORES_NATUREZA: Record<NaturezaFicha, { bg: string; text: string; border: string }> = {
  LEAD: { bg: "#1a2a1a", text: "#5af59b", border: "#2a4a2a" },
  ORGANICO: { bg: "#2a2a1a", text: "#f5e55a", border: "#4a4a2a" },
};

export const CORES_PRIORIDADE: Record<Prioridade, { bg: string; text: string; border: string; label: string }> = {
  urgente: { bg: "#3a1a1a", text: "#f04b4b", border: "#5a2a2a", label: "🔴 URGENTE" },
  alta: { bg: "#2a1f00", text: "#f5a623", border: "#4a3800", label: "⚠ Alta" },
  normal: { bg: "transparent", text: "transparent", border: "transparent", label: "" },
  baixa: { bg: "#1a2a1a", text: "#34c77a", border: "#2a4a2a", label: "↓ Baixa" },
};

export const CORES_KANBAN: Record<KanbanColuna, { bg: string; hex: string }> = {
  novo: { bg: "bg-blue-100", hex: "#4a7cf7" },
  triagem: { bg: "bg-orange-100", hex: "#f5a623" },
  andamento: { bg: "bg-green-100", hex: "#34c77a" },
  concluido: { bg: "bg-gray-100", hex: "#888888" },
};

export const STATUS_LABELS: Record<KanbanColuna, string> = {
  novo: "Novo",
  triagem: "Triagem",
  andamento: "Em Andamento",
  concluido: "Concluído",
};

export const TIPOS_REQUERIMENTO: TipoRequerimento[] = [
  "RequerimentoAdministrativo",
  "PeticaoInicial",
  "InicialJudicial",
  "MandadoDeSeguranca",
  "MinutaDeAcordo",
  "Contestacao",
  "Replica",
  "PeticaoIntermediaria",
  "RecursoOrdinario",
  "RecursoInominado",
  "RecursoEspecial",
  "EmbargosDeDeclaracao",
  "AgravoDeInstrumento",
  "AgravoDePeticao",
  "Apelacao",
  "CumprimentoDeSentenca",
  "CumprimentoDeExigencia",
  "HabilitacaoEmExecucao",
  "EmendaAInicial",
  "RazoeFinais",
  "Contrarrazoes",
  "Impugnacao",
  "DefesaIDPJ",
  "AnaliseDeViabilidade",
];

export const AREAS_ATUACAO: AreaAtuacao[] = [
  "Previdenciario",
  "Trabalhista",
  "Civil",
  "Familia",
  "Tributario",
];

export const RESPONSAVEIS: Responsavel[] = [
  "DraGabrielle",
  "DrThauan",
  "DrRafael",
  "NicoliMoreira",
  "CinthiaFerreira",
  "DanielMartins",
  "VanderliFernandes",
  "KailaneSantos",
  "FhellipeMatheus",
  "HeloisaEstag",
  "GabriellyEstag",
  "GiuliaEstag",
];

export const SETORES = ["Recepção", "Iniciais", "Relacionamento"];

// ─── BUSINESS RULES ──────────────────────────────────────────────────────

export function podeAvançarColuna(from: KanbanColuna, to: KanbanColuna, ficha: Partial<FichaOperacional>): { allowed: boolean; reason?: string } {
  // Can always go back to triagem
  if (to === "triagem") return { allowed: true };

  // novo → triagem
  if (from === "novo" && to === ("triagem" as KanbanColuna)) return { allowed: true };

  // triagem → andamento
  if (from === "triagem" && to === ("andamento" as KanbanColuna)) {
    if (ficha.conformidade === "SemViabilidade" || ficha.conformidade === "Desistencia") {
      return { allowed: false, reason: "Conformidade é 'Sem viabilidade' ou 'Desistência'" };
    }
    return { allowed: true };
  }

  // andamento → concluido
  if (from === "andamento" && to === ("concluido" as KanbanColuna)) {
    const hasProcessData = ficha.tipoRequerimento && ficha.dataProtocolo;
    const obsIndicatesCompletion = ficha.observacoes?.toLowerCase().includes("concedido") ||
      ficha.observacoes?.toLowerCase().includes("arquivado") ||
      ficha.observacoes?.toLowerCase().includes("encerrado");
    if (hasProcessData || obsIndicatesCompletion) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: "Tipo de requerimento e data de protocolo devem estar preenchidos, ou observações devem indicar conclusão",
    };
  }

  return { allowed: false, reason: "Progressão não permitida" };
}

export function isBloqueadoMoverAndamento(ficha: Partial<FichaOperacional>): boolean {
  if (ficha.tipoRequerimento === "RequerimentoAdministrativo" && ficha.cadSenha !== "OK") {
    return true;
  }
  return false;
}

export function diasAte_DPP(dpp?: Date): number | undefined {
  if (!dpp) return undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dppDate = new Date(dpp);
  dppDate.setHours(0, 0, 0, 0);
  const diffTime = dppDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function gerarAlertas(ficha: FichaOperacional): string[] {
  const alertas: string[] = [];
  const dias = diasAte_DPP(ficha.smDpp ?? undefined);
  if (dias !== undefined && dias <= 30 && dias >= 0) {
    alertas.push(`DPP próxima — ${dias} dias`);
  }
  if (ficha.conformidade?.includes("Aguardando") && new Date(ficha.createdAt).getTime() < Date.now() - 14 * 24 * 60 * 60 * 1000) {
    alertas.push("Documentação pendente há 14+ dias");
  }
  if ((ficha.observacoes?.toLowerCase().includes("sumiu") || ficha.observacoes?.toLowerCase().includes("sem retorno")) && new Date(ficha.updatedAt).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000) {
    alertas.push("Cliente sem retorno — enviar telegrama");
  }
  if (ficha.natureza === "LEAD" && ficha.coluna === "novo" && new Date(ficha.dataEntrada).getTime() < Date.now() - 14 * 24 * 60 * 60 * 1000) {
    alertas.push("Lead sem avanço — risco de perda");
  }
  if (ficha.cadSenha !== "OK" && ficha.tipoRequerimento === "RequerimentoAdministrativo") {
    alertas.push("CadSenha necessária antes de protocolar");
  }
  return alertas;
}

export const RESPONSAVEL_NOMES: Record<Responsavel, string> = {
  DraGabrielle: "Dra. Gabrielle",
  DrThauan: "Dr. Thauan",
  DrRafael: "Dr. Rafael",
  NicoliMoreira: "Nicoli Moreira",
  CinthiaFerreira: "Cinthia Ferreira",
  DanielMartins: "Daniel Martins",
  VanderliFernandes: "Vanderli Fernandes",
  KailaneSantos: "Kailane Santos",
  FhellipeMatheus: "Fhellipe Matheus",
  HeloisaEstag: "Heloísa (estag.)",
  GabriellyEstag: "Gabrielly (estag.)",
  GiuliaEstag: "Giulia (estag.)",
};
