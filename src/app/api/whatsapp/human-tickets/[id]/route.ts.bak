import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * GET /api/whatsapp/human-tickets/:id
 * Obter detalhes de um ticket específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = await prisma.whatsAppHumanTicket.findUnique({
      where: { id: params.id },
      include: {
        conversation: {
          select: {
            id: true,
            conversationHistory: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            legalArea: true,
          },
        },
        assignedToAttendant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    logger.info("[API] Ticket obtido", { ticketId: ticket.id });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    logger.error("[API] Erro ao obter ticket", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/whatsapp/human-tickets/:id
 * Atualizar ticket (atribuir, alterar status, adicionar notas)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      assignedToAttendantId,
      status,
      resolutionNotes,
    } = body;

    const ticket = await prisma.whatsAppHumanTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (assignedToAttendantId) {
      updateData.assignedToAttendantId = assignedToAttendantId;
      updateData.assignedAt = new Date();
      updateData.status = "assigned"; // Auto-set to assigned
      logger.info("[API] Ticket atribuído", {
        ticketId: ticket.id,
        attendantId: assignedToAttendantId,
      });
    }

    if (status) {
      updateData.status = status;

      if (status === "resolved" || status === "cancelled") {
        updateData.resolvedAt = new Date();
      }
      logger.info("[API] Status do ticket alterado", {
        ticketId: ticket.id,
        status,
      });
    }

    if (resolutionNotes) {
      updateData.resolutionNotes = resolutionNotes;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.whatsAppHumanTicket.update({
      where: { id: params.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        assignedToAttendant: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error("[API] Erro ao atualizar ticket", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/whatsapp/human-tickets/:id
 * Cancelar/fechar ticket
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = await prisma.whatsAppHumanTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.whatsAppHumanTicket.update({
      where: { id: params.id },
      data: {
        status: "cancelled",
        resolvedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    logger.info("[API] Ticket cancelado", { ticketId: ticket.id });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error("[API] Erro ao cancelar ticket", error);
    return NextResponse.json(
      { error: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
