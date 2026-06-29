import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { conversationId, roteiroId } = await request.json();

    const roteiro = await prisma.whatsAppRoteiro.findUnique({
      where: { id: roteiroId },
      include: { steps: { orderBy: { order: "asc" } } }
    });

    if (!roteiro) return NextResponse.json({ error: "Roteiro not found" }, { status: 404 });

    const primeiroStep = roteiro.steps[0];

    // Criar conversa
    const conversa = await prisma.whatsAppConversation.create({
      data: {
        leadId: "temp_lead_" + Date.now(),
        roteiroId: roteiroId,
        canal: "custom",
        conversationHistory: [{ role: "assistant", content: primeiroStep.pergunta }]
      }
    });

    // Criar qualificação
    await prisma.whatsAppQualificacao.create({
      data: {
        conversationId: conversa.id,
        dados: { currentStep: 1 },
        score: 0,
        viabilidade: "pendente"
      }
    });

    return NextResponse.json({
      conversationId: conversa.id,
      pergunta: primeiroStep.pergunta,
      passo: 1,
      totalPassos: roteiro.steps.length
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
