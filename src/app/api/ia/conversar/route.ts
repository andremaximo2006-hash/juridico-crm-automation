import { NextRequest, NextResponse } from "next/server";
import { ClaudeIAService } from "@/lib/ia/claude-service";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  mensagem: string;
  historico?: ConversationMessage[];
  especialista?: string;
  situacaoCliente?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();

    if (!body.mensagem) {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key não configurada" },
        { status: 500 }
      );
    }

    // Se é especialista, obter análise
    if (body.especialista && body.situacaoCliente) {
      const resposta = await ClaudeIAService.obterAnaliseEspecialista(
        body.especialista,
        body.situacaoCliente,
        body.mensagem,
        body.historico || []
      );

      return NextResponse.json({
        resposta,
        tipo: "especialista",
        especialista: body.especialista,
      });
    }

    // Caso contrário, é Marta (recepção)
    const resposta = await ClaudeIAService.obterRespostaMarta(
      body.mensagem,
      body.historico || []
    );

    return NextResponse.json({
      resposta,
      tipo: "marta",
    });
  } catch (error) {
    console.error("Erro na API de conversa:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao processar mensagem",
      },
      { status: 500 }
    );
  }
}
