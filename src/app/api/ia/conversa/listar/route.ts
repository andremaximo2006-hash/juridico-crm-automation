import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const iaId = searchParams.get("iaId");
    const status = searchParams.get("status") || "ativa";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!iaId) {
      return NextResponse.json(
        { error: "iaId é obrigatório" },
        { status: 400 }
      );
    }

    // Contar total de conversas
    const total = await prisma.iAConversa.count({
      where: {
        iaId,
        status,
      },
    });

    // Buscar conversas paginadas
    const conversas = await prisma.iAConversa.findMany({
      where: {
        iaId,
        status,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        participante: true,
        participanteId: true,
        canal: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        dados: true,
        mensagens: true,
      },
    });

    // Processar dados para exibição
    const conversasFormatadas = conversas.map((conv: any) => ({
      id: conv.id,
      participante: conv.participante,
      participanteId: conv.participanteId,
      canal: conv.canal,
      status: conv.status,
      totalMensagens: Array.isArray(conv.mensagens) ? conv.mensagens.length : 0,
      ultimaMensagem: Array.isArray(conv.mensagens) && conv.mensagens.length > 0
        ? (conv.mensagens as any[])[conv.mensagens.length - 1].content
        : null,
      dados: conv.dados,
      criadoEm: conv.createdAt,
      atualizadoEm: conv.updatedAt,
    }));

    return NextResponse.json({
      conversas: conversasFormatadas,
      paginacao: {
        total,
        limit,
        offset,
        pagina: Math.floor(offset / limit) + 1,
        totalPaginas: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao listar conversas:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao listar conversas",
      },
      { status: 500 }
    );
  }
}
