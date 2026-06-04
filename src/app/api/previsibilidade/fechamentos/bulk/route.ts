import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface BulkFechamento {
  data: string;
  cliente: string;
  produtoId?: string;
  area?: string;
  canal?: string;
  setor?: string | null;
  obs?: string | null;
  situacao?: string;
  honorarios?: number | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { fechamentos } = body;

    if (!Array.isArray(fechamentos) || fechamentos.length === 0) {
      return NextResponse.json({ error: 'Array inválido' }, { status: 400 });
    }

    let created = 0;
    for (const f of fechamentos) {
      try {
        const id = crypto.randomUUID();
        // Usar prod-2 (BPC/LOAS) como padrão - produto existe
        const produtoId = 'prod-2';

        await prisma.$executeRawUnsafe(
          `INSERT INTO previsibilidade_fechamentos
           (id, data, cliente, "produtoId", area, canal, setor, obs, situacao, honorarios, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          id,
          new Date(f.data),
          f.cliente,
          produtoId,
          f.area || 'previdenciario',
          f.canal || 'metaAds',
          f.setor || 'Triagem',
          f.obs || '',
          f.situacao || 'emAndamento',
          f.honorarios ? parseFloat(String(f.honorarios)) : 0,
          new Date(),
          new Date()
        );
        created++;
      } catch (e) {
        console.error('Erro:', e);
      }
    }

    return NextResponse.json({
      success: true,
      created,
      total: fechamentos.length,
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao importar:', error);
    return NextResponse.json({ error: 'Erro na importação' }, { status: 500 });
  }
}
