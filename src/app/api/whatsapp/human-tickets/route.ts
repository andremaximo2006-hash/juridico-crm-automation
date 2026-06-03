import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * GET /api/whatsapp/human-tickets?status=pending&priority=high
 * Listar tickets de atendimento humano com filtros
 */
export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");
    const priority = request.nextUrl.searchParams.get("priority");
    const assignedTo = request.nextUrl.searchParams.get("assignedTo");

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToAttendantId = assignedTo;

    const tickets = await prisma.whatsAppHumanTicket.findMany({
      where,
      include: {
        conversation: {
          select: {
            id: true,
            leadId: true,
            status: true,
            createdAt: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
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
      orderBy: [
        { priority: "desc" }, // High priority first
        { createdAt: "asc" }, // Oldest first
      ],
    });

    logger.info("[API] Tickets listados", {
      count: tickets.length,
      filters: { status, priority, assignedTo },
    });

    return NextResponse.json({
      success: true,
      data: tickets,
      count: tickets.length,
    });
  } catch (error) {
    logger.error("[API] Erro ao listar tickets", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/human-tickets/:id/assign
 * Atribuir ticket a um atendente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, leadId, reason, priority } = body;

    if (!conversationId || !leadId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verificar se conversation existe
    const conversation = await prisma.whatsAppConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const ticket = await prisma.whatsAppHumanTicket.create({
      data: {
        conversationId,
        leadId,
        reason: reason || "Atendimento manual",
        priority: priority || "normal",
        status: "pending",
      },
      include: {
        lead: true,
        conversation: true,
      },
    });

    logger.info("[API] Ticket criado", {
      ticketId: ticket.id,
      leadId: ticket.leadId,
      priority: ticket.priority,
    });

    return NextResponse.json(
      { success: true, data: ticket },
      { status: 201 }
    );
  } catch (error) {
    logger.error("[API] Erro ao criar ticket", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
