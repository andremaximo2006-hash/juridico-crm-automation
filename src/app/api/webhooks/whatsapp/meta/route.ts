import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  processWhatsAppMessageWithClaude,
  enviarMensagemMeta,
} from "@/lib/whatsapp-claude-service";
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

      // Processar com Claude IA (Marta + 4 Especialistas)
      const result = await processWhatsAppMessageWithClaude({
        leadId: lead.id,
        leadPhone: from,
        leadName: name || lead.name,
        message: messageText,
      });

      // Responder via Meta
      const integration = await prisma.whatsAppIntegration.findFirst({
        where: { platform: "meta", active: true },
      });

      if (integration) {
        await enviarMensagemMeta({
          phoneNumberId: integration.phoneNumberId!,
          accessToken: integration.apiKey!,
          destinatario: from,
          mensagem: result.response,
        });
      }

      if (result.status === "transferred_to_human") {
        logger.info("[Webhook] Lead transferido para humano", {
          leadId: lead.id,
        });
      }

      if (result.especialista) {
        logger.info("[Webhook] Lead rotado para especialista", {
          leadId: lead.id,
          especialista: result.especialista,
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

