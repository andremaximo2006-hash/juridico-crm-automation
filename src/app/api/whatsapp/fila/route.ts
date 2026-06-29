import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const qualificacoes = await prisma.whatsAppQualificacao.findMany({
      include: {
        conversation: { include: { roteiro: true } }
      },
      where: { viabilidade: { not: "pendente" } },
      orderBy: { updatedAt: "desc" }
    });

    const fila = qualificacoes.map(q => ({
      id: q.id,
      conversationId: q.conversationId,
      participante: q.conversation?.conversationHistory?.[0]?.content || "Desconhecido",
      area: q.dados.area,
      score: q.score,
      viabilidade: q.viabilidade,
      roteiro: q.conversation?.roteiro?.name,
      criado: q.createdAt
    }));

    return NextResponse.json(fila);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
