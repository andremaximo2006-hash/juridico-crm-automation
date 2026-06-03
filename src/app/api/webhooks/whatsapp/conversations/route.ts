import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * GET /api/webhooks/whatsapp/conversations?status=active
 * Listar conversas com filtros opcionais
 */
export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const conversations = await prisma.whatsAppConversation.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    logger.info("[API] Conversas listadas", {
      count: conversations.length,
      status: status || "all",
    });

    return NextResponse.json({
      success: true,
      data: conversations,
      count: conversations.length,
    });
  } catch (error) {
    logger.error("[API] Erro ao listar conversas", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
