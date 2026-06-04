import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/previsibilidade/fechamentos/[id]
 * Obter um fechamento específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fechamento = await prisma.previsibilidadeFechamento.findUnique({
      where: { id },
      include: {
        produto: true,
      },
    });

    if (!fechamento) {
      return NextResponse.json(
        { error: 'Fechamento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(fechamento);
  } catch (error) {
    console.error('Erro ao buscar fechamento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar fechamento' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/previsibilidade/fechamentos/[id]
 * Atualizar um fechamento
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const fechamento = await prisma.previsibilidadeFechamento.update({
      where: { id },
      data: {
        ...(data && { data: new Date(data) }),
        ...(cliente && { cliente }),
        ...(produtoId && { produtoId }),
        ...(area && { area }),
        ...(canal && { canal }),
        ...(setor !== undefined && { setor }),
        ...(obs !== undefined && { obs }),
        ...(situacao && { situacao }),
        ...(honorarios !== undefined && { honorarios: honorarios ? parseFloat(honorarios) : null }),
      },
      include: {
        produto: true,
      },
    });

    return NextResponse.json(fechamento);
  } catch (error) {
    console.error('Erro ao atualizar fechamento:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar fechamento' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/previsibilidade/fechamentos/[id]
 * Deletar um fechamento
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.previsibilidadeFechamento.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar fechamento:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar fechamento' },
      { status: 500 }
    );
  }
}
