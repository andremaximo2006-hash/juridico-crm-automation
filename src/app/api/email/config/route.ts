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
      apiKey,
      fromEmail,
      fromName,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      webhookUrl
    } = body;

    if (!provider || !fromEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Desativar configs anteriores do mesmo provider
    await prisma.emailConfig.updateMany({
      where: { provider },
      data: { isAtivo: false }
    });

    const config = await prisma.emailConfig.create({
      data: {
        provider,
        apiKey,
        fromEmail,
        fromName,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        webhookUrl,
        isAtivo: true
      }
    });

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
