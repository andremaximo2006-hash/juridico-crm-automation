import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processWhatsAppMessage } from "@/lib/whatsapp-service";
import { logger } from "@/lib/logger";

/**
 * Webhook para receber mensagens via Z-API
 * POST /api/webhooks/whatsapp/zapi
 *
 * Payload esperado (Z-API):
 * {
 *   "phone": "5585988123456",
 *   "name": "João Silva",
 *   "message": "Olá, tudo bem?",
 *   "timestamp": 1234567890,
 *   "instanceId": "123456"
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    logger.info("[Webhook] Z-API recebido", {
      phone: payload.phone,
      message: payload.message?.substring(0, 50),
    });

    // 1. Validar assinatura (implementar com webhook_secret do BD)
    const integration = await prisma.whatsAppIntegration.findFirst({
      where: {
        platform: "zapi",
        active: true,
      },
    });

    if (!integration) {
      logger.warn("[Webhook] Z-API não configurada");
      return NextResponse.json(
        { error: "Z-API not configured" },
        { status: 400 }
      );
    }

    // 2. Extrair dados
    const { phone, name: senderName, message, instanceId } = payload;

    if (!phone || !message) {
      logger.warn("[Webhook] Dados incompletos", { phone, message });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 3. Buscar ou criar Lead
    let lead = await prisma.lead.findFirst({
      where: { phone },
    });

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          phone,
          name: senderName || "WhatsApp User",
          funnelStage: "new_lead",
          originChannel: "other",
        },
      });
      logger.info("[Webhook] Novo lead criado", { leadId: lead.id, phone });
    }

    // 4. Processar mensagem com Super Agent
    const result = await processWhatsAppMessage({
      leadId: lead.id,
      message,
      platform: "zapi",
      platformContactId: phone,
      phoneNumber: phone,
    });

    // 5. Responder via Z-API
    if (result.status === "continued") {
      await sendZapiMessage({
        apiKey: integration.apiKey!,
        instanceId: integration.instanceId!,
        phone,
        message: result.response,
      });
    } else if (result.status === "transferred_to_human") {
      // Mensagem de transferência
      await sendZapiMessage({
        apiKey: integration.apiKey!,
        instanceId: integration.instanceId!,
        phone,
        message: result.response,
      });
      logger.info("[Webhook] Lead transferido para humano", {
        leadId: lead.id,
        reason: result.reason,
      });
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    logger.error("[Webhook] Erro ao processar Z-API", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Envia mensagem via Z-API
 */
async function sendZapiMessage({
  apiKey,
  instanceId,
  phone,
  message,
}: {
  apiKey: string;
  instanceId: string;
  phone: string;
  message: string;
}): Promise<void> {
  try {
    const response = await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${apiKey}/send-message`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          message,
          phoneRelay: false,
        }),
      }
    );

    if (!response.ok) {
      logger.warn("[Z-API] Erro ao enviar mensagem", {
        status: response.status,
        phone,
      });
    } else {
      logger.info("[Z-API] Mensagem enviada com sucesso", { phone });
    }
  } catch (error) {
    logger.error("[Z-API] Erro de conexão", error);
  }
}

/**
 * GET para validar webhook (Z-API pode validar)
 */
export async function GET(request: NextRequest) {
  logger.info("[Webhook] GET request para Z-API");
  return NextResponse.json({ status: "ok" });
}
