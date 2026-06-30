import { ConversaLead, ResultadoOrquestracao, TipoBeneficio } from "@/types/ia-system";

/**
 * Orquestrador: Analisa a conversa e direciona para o especialista correto
 */
export function analisarERotearLead(conversa: ConversaLead): ResultadoOrquestracao {
  // Extrair informações chave da conversa
  const ultimaMensagem = conversa.mensagens[conversa.mensagens.length - 1];
  const conteudoLead = ultimaMensagem.conteudo.toLowerCase();

  // Detectar tipo de benefício mencionado
  const tipoBeneficio = detectarTipoBeneficio(conteudoLead);
  const score = calcularScoreLead(conversa);
  const viabilidade = avaliarViabilidade(conversa, tipoBeneficio);

  // Lógica de roteamento
  if (conversa.etapaAtual === "recepcao" && !conversa.primeiroNome) {
    return {
      proximoAgente: "marta",
      motivo: "Aguardando coleta de nome",
      score,
      dadosColetados: conversa.dados
    };
  }

  if (!tipoBeneficio || tipoBeneficio === "nao_identificado") {
    return {
      proximoAgente: "marta",
      motivo: "Tipo de benefício não identificado, Marta fará novas perguntas",
      score,
      dadosColetados: conversa.dados
    };
  }

  if (viabilidade === "inviavel") {
    return {
      proximoAgente: "encerrar",
      motivo: `Caso não viável para ${tipoBeneficio}. Encaminhando para análise humana.`,
      score,
      dadosColetados: conversa.dados
    };
  }

  // Rotear para especialista
  return {
    proximoAgente: tipoBeneficio,
    motivo: `Lead qualificado para ${tipoBeneficio}`,
    score,
    dadosColetados: conversa.dados
  };
}

function detectarTipoBeneficio(texto: string): TipoBeneficio {
  // Palavras-chave para cada tipo de benefício
  const palavrasChave: Record<TipoBeneficio, string[]> = {
    inss: ["aposentadoria", "inss", "contribuinte", "segurado", "contribuição"],
    bpc_loas: ["deficiência", "deficiente", "idoso", "65 anos", "incapaz", "bpc", "loas"],
    salario_maternidade: ["maternidade", "grávida", "gestante", "filho", "bebê", "parto"],
    auxilio_acidente: ["acidente", "sequela", "ferimento", "incapacidade", "trabalho"],
    pensao_morte: ["morte", "falecimento", "viúvo", "dependente", "herdeiro"],
    desemprego: ["desemprego", "demissão", "demitido", "sem emprego", "trabalho"],
    nao_identificado: []
  };

  for (const [tipo, palavras] of Object.entries(palavrasChave)) {
    if (palavras.some(p => texto.includes(p))) {
      return tipo as TipoBeneficio;
    }
  }

  return "nao_identificado";
}

function calcularScoreLead(conversa: ConversaLead): number {
  let score = 0;

  // Pontos por informações coletadas
  if (conversa.primeiroNome) score += 10;
  if (conversa.dados.idade) score += 15;
  if (conversa.dados.tempoTrabalho) score += 15;
  if (conversa.dados.situacao) score += 20;
  if (conversa.dados.documentacao) score += 15;
  if (conversa.dados.contato) score += 15;
  if (conversa.tipoBeneficio && conversa.tipoBeneficio !== "nao_identificado") score += 10;

  return Math.min(score, 100);
}

function avaliarViabilidade(
  conversa: ConversaLead,
  tipoBeneficio: TipoBeneficio
): "viavel" | "talvez" | "inviavel" | "pendente" {
  // Lógica de viabilidade por tipo
  const regrasViabilidade: Record<TipoBeneficio, (dados: any) => "viavel" | "talvez" | "inviavel"> = {
    inss: (dados) => {
      if (dados.tempoTrabalho && dados.tempoTrabalho >= 15) return "viavel";
      if (dados.tempoTrabalho && dados.tempoTrabalho >= 10) return "talvez";
      return "inviavel";
    },
    bpc_loas: (dados) => {
      if ((dados.deficiente || dados.idoso) && dados.rendam_familiar_baixa) return "viavel";
      if (dados.deficiente || dados.idoso) return "talvez";
      return "inviavel";
    },
    salario_maternidade: (dados) => {
      if (dados.gestante_ou_mae && dados.contribuinte) return "viavel";
      if (dados.gestante_ou_mae) return "talvez";
      return "inviavel";
    },
    auxilio_acidente: (dados) => {
      if (dados.acidente && dados.sequela) return "viavel";
      if (dados.acidente) return "talvez";
      return "inviavel";
    },
    pensao_morte: (dados) => {
      if (dados.falecido_segurado && dados.dependente) return "viavel";
      if (dados.falecido_segurado) return "talvez";
      return "inviavel";
    },
    desemprego: (dados) => {
      if (dados.demitido && dados.tempo_desemprego < 2) return "viavel";
      return "talvez";
    },
    nao_identificado: () => "talvez"
  };

  const avaliador = regrasViabilidade[tipoBeneficio];
  return avaliador ? avaliador(conversa.dados) : "talvez";
}
