import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processWhatsAppMessage } from "@/lib/whatsapp-service";
import { logger } from "@/lib/logger";
import crypto from "crypto";

/**
 * Webhook para receber mensagens via Meta Business API (WhatsApp Cloud API)
 * POST /api/webhooks/whatsapp/meta
 *
 * Payload esperado (Meta):
 * {
 *   "object": "whatsapp_business_account",
 *   "entry": [{
 *     "changes": [{
 *       "field": "messages",
 *       "value": {
 *         "messages": [{
 *           "from": "5585988123456",
 *           "type": "text",
 *           "text": { "body": "Olá" }
 *         }],
 *         "contacts": [{
 *           "profile": { "name": "João Silva" }
 *         }],
 *         "metadata": {
 *           "phone_number_id": "xxx",
 *           "display_phone_number": "55 85 98812-3456"
 *         }
 *       }
 *     }]
 *   }]
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const payload = JSON.parse(body);

    // 1. Validar assinatura
    const signature = request.headers.get("x-hub-signature-256") || "";
    if (!verifyMetaSignature(body, signature)) {
      logger.warn("[Webhook] Assinatura Meta inválida");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    logger.info("[Webhook] Meta recebido e validado");

    // 2. Extrair mensagens
    const messages = extractMetaMessages(payload);

    if (messages.length === 0) {
      logger.info("[Webhook] Nenhuma mensagem de texto no payload");
      return NextResponse.json({ success: true }); // Meta quer 200 rapidinho
    }

    // 3. Processar cada mensagem
    for (const msg of messages) {
      const { from, name, messageText } = msg;

      // Buscar ou criar Lead
      let lead = await prisma.lead.findFirst({
        where: { phone: from },
      });

      if (!lead) {
        lead = await prisma.lead.create({
          data: {
            phone: from,
            name: name || "WhatsApp User",
            funnelStage: "new_lead",
            originChannel: "other",
          },
        });
        logger.info("[Webhook] Novo lead criado", { leadId: lead.id, phone: from });
      }

      // Processar com Super Agent
      const result = await processWhatsAppMessage({
        leadId: lead.id,
        message: messageText,
        platform: "meta",
        platformContactId: from,
        phoneNumber: from,
      });

      // Responder via Meta
      const integration = await prisma.whatsAppIntegration.findFirst({
        where: { platform: "meta", active: true },
      });

      if (integration) {
        await sendMetaMessage({
          accessToken: integration.apiKey!,
          phoneNumberId: integration.phoneNumberId!,
          to: from,
          message: result.response,
        });
      }

      if (result.status === "transferred_to_human") {
        logger.info("[Webhook] Lead transferido para humano", {
          leadId: lead.id,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("[Webhook] Erro ao processar Meta", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET para validar webhook (Meta requer validação)
 */
export async function GET(request: NextRequest) {
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  const token = request.nextUrl.searchParams.get("hub.verify_token");

  if (token !== verifyToken) {
    logger.warn("[Webhook] Token Meta inválido");
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  logger.info("[Webhook] Meta webhook validado");
  return NextResponse.json(challenge);
}

/**
 * Verifica assinatura do webhook Meta
 */
function verifyMetaSignature(body: string, signature: string): boolean {
  const secret = process.env.META_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn("[Meta] META_WEBHOOK_SECRET não configurada");
    return false;
  }

  const hash = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const expectedSignature = `sha256=${hash}`;
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Extrai mensagens de texto do payload Meta
 */
function extractMetaMessages(
  payload: any
): Array<{ from: string; name: string; messageText: string }> {
  const messages: Array<{ from: string; name: string; messageText: string }> =
    [];

  try {
    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (changes?.field !== "messages") {
      return messages;
    }

    const incomingMessages = value?.messages || [];
    const contacts = value?.contacts || [];

    for (const msg of incomingMessages) {
      if (msg.type === "text" && msg.text?.body) {
        const contactName =
          contacts.find((c: any) => c.wa_id === msg.from)?.profile?.name || "";

        messages.push({
          from: msg.from,
          name: contactName,
          messageText: msg.text.body,
        });
      }
    }
  } catch (error) {
    logger.error("[Meta] Erro ao extrair mensagens", error);
  }

  return messages;
}

/**
 * Envia mensagem via Meta Business API
 */
async function sendMetaMessage({
  accessToken,
  phoneNumberId,
  to,
  message,
}: {
  accessToken: string;
  phoneNumberId: string;
  to: string;
  message: string;
}): Promise<void> {
  try {
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
          to,
          type: "text",
          text: { preview_url: false, body: message },
        }),
      }
    );

    if (!response.ok) {
      logger.warn("[Meta] Erro ao enviar mensagem", {
        status: response.status,
        to,
      });
    } else {
      logger.info("[Meta] Mensagem enviada com sucesso", { to });
    }
  } catch (error) {
    logger.error("[Meta] Erro de conexão", error);
  }
}
