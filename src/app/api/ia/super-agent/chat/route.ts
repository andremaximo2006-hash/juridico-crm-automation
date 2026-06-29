import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { session_id, message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Mensagem inválida" },
        { status: 400 }
      );
    }

    // TODO: Integrar com Python Super Agent via HTTP ou WebSocket
    // Por enquanto, resposta mockada
    const mockResponse = {
      response: `Processando sua mensagem: "${message}"\n\nEm breve estarei integrado com o Super Agent Python via FastAPI.`,
      tokens_used: Math.floor(Math.random() * 1000),
      tools_used: [],
      session_id
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error("Erro em /api/ia/super-agent/chat:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
