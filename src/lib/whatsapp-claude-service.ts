import { ClaudeIAService } from "./ia/claude-service";
import { prisma } from "./prisma";
import { logger } from "./logger";

interface WhatsAppMessageParams {
  leadId: string;
  leadPhone: string;
  leadName: string;
  message: string;
}

interface WhatsAppMessageResult {
  response: string;
  especialista?: string;
  status: "continued" | "transferred_to_human";
}

/**
 * Processa mensagem WhatsApp usando Claude API
 * Orquestra entre Marta (recepção) e 4 especialistas
 */
export async function processWhatsAppMessageWithClaude(
  params: WhatsAppMessageParams
): Promise<WhatsAppMessageResult> {
  const { leadId, leadPhone, leadName, message } = params;

  try {
    logger.info("[WhatsApp-Claude] Processando mensagem", {
      leadId,
      phone: leadPhone,
      name: leadName,
    });

    // 1. Buscar ou criar conversa IA
    let conversa = await prisma.iAConversa.findFirst({
      where: {
        iaId: "marta-recepcao",
        participanteId: leadId,
      },
    });

    // 2. Construir histórico
    let historico = [];
    let dadosCliente: Record<string, any> = {};

    if (conversa) {
      historico = (conversa.mensagens as any[]) || [];
      dadosCliente = (conversa.dados as Record<string, any>) || {};
    }

    // 3. Determinar se deve rotear para especialista
    const deveRotearEspecialista = await deveRotarParaEspecialista(
      message,
      dadosCliente,
      historico
    );

    let resposta: string;
    let especialista: string | undefined;

    if (deveRotearEspecialista.deve && deveRotearEspecialista.tipo) {
      // Rotear para especialista
      logger.info("[WhatsApp-Claude] Roteando para especialista", {
        leadId,
        especialista: deveRotearEspecialista.tipo,
      });

      resposta = await ClaudeIAService.obterAnaliseEspecialista(
        deveRotearEspecialista.tipo,
        JSON.stringify(dadosCliente),
        message,
        historico
      );

      especialista = deveRotearEspecialista.tipo;
    } else {
      // Continuar com Marta (recepção)
      resposta = await ClaudeIAService.obterRespostaMarta(message, historico);
      especialista = undefined;
    }

    // 4. Atualizar histórico
    historico.push({
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    });

    historico.push({
      role: "assistant",
      content: resposta,
      timestamp: new Date().toISOString(),
    });

    // 5. Extrair dados do diálogo
    dadosCliente = extrairDadosDoDialogo(message, resposta, dadosCliente);

    // 6. Salvar conversa no banco
    let conversaSalva = await prisma.iAConversa.findFirst({
      where: {
        iaId: "marta-recepcao",
        participanteId: leadId,
      },
    });

    if (conversaSalva) {
      await prisma.iAConversa.update({
        where: { id: conversaSalva.id },
        data: {
          participante: leadName,
          mensagens: historico,
          dados: dadosCliente,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.iAConversa.create({
        data: {
          iaId: "marta-recepcao",
          participante: leadName,
          participanteId: leadId,
          canal: "whatsapp",
          mensagens: historico,
          dados: dadosCliente,
          status: "ativa",
        },
      });
    }

    logger.info("[WhatsApp-Claude] Mensagem processada com sucesso", {
      leadId,
      especialista: especialista || "marta",
    });

    return {
      response: resposta,
      especialista,
      status: "continued",
    };
  } catch (error) {
    logger.error("[WhatsApp-Claude] Erro ao processar mensagem", error);
    return {
      response:
        "Desculpe, tive uma dificuldade técnica. Um atendente humano entrará em contato em breve.",
      status: "transferred_to_human",
    };
  }
}

/**
 * Determina se deve rotear para um especialista
 */
async function deveRotarParaEspecialista(
  message: string,
  dados: Record<string, any>,
  historico: any[]
): Promise<{ deve: boolean; tipo?: string }> {
  const msg = message.toLowerCase();

  // Palavras-chave para detectar tipo de benefício
  const keywords = {
    inss: [
      "inss",
      "aposentadoria",
      "contribuição",
      "tempo de serviço",
      "tempo trabalhado",
    ],
    bpc_loas: ["bpc", "loas", "deficiente", "idoso", "renda familiar"],
    maternidade: [
      "maternidade",
      "gravidez",
      "gestante",
      "licença",
      "parto",
    ],
    acidente: [
      "acidente",
      "trabalho",
      "lesão",
      "deficiência",
      "invalidez",
      "auxílio acidente",
    ],
  };

  for (const [tipo, palavras] of Object.entries(keywords)) {
    if (palavras.some((p) => msg.includes(p))) {
      return { deve: true, tipo };
    }
  }

  // Se já tem 4+ mensagens, considerar rotear
  if (historico.length >= 8) {
    return { deve: true, tipo: "inss" }; // Default para INSS (mais comum)
  }

  return { deve: false };
}

/**
 * Extrai dados relevantes do diálogo
 */
function extrairDadosDoDialogo(
  mensagemUsuario: string,
  respostaMarta: string,
  dadosAtuais: Record<string, any>
): Record<string, any> {
  const dados = { ...dadosAtuais };
  const msg = mensagemUsuario.toLowerCase();

  // Extrair nome
  if (msg.includes("meu nome é") || msg.includes("meu nome é")) {
    const match = mensagemUsuario.match(/meu nome é (\w+)/i);
    if (match) {
      dados.nome = match[1];
    }
  }

  // Extrair idade
  if (msg.includes("anos") || msg.includes("tenho")) {
    const match = mensagemUsuario.match(/(\d{2})\s+anos?/i);
    if (match) {
      dados.idade = parseInt(match[1]);
    }
  }

  // Extrair tempo de contribuição
  if (msg.includes("ano") && msg.includes("contribui")) {
    const match = mensagemUsuario.match(/(\d{2,})\s+anos?/i);
    if (match) {
      dados.tempoContribuicao = parseInt(match[1]);
    }
  }

  // Detectar tipo de benefício
  if (msg.includes("inss") || msg.includes("aposentadoria")) {
    dados.beneficio = "inss";
  } else if (msg.includes("bpc") || msg.includes("loas")) {
    dados.beneficio = "bpc_loas";
  } else if (msg.includes("maternidade")) {
    dados.beneficio = "maternidade";
  } else if (msg.includes("acidente")) {
    dados.beneficio = "acidente";
  }

  // Timestamp do último contato
  dados.ultimoContato = new Date().toISOString();

  return dados;
}

/**
 * Envia resposta via Meta Business API
 */
export async function enviarMensagemMeta({
  phoneNumberId,
  accessToken,
  destinatario,
  mensagem,
}: {
  phoneNumberId: string;
  accessToken: string;
  destinatario: string;
  mensagem: string;
}): Promise<boolean> {
  try {
    logger.info("[Meta] Enviando mensagem", {
      to: destinatario,
      messageLength: mensagem.length,
    });

    const response = await fetch(
      `https://graph.instagram.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: destinatario,
          type: "text",
          text: { preview_url: false, body: mensagem },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      logger.error("[Meta] Erro ao enviar mensagem", {
        status: response.status,
        body: errorData,
      });
      return false;
    }

    logger.info("[Meta] Mensagem enviada com sucesso", { to: destinatario });
    return true;
  } catch (error) {
    logger.error("[Meta] Erro de conexão ao enviar mensagem", error);
    return false;
  }
}

/**
 * Calcula score de viabilidade baseado nos dados coletados
 */
export function calcularScoreViabilidade(dados: Record<string, any>): number {
  let score = 0;

  if (dados.nome) score += 15;
  if (dados.idade) score += 15;
  if (dados.tempoContribuicao) score += 25;
  if (dados.beneficio) score += 20;
  if (dados.ultimoContato) score += 10;
  if (dados.documentacao) score += 15;

  return Math.min(100, score);
}
