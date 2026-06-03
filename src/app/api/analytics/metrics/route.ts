import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/lib/analytics-service";
import { logger } from "@/lib/logger";

/**
 * GET /api/analytics/metrics?hours=24
 * Obter métricas da plataforma
 */
export async function GET(request: NextRequest) {
  try {
    const hours = parseInt(request.nextUrl.searchParams.get("hours") || "24");

    logger.info("[API] Obtendo métricas", { hours });

    const metrics = analyticsService.getMetrics(hours);

    return NextResponse.json({
      success: true,
      period: `${hours} horas`,
      data: {
        messages: metrics.totalMessages,
        tickets: metrics.totalTickets,
        activeConversations: metrics.activeConversations,
        averageResponseTime: `${Math.round(metrics.averageResponseTime / 60)} min`,
        transferRate: `${metrics.transferRate}%`,
        resolutionRate: `${metrics.resolutionRate}%`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("[API] Erro ao obter métricas", error);
    return NextResponse.json(
      { error: "Erro ao obter métricas" },
      { status: 500 }
    );
  }
}
