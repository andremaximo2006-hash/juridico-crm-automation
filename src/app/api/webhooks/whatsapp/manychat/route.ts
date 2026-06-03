import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processWhatsAppMessage } from "@/lib/whatsapp-service";
import { logger } from "@/lib/logger";

/**
 * Webhook para receber mensagens via ManyChat
 * POST /api/webhooks/whatsapp/manychat
 *
 * Payload esperado (ManyChat):
 * {
 *   "event": "message",
 *   "subscriber": {
 *     "id": "5085988123456",
 *     "first_name": "João",
 *     "last_name": "Silva",
 *     "phone": "+55 85 98812-3456"
 *   },
 *   "message": {
 *     "id": "msg_xxx",
 *     "type": "text",
 *     "text": "Olá, tudo bem?",
 *     "created_at": 1234567890
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    logger.info("[Webhook] ManyChat recebido", {
      subscriberId: payload.subscriber?.id,
      event: payload.event,
    });

    // 1. Validar token (implementar com API key do BD)
    const apiKey = request.headers.get("authorization")?.replace("Bearer ", "");
    const integration = await prisma.whatsAppIntegration.findFirst({
      where: {
        platform: "manychat",
        active: true,
        apiKey,
      },
    });

    if (!integration) {
      logger.warn("[Webhook] ManyChat API key inválida");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Processar apenas eventos de mensagem
    if (payload.event !== "message") {
      logger.info("[Webhook] ManyChat evento ignorado", {
        event: payload.event,
      });
      return NextResponse.json({ success: true });
    }

    // 3. Extrair dados
    const { subscriber, message } = payload;

    if (!subscriber || !message?.text) {
      logger.warn("[Webhook] Dados incompletos do ManyChat");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 4. Extrair telefone e limpar
    let phone = subscriber.phone || subscriber.id || "";
    phone = phone.replace(/\D/g, ""); // Remove caracteres não-numéricos

    if (!phone) {
      logger.warn("[Webhook] Telefone inválido do ManyChat", {
        original: subscriber.phone,
      });
      return NextResponse.json(
        { error: "Invalid phone" },
        { status: 400 }
      );
    }

    // 5. Buscar ou criar Lead
    let lead = await prisma.lead.findFirst({
      where: { phone },
    });

    if (!lead) {
      const fullName = `${subscriber.first_name || ""} ${
        subscriber.last_name || ""
      }`.trim();

      lead = await prisma.lead.create({
        data: {
          phone,
          name: fullName || "WhatsApp User",
          funnelStage: "new_lead",
          originChannel: "other",
        },
      });
      logger.info("[Webhook] Novo lead criado", { leadId: lead.id, phone });
    }

    // 6. Processar mensagem com Super Agent
    const result = await processWhatsAppMessage({
      leadId: lead.id,
      message: message.text,
      platform: "manychat",
      platformContactId: subscriber.id,
      phoneNumber: phone,
    });

    // 7. Responder via ManyChat
    await sendManychatMessage({
      accessToken: integration.apiKey!,
      subscriberId: subscriber.id,
      message: result.response,
    });

    if (result.status === "transferred_to_human") {
      logger.info("[Webhook] Lead transferido para humano", {
        leadId: lead.id,
      });
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    logger.error("[Webhook] Erro ao processar ManyChat", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Envia mensagem via ManyChat
 */
async function sendManychatMessage({
  accessToken,
  subscriberId,
  message,
}: {
  accessToken: string;
  subscriberId: string;
  message: string;
}): Promise<void> {
  try {
    const response = await fetch(
      "https://api.manychat.com/v1/subscriber/sendText",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriber_id: subscriberId,
          text: message,
        }),
      }
    );

    if (!response.ok) {
      logger.warn("[ManyChat] Erro ao enviar mensagem", {
        status: response.status,
        subscriberId,
      });
    } else {
      logger.info("[ManyChat] Mensagem enviada com sucesso", {
        subscriberId,
      });
    }
  } catch (error) {
    logger.error("[ManyChat] Erro de conexão", error);
  }
}
