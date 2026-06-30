import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calcularScore } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { conversationId, resposta } = await request.json();

    const conversa = await prisma.whatsAppConversation.findUnique({
      where: { id: conversationId },
      include: { roteiro: { include: { steps: true } } }
    });

    if (!conversa) return NextResponse.json({ error: "Conversa not found" }, { status: 404 });

    const qualificacao = await prisma.whatsAppQualificacao.findUnique({
      where: { conversationId: conversationId }
    });

    if (!qualificacao) return NextResponse.json({ error: "Qualificação not found" }, { status: 404 });

    const roteiro = conversa.roteiro!;
    const steps = roteiro.steps.sort((a, b) => a.order - b.order);
    const dadosAny = qualificacao.dados as any;
    const currentStep = dadosAny.currentStep || 1;
    const proximoStep = currentStep + 1;

    const novosDados = {
      ...dadosAny,
      [`step_${currentStep}`]: resposta,
      currentStep: proximoStep
    };

    if (proximoStep > steps.length) {
      // Fim do roteiro - calcular score
      const score = calcularScore(novosDados);

      await prisma.whatsAppQualificacao.update({
        where: { id: qualificacao.id },
        data: {
          dados: novosDados,
          score: score.totalScore,
          viabilidade: score.viabilidade as any,
          motivo: score.motivo
        }
      });

      // Se viável, criar ticket
      if (score.viabilidade === "viavel") {
        const lead = await prisma.lead.findFirst({
          where: { phone: novosDados.telefone || "" }
        });

        if (!lead) {
          await prisma.lead.create({
            data: {
              name: novosDados.step_1 || "Sem Nome",
              phone: novosDados.telefone || "",
              legalArea: novosDados.area as any,
              caseSummary: novosDados.step_3 || ""
            }
          });
        }
      }

      return NextResponse.json({
        status: "finalizado",
        score: score.totalScore,
        viabilidade: score.viabilidade,
        mensagem: score.motivo
      });
    }

    // Próxima pergunta
    const proximaPergunta = steps.find(s => s.order === proximoStep);

    await prisma.whatsAppQualificacao.update({
      where: { id: qualificacao.id },
      data: { dados: novosDados }
    });

    return NextResponse.json({
      status: "continua",
      pergunta: proximaPergunta?.pergunta,
      tipo: proximaPergunta?.tipo,
      passo: proximoStep,
      totalPassos: steps.length
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
