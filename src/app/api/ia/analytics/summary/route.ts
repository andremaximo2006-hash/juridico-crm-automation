import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AnalyticsResponse } from "@/types/ia";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "7days";

    // TODO: Buscar dados reais do banco de dados baseado no período
    // Por enquanto, retorna dados mockados

    const now = new Date();
    const daysAgo = period === "7days" ? 7 : period === "30days" ? 30 : 7;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const mockAnalytics: AnalyticsResponse = {
      period: {
        startDate,
        endDate: now
      },
      overview: {
        totalConversations: 1245,
        avgResponseTime: 2300,
        avgSatisfaction: 4.8,
        totalCost: 23.45
      },
      breakdown: {
        super_agent: {
          conversations: 561,
          cost: 12.50,
          percentage: 45
        },
        whatsapp_ia: {
          conversations: 435,
          cost: 8.20,
          percentage: 35
        },
        marketing_ia: {
          conversations: 249,
          cost: 2.75,
          percentage: 20
        }
      },
      trends: Array.from({ length: daysAgo }, (_, i) => {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        return {
          date,
          conversations: Math.floor(Math.random() * 100) + 50,
          tokens: Math.floor(Math.random() * 50000) + 20000
        };
      })
    };

    return NextResponse.json(mockAnalytics);
  } catch (error) {
    console.error("Erro em GET /api/ia/analytics/summary:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
