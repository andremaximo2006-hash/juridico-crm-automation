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
          status: (agentResult.status === "transferred_to_human" ? "transferred" : "active") as any,
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
          status: (agentResult.status === "transferred_to_human" ? "transferred" : "active") as any,
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
 * Chama o Super Agent Python via API REST
 * Conecta ao servidor FastAPI em localhost:8000
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
    // ============ CHAMAR BACKEND PYTHON REAL ============
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

    logger.info("[SuperAgent] Chamando backend Python", {
      leadId,
      legalArea,
      url: pythonBackendUrl,
    });

    const response = await fetch(`${pythonBackendUrl}/process-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: leadId,
        phone: "",
        message: userMessage,
        legal_area: legalArea,
        conversation_history: conversationHistory,
        system_prompt: systemPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    logger.info("[SuperAgent] Resposta recebida do backend", {
      leadId,
      status: result.status,
      responseLength: result.response.length,
    });

    return {
      response: result.response,
      conversationHistory: result.conversation_history || conversationHistory,
      status: result.status || "continued",
      reason: result.reason,
      priority: result.priority,
    };
  } catch (error) {
    logger.error("[SuperAgent] Erro ao chamar backend Python", {
      error: String(error),
      leadId,
      legalArea,
    });

    // Fallback: resposta padrão e transferência para humano
    // (Quando backend está offline)
    conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    const fallbackMessage =
      "Desculpe, tive uma dificuldade técnica. Vou transferir você para um atendente que poderá ajudá-lo.";

    conversationHistory.push({
      role: "assistant",
      content: fallbackMessage,
    });

    return {
      response: fallbackMessage,
      conversationHistory,
      status: "transferred_to_human",
      reason: "Erro ao conectar ao Super Agent Python",
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
