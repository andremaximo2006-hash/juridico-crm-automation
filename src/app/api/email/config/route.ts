import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const config = await prisma.emailConfig.findFirst({
      where: { isAtivo: true },
      select: {
        id: true,
        provider: true,
        fromEmail: true,
        fromName: true,
        isAtivo: true,
        webhookUrl: true
        // Não retornar chaves privadas
      }
    });

    return NextResponse.json(config || { error: "No config found" });
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
      provider,
      fromEmail,
      fromName,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      sendgridApiKey,
      webhookUrl
    } = body;

    if (!provider || !fromEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validação por provider
    if (provider === 'smtp' && (!smtpHost || !smtpUser || !smtpPassword)) {
      return NextResponse.json({ error: "SMTP credentials required" }, { status: 400 });
    }

    if (provider === 'sendgrid' && !sendgridApiKey) {
      return NextResponse.json({ error: "SendGrid API Key required" }, { status: 400 });
    }

    // Desativar configs anteriores
    await prisma.emailConfig.updateMany({
      where: { isAtivo: true },
      data: { isAtivo: false }
    });

    const config = await prisma.emailConfig.create({
      data: {
        provider,
        apiKey: sendgridApiKey || smtpPassword,
        fromEmail,
        fromName,
        smtpHost,
        smtpPort: smtpPort ? parseInt(smtpPort) : null,
        smtpUser,
        smtpPassword,
        webhookUrl,
        isAtivo: true
      }
    });

    return NextResponse.json({ message: "Config saved successfully", config }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
