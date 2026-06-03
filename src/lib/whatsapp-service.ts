import { prisma } from "./prisma";
import { logger } from "./logger";

interface ProcessMessageParams {
  leadId: string;
  message: string;
  platform: "zapi" | "meta" | "manychat";
  platformContactId?: string;
  phoneNumber?: string;
}

interface ProcessMessageResult {
  response: string;
  status: "continued" | "transferred_to_human";
  reason?: string;
  ticketId?: string;
}

/**
 * Processa mensagem WhatsApp chamando o Super Agent Python
 * Este é o ponto central onde a IA é invocada
 */
export async function processWhatsAppMessage(
  params: ProcessMessageParams
): Promise<ProcessMessageResult> {
  const {
    leadId,
    message,
    platform,
    platformContactId,
    phoneNumber,
  } = params;

  try {
    logger.info("[WhatsApp] Processando mensagem", {
      leadId,
      platform,
      messageLength: message.length,
    });

    // 1. Buscar lead para obter legal_area
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      logger.error("[WhatsApp] Lead não encontrado", { leadId });
      return {
        response:
          "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.",
        status: "continued",
      };
    }

    // 2. Buscar conversa existente (histórico)
    let conversation = await prisma.whatsAppConversation.findFirst({
      where: {
        leadId,
        platform,
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Preparar histórico
    let conversationHistory = [];
    if (conversation?.conversationHistory) {
      conversationHistory = conversation.conversationHistory as any[];
    }

    // 4. Determinar área jurídica
    const legalArea = lead.legalArea?.toLowerCase() || "other";

    // 5. Buscar roteiro (system prompt)
    const routine = await prisma.whatsAppRoutine.findUnique({
      where: { legalArea },
    });

    if (!routine || !routine.active) {
      logger.warn("[WhatsApp] Roteiro não encontrado", {
        legalArea,
        leadId,
      });
      return {
        response:
          "Desculpe, não temos especialista disponível para sua área de consulta.",
        status: "continued",
      };
    }

    logger.info("[WhatsApp] Roteiro carregado", {
      legalArea,
      systemPromptLength: routine.systemPrompt.length,
    });

    // 6. Chamar Super Agent Python
    const agentResult = await callSuperAgent({
      leadId,
      userMessage: message,
      systemPrompt: routine.systemPrompt,
      conversationHistory,
      legalArea,
    });

    // 7. Salvar/atualizar conversa
    if (!conversation) {
      conversation = await prisma.whatsAppConversation.create({
        data: {
          leadId,
          platform,
          platformContactId,
          phoneNumber,
          legalArea,
          conversationHistory: agentResult.conversationHistory,
          status: agentResult.status,
          transferredToHumanAt:
            agentResult.status === "transferred_to_human"
              ? new Date()
              : null,
        },
      });
    } else {
      conversation = await prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data: {
          conversationHistory: agentResult.conversationHistory,
          status: agentResult.status,
          transferredToHumanAt:
            agentResult.status === "transferred_to_human"
              ? new Date()
              : conversation.transferredToHumanAt,
        },
      });
    }

    // 8. Se transferido para humano, criar ticket
    let ticketId: string | undefined;
    if (agentResult.status === "transferred_to_human") {
      const ticket = await prisma.whatsAppHumanTicket.create({
        data: {
          conversationId: conversation.id,
          leadId,
          reason: agentResult.reason || "Transferência automática da IA",
          priority: agentResult.priority || "normal",
          status: "pending",
        },
      });
      ticketId = ticket.id;

      logger.info("[WhatsApp] Ticket criado", {
        ticketId,
        leadId,
        reason: agentResult.reason,
      });

      // TODO: Notificar atendentes (enviar email, push, etc)
      // await notifyAttendants(ticket);
    }

    logger.info("[WhatsApp] Mensagem processada com sucesso", {
      leadId,
      status: agentResult.status,
      ticketId,
    });

    return {
      response: agentResult.response,
      status: agentResult.status,
      reason: agentResult.reason,
      ticketId,
    };
  } catch (error) {
    logger.error("[WhatsApp] Erro ao processar mensagem", error);
    return {
      response:
        "Desculpe, ocorreu um erro. Por favor, tente novamente em alguns instantes.",
      status: "continued",
    };
  }
}

interface SuperAgentResult {
  response: string;
  conversationHistory: any[];
  status: "continued" | "transferred_to_human";
  reason?: string;
  priority?: "low" | "normal" | "high";
}

/**
 * Chama o Super Agent Python via API local ou subprocess
 * TODO: Implementar comunicação com backend Python
 */
async function callSuperAgent({
  leadId,
  userMessage,
  systemPrompt,
  conversationHistory,
  legalArea,
}: {
  leadId: string;
  userMessage: string;
  systemPrompt: string;
  conversationHistory: any[];
  legalArea: string;
}): Promise<SuperAgentResult> {
  try {
    // ============ OPÇÃO 1: Via API REST (recomendado para produção) ============
    // const response = await fetch("http://localhost:8000/api/agent/chat", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     lead_id: leadId,
    //     user_message: userMessage,
    //     system_prompt: systemPrompt,
    //     conversation_history: conversationHistory,
    //     legal_area: legalArea,
    //   }),
    // });
    // const result = await response.json();
    // return result;

    // ============ OPÇÃO 2: Simular resposta (para testes sem Python) ============
    // Simulação para testes até o backend Python estar pronto
    logger.info("[SuperAgent] Simulando resposta (Python não conectado)", {
      leadId,
      legalArea,
    });

    // Adicionar mensagem do usuário ao histórico
    conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    // Simular resposta baseado na área jurídica
    let simulatedResponse = "";

    if (legalArea === "previdenciario") {
      simulatedResponse = `Obrigado por entrar em contato conosco.\n\nVejo que você tem interesse em Direito Previdenciário. Para melhor atendê-lo, vou transferir sua solicitação para um especialista em benefícios previdenciários que poderá avaliar seu caso em detalhes.\n\nUm atendente especializadoentraráconsígoembreve. Aguarde por favor.`;
    } else if (legalArea === "familia") {
      simulatedResponse = `Olá! Entendi que você precisa de orientação em Direito da Família.\n\nVou transferir seu caso para um especialista que poderá analisar sua situação com atenção e discretion.\n\nEm breve, um atendente entrarará em contato. Agradecemos sua paciência.`;
    } else {
      simulatedResponse = `Agradeço por sua mensagem. Vou transferir você para um especialista que poderá ajudá-lo da melhor forma possível.\n\nEm breve, você será atendido por um profissional qualificado.`;
    }

    // Adicionar resposta ao histórico
    conversationHistory.push({
      role: "assistant",
      content: simulatedResponse,
    });

    // Simular decisão de transferência
    // Em produção, isso virá do loop agêntico do Python
    const shouldTransfer = true; // Simular transferência

    return {
      response: simulatedResponse,
      conversationHistory,
      status: shouldTransfer ? "transferred_to_human" : "continued",
      reason: shouldTransfer
        ? `Cliente transferido para especialista em ${legalArea}`
        : undefined,
      priority: "normal",
    };
  } catch (error) {
    logger.error("[SuperAgent] Erro ao chamar Super Agent", error);

    // Fallback: resposta padrão e transferência para humano
    conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    conversationHistory.push({
      role: "assistant",
      content:
        "Desculpe, tive uma dificuldade técnica. Vou transferir você para um atendente que poderá ajudá-lo.",
    });

    return {
      response:
        "Desculpe, tive uma dificuldade técnica. Vou transferir você para um atendente que poderá ajudá-lo.",
      conversationHistory,
      status: "transferred_to_human",
      reason: "Erro ao processar mensagem na IA",
      priority: "normal",
    };
  }
}

/**
 * Envia mensagem de teste para validar integração
 * Útil para testes dos webhooks
 */
export async function sendTestMessage(
  platform: "zapi" | "meta" | "manychat",
  phone: string
): Promise<void> {
  logger.info("[WhatsApp] Enviando mensagem de teste", { platform, phone });

  const integration = await prisma.whatsAppIntegration.findFirst({
    where: { platform, active: true },
  });

  if (!integration) {
    throw new Error(`${platform} não configurada`);
  }

  // Implementar envio conforme plataforma
  // TODO: Completar implementação
}
