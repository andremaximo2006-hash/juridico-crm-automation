import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Store config in memory for this session
const configs = new Map();

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const config = configs.get("whatsapp") || {
      webhookToken: process.env.WHATSAPP_WEBHOOK_TOKEN,
      webhookSignature: process.env.WHATSAPP_WEBHOOK_SIGNATURE,
      businessPhoneId: process.env.WHATSAPP_BUSINESS_PHONE_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      webhookUrl: "https://crm.gabriellenunes.com.br/api/whatsapp/webhook"
    };

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      webhookToken,
      webhookSignature,
      businessPhoneId,
      accessToken,
      webhookUrl
    } = body;

    if (!webhookToken || !webhookSignature || !businessPhoneId || !accessToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const config = {
      webhookToken,
      webhookSignature,
      businessPhoneId,
      accessToken,
      webhookUrl
    };

    configs.set("whatsapp", config);

    // Atualizar variáveis de ambiente
    process.env.WHATSAPP_WEBHOOK_TOKEN = webhookToken;
    process.env.WHATSAPP_WEBHOOK_SIGNATURE = webhookSignature;
    process.env.WHATSAPP_BUSINESS_PHONE_ID = businessPhoneId;
    process.env.WHATSAPP_ACCESS_TOKEN = accessToken;

    return NextResponse.json({ message: "Config saved successfully", config }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
