import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface SaveConversationRequest {
  iaId: string;
  participante: string;
  participanteId?: string;
  canal: string;
  mensagens: Array<{ role: string; content: string; timestamp: string }>;
  dados: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveConversationRequest = await request.json();

    if (!body.iaId || !body.participante || !body.canal) {
      return NextResponse.json(
        { error: "iaId, participante e canal são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar conversa existente
    let conversa = await prisma.iAConversa.findFirst({
      where: {
        iaId: body.iaId,
        participanteId: body.participanteId,
      },
    });

    // Salvar ou atualizar conversa
    if (conversa) {
      conversa = await prisma.iAConversa.update({
        where: { id: conversa.id },
        data: {
          participante: body.participante,
          mensagens: body.mensagens,
          dados: body.dados,
          updatedAt: new Date(),
        },
      });
    } else {
      conversa = await prisma.iAConversa.create({
        data: {
          iaId: body.iaId,
          participante: body.participante,
          participanteId: body.participanteId || "",
          canal: body.canal as any,
          mensagens: body.mensagens,
          dados: body.dados,
          status: "ativa",
        },
      });
    }

    return NextResponse.json({
      success: true,
      conversaId: conversa.id,
      message: "Conversa salva com sucesso",
    });
  } catch (error) {
    console.error("Erro ao salvar conversa:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao salvar conversa",
      },
      { status: 500 }
    );
  }
}
