import { NextRequest, NextResponse } from "next/server";
import { asaasService } from "@/lib/asaas-service";
import { logger } from "@/lib/logger";

/**
 * GET /api/asaas/payments?customerId=...
 * Listar cobranças de um cliente
 */
export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId é obrigatório" },
        { status: 400 }
      );
    }

    logger.info("[API] Listando cobranças Asaas", { customerId });

    const payments = await asaasService.listPayments(customerId);

    return NextResponse.json({
      success: true,
      data: payments,
      count: payments.length,
    });
  } catch (error) {
    logger.error("[API] Erro ao listar cobranças", error);
    return NextResponse.json(
      { error: "Erro ao listar cobranças" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/asaas/payments
 * Criar nova cobrança
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, description, value, dueDate, billingType } = body;

    if (!customerId || !description || !value || !dueDate || !billingType) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    logger.info("[API] Criando cobrança Asaas", {
      customerId,
      value,
      billingType,
    });

    const payment = await asaasService.createPayment({
      customerId,
      description,
      value,
      dueDate,
      billingType,
    });

    return NextResponse.json(
      { success: true, data: payment },
      { status: 201 }
    );
  } catch (error) {
    logger.error("[API] Erro ao criar cobrança", error);
    return NextResponse.json(
      { error: "Erro ao criar cobrança" },
      { status: 500 }
    );
  }
}
