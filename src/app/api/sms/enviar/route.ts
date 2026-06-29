import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });
    }

    const campanha = await prisma.sMSCampanha.findUnique({
      where: { id: campaignId },
      include: { template: true }
    });

    if (!campanha) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Atualizar status para "enviando"
    await prisma.sMSCampanha.update({
      where: { id: campaignId },
      data: { status: "enviando" }
    });

    // Criar mensagens para cada telefone
    const mensagens = await Promise.all(
      campanha.telefones.map((telefone: string) =>
        prisma.sMSMensagem.create({
          data: {
            campaignId,
            templateId: campanha.templateId,
            paraNumero: telefone,
            status: "enviando"
          }
        })
      )
    );

    // TODO: Integrar com Twilio/AWS SNS para enviar de verdade
    // Por enquanto apenas simulamos o envio

    // Atualizar status para "enviado"
    await prisma.sMSCampanha.update({
      where: { id: campaignId },
      data: {
        status: "enviado",
        enviadoEm: new Date(),
        enviados: mensagens.length,
        entregues: Math.floor(mensagens.length * 0.95) // Simular 95% de entrega
      }
    });

    // Atualizar mensagens
    await prisma.sMSMensagem.updateMany({
      where: { campaignId },
      data: { status: "enviado", enviadoEm: new Date() }
    });

    return NextResponse.json({
      success: true,
      campaignId,
      totalEnviados: mensagens.length
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
