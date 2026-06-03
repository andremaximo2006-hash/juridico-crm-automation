import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * GET /api/whatsapp/routines
 * Listar todos os roteiros (system prompts)
 */
export async function GET(request: NextRequest) {
  try {
    const routines = await prisma.whatsAppRoutine.findMany({
      select: {
        id: true,
        legalArea: true,
        name: true,
        active: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { legalArea: "asc" },
    });

    logger.info("[API] Roteiros listados", { count: routines.length });

    return NextResponse.json({
      success: true,
      data: routines,
      count: routines.length,
    });
  } catch (error) {
    logger.error("[API] Erro ao listar roteiros", error);
    return NextResponse.json(
      { error: "Failed to fetch routines" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/routines
 * Criar novo roteiro
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { legalArea, name, systemPrompt, tools } = body;

    if (!legalArea || !systemPrompt) {
      return NextResponse.json(
        { error: "Missing required fields: legalArea, systemPrompt" },
        { status: 400 }
      );
    }

    // Verificar se legal_area já existe
    const existing = await prisma.whatsAppRoutine.findUnique({
      where: { legalArea },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Routine for '${legalArea}' already exists` },
        { status: 409 }
      );
    }

    const routine = await prisma.whatsAppRoutine.create({
      data: {
        legalArea,
        name: name || legalArea,
        systemPrompt,
        tools: tools || [],
        active: true,
        version: 1,
      },
    });

    logger.info("[API] Novo roteiro criado", {
      legalArea: routine.legalArea,
      id: routine.id,
    });

    return NextResponse.json(
      { success: true, data: routine },
      { status: 201 }
    );
  } catch (error) {
    logger.error("[API] Erro ao criar roteiro", error);
    return NextResponse.json(
      { error: "Failed to create routine" },
      { status: 500 }
    );
  }
}
