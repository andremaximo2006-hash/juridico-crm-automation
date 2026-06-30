import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const participanteId = searchParams.get("participanteId");
    const iaId = searchParams.get("iaId");

    if (!participanteId || !iaId) {
      return NextResponse.json(
        { error: "participanteId e iaId são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar conversa existente
    const conversa = await prisma.iAConversa.findFirst({
      where: {
        iaId,
        participanteId,
      },
    });

    if (!conversa) {
      return NextResponse.json({
        historico: [],
        dados: {},
        message: "Nenhuma conversa anterior encontrada",
      });
    }

    return NextResponse.json({
      conversaId: conversa.id,
      historico: conversa.mensagens || [],
      dados: conversa.dados || {},
      status: conversa.status,
    });
  } catch (error) {
    console.error("Erro ao recuperar histórico:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao recuperar histórico",
      },
      { status: 500 }
    );
  }
}
