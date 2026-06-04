import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/previsibilidade/fechamentos
 * Listar todos os fechamentos
 */
export async function GET(request: NextRequest) {
  try {
    const fechamentos = await prisma.previsibilidadeFechamento.findMany({
      orderBy: {
        data: 'desc',
      },
    });

    return NextResponse.json(fechamentos);
  } catch (error) {
    console.error('Erro ao listar fechamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar fechamentos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/previsibilidade/fechamentos
 * Criar novo fechamento
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      data,
      cliente,
      produtoId,
      area,
      canal,
      setor,
      obs,
      situacao,
      honorarios,
    } = body;

    // Validações
    if (!data || !cliente || !produtoId || !area || !canal || !situacao) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    const fechamento = await prisma.previsibilidadeFechamento.create({
      data: {
        data: new Date(data),
        cliente,
        produtoId,
        area,
        canal,
        setor: setor || null,
        obs: obs || null,
        situacao,
        honorarios: honorarios ? parseFloat(honorarios) : null,
      },
      include: {
        produto: true,
      },
    });

    return NextResponse.json(fechamento, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar fechamento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar fechamento' },
      { status: 500 }
    );
  }
}
