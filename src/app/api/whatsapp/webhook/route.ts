import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Verificar assinatura do webhook (segurança)
function verifyWebhookSignature(req: any, token: string): boolean {
  const signature = req.headers.get("x-hub-signature-256");
  if (!signature) return false;

  const payload = JSON.stringify(req.body);
  const hash = crypto
    .createHmac("sha256", token)
    .update(payload)
    .digest("hex");

  return signature === `sha256=${hash}`;
}

// GET - Para validação inicial do webhook (WhatsApp envia este request primeiro)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Verificar token (deve ser o mesmo configurado no painel WhatsApp Business)
  const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_TOKEN || "seu_token_aqui";

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.text(challenge);
  }

  return NextResponse.json({ error: "Invalid token" }, { status: 403 });
}

// POST - Receber mensagens de verdade do WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar assinatura (comentado por enquanto, descomentar em produção)
    // const WEBHOOK_SIGNATURE_TOKEN = process.env.WHATSAPP_WEBHOOK_SIGNATURE || "token";
    // if (!verifyWebhookSignature(request, WEBHOOK_SIGNATURE_TOKEN)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    // }

    // Processar entrada (webhooks do WhatsApp vêm em formato específico)
    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === "messages") {
            const value = change.value;

            // Extrair dados da mensagem recebida
            const messages = value.messages || [];
            const contacts = value.contacts || [];
            const phoneNumberId = value.metadata?.phone_number_id;

            for (const message of messages) {
              const from = message.from; // WhatsApp ID do cliente
              const messageId = message.id;
              const timestamp = message.timestamp;
              const type = message.type; // text, image, document, etc

              // Extrair texto dependendo do tipo
              let textContent = "";
              if (type === "text") {
                textContent = message.text?.body || "";
              } else if (type === "interactive") {
                textContent = message.interactive?.button_reply?.text || "";
              }

              console.log(`📨 WhatsApp Message Received:`);
              console.log(`  From: ${from}`);
              console.log(`  Text: ${textContent}`);
              console.log(`  Type: ${type}`);
              console.log(`  ID: ${messageId}`);

              // TODO: Integrar com IA para processar a mensagem
              // Exemplo: chamar função de IA para gerar resposta automática

              // Por enquanto, apenas logamos
              await prisma.whatsAppConversation.create({
                data: {
                  conversationId: `wa_${from}`,
                  senderWaId: from,
                  messageText: textContent,
                  messageType: type,
                  messageId,
                  isIncoming: true,
                  metadata: {
                    phoneNumberId,
                    timestamp,
                    type
                  }
                }
              }).catch(() => {
                // Tabela pode não existir em ambiente local, apenas logar
                console.log("Mensagem recebida (sem persistência local)");
              });
            }

            // Processar status de entrega/leitura
            const statuses = value.statuses || [];
            for (const status of statuses) {
              console.log(`📌 WhatsApp Status Update:`);
              console.log(`  Message ID: ${status.id}`);
              console.log(`  Status: ${status.status}`);
              console.log(`  Timestamp: ${status.timestamp}`);

              // TODO: Atualizar status da mensagem no banco de dados
            }
          }
        }
      }
    }

    // Responder imediatamente (WhatsApp espera resposta 200 em 30 segundos)
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
