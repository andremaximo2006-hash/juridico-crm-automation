import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AIConfiguration, AIModel } from "@/types/ia";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // TODO: Buscar configuração do banco de dados
    // Por enquanto, retorna config padrão
    const defaultConfig: Partial<AIConfiguration> = {
      defaultModel: AIModel.SONNET,
      maxTokens: 4096,
      temperature: 0.7,
      superAgentEnabled: true,
      superAgentAutoSearch: true,
      superAgentAutoAlerts: true,
      whatsappIaEnabled: true,
      whatsappIaAutoRespond: true,
      whatsappIaApprovalRequired: false,
      whatsappIaEscalateDelaySeconds: 30,
      marketingIaEnabled: true,
      marketingIaAnalysisModels: ["roi", "funnel", "cac", "roas"],
      logConversations: true,
      anonymizeSensitiveData: true,
      encryptAtRest: true,
      dataRetentionDays: 90,
      maxCallsPerHour: 100,
      maxTokensPerDay: 1000000,
      rateLimitAlert: true,
      errorAlertSlack: false,
      autoRetryEnabled: true,
      autoRetryMaxAttempts: 3
    };

    return NextResponse.json(defaultConfig);
  } catch (error) {
    console.error("Erro em GET /api/ia/config:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const config = await request.json();

    // TODO: Salvar configuração no banco de dados
    // Por enquanto, apenas valida e retorna

    if (config.maxTokens < 1024 || config.maxTokens > 200000) {
      return NextResponse.json(
        { error: "maxTokens deve estar entre 1024 e 200000" },
        { status: 400 }
      );
    }

    if (config.temperature < 0 || config.temperature > 1) {
      return NextResponse.json(
        { error: "temperature deve estar entre 0 e 1" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Configurações salvas com sucesso",
      config
    });
  } catch (error) {
    console.error("Erro em PUT /api/ia/config:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
