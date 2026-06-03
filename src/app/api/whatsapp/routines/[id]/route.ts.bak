import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * GET /api/whatsapp/routines/:id (ou :legal_area)
 * Obter um roteiro específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Tentar por ID ou legal_area
    let routine = await prisma.whatsAppRoutine.findUnique({
      where: { id },
    });

    if (!routine) {
      routine = await prisma.whatsAppRoutine.findUnique({
        where: { legalArea: id },
      });
    }

    if (!routine) {
      return NextResponse.json(
        { error: "Routine not found" },
        { status: 404 }
      );
    }

    logger.info("[API] Roteiro obtido", { id: routine.id });

    return NextResponse.json({ success: true, data: routine });
  } catch (error) {
    logger.error("[API] Erro ao obter roteiro", error);
    return NextResponse.json(
      { error: "Failed to fetch routine" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/whatsapp/routines/:id
 * Atualizar roteiro (editar system prompt)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { name, systemPrompt, tools, active } = body;

    // Tentar por ID ou legal_area
    let routine = await prisma.whatsAppRoutine.findUnique({
      where: { id },
    });

    if (!routine) {
      routine = await prisma.whatsAppRoutine.findUnique({
        where: { legalArea: id },
      });
    }

    if (!routine) {
      return NextResponse.json(
        { error: "Routine not found" },
        { status: 404 }
      );
    }

    // Atualizar com incremento de versão
    const updated = await prisma.whatsAppRoutine.update({
      where: { id: routine.id },
      data: {
        ...(name && { name }),
        ...(systemPrompt && { systemPrompt }),
        ...(tools && { tools }),
        ...(active !== undefined && { active }),
        version: routine.version + 1,
        updatedAt: new Date(),
      },
    });

    logger.info("[API] Roteiro atualizado", {
      id: updated.id,
      version: updated.version,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error("[API] Erro ao atualizar roteiro", error);
    return NextResponse.json(
      { error: "Failed to update routine" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/whatsapp/routines/:id
 * Desativar roteiro
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Tentar por ID ou legal_area
    let routine = await prisma.whatsAppRoutine.findUnique({
      where: { id },
    });

    if (!routine) {
      routine = await prisma.whatsAppRoutine.findUnique({
        where: { legalArea: id },
      });
    }

    if (!routine) {
      return NextResponse.json(
        { error: "Routine not found" },
        { status: 404 }
      );
    }

    // Desativar ao invés de deletar (preserva histórico)
    const updated = await prisma.whatsAppRoutine.update({
      where: { id: routine.id },
      data: {
        active: false,
        updatedAt: new Date(),
      },
    });

    logger.info("[API] Roteiro desativado", { id: updated.id });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error("[API] Erro ao desativar roteiro", error);
    return NextResponse.json(
      { error: "Failed to delete routine" },
      { status: 500 }
    );
  }
}
