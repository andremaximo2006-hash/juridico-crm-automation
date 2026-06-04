import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface BulkFechamento {
  data: string;
  cliente: string;
  produtoId: string;
  area: string;
  canal: string;
  setor?: string | null;
  obs?: string | null;
  situacao: string;
  honorarios?: number | null;
}

/**
 * POST /api/previsibilidade/fechamentos/bulk
 * Importar múltiplos fechamentos em uma única requisição
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fechamentos } = body;

    if (!Array.isArray(fechamentos) || fechamentos.length === 0) {
      return NextResponse.json(
        { error: 'Array de fechamentos inválido ou vazio' },
        { status: 400 }
      );
    }

    // Usar createMany para importação em massa
    const result = await prisma.previsibilidadeFechamento.createMany({
      data: fechamentos.map((f: BulkFechamento) => ({
        data: new Date(f.data),
        cliente: f.cliente,
        produtoId: f.produtoId,
        area: f.area as any,
        canal: f.canal as any,
        setor: f.setor || null,
        obs: f.obs || null,
        situacao: f.situacao as any,
        honorarios: f.honorarios ? parseFloat(String(f.honorarios)) : null,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        success: true,
        created: result.count,
        total: fechamentos.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao importar fechamentos em massa:', error);
    return NextResponse.json(
      { error: 'Erro ao importar fechamentos' },
      { status: 500 }
    );
  }
}
