import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

/**
 * POST /api/previsibilidade/import-tsv
 * Importa dados do arquivo TSV do servidor
 */
export async function POST(request: NextRequest) {
  try {
    // Caminho do arquivo TSV
    const tsvPath = path.join(process.cwd(), 'public', 'fechamentos_176.tsv');

    if (!fs.existsSync(tsvPath)) {
      return NextResponse.json(
        { error: 'Arquivo TSV não encontrado' },
        { status: 404 }
      );
    }

    // Ler arquivo TSV
    const content = fs.readFileSync(tsvPath, 'utf-8');
    const lines = content.trim().split('\n');

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'Arquivo TSV vazio' },
        { status: 400 }
      );
    }

    // Parse das linhas (pular header)
    let created = 0;
    let skipped = 0;

    // Função para converter DD/MM/AAAA para Date
    const parseDate = (dateStr: string): Date => {
      const [dia, mes, ano] = dateStr.split('/');
      // Cria a data como YYYY-MM-DD para evitar problemas de timezone
      return new Date(`${ano}-${mes}-${dia}T00:00:00Z`);
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Pular linhas vazias
      if (!line) {
        skipped++;
        continue;
      }

      const columns = line.split('\t');

      if (columns.length < 9) {
        console.warn(`Linha ${i}: apenas ${columns.length} colunas (esperado 9) - pulando`);
        skipped++;
        continue;
      }

      try {
        const id = crypto.randomUUID();
        const [data, cliente, produtoId, area, canal, setor, obs, situacao, honorarios] = columns;

        // Validar dados obrigatórios
        if (!data?.trim() || !cliente?.trim() || !produtoId?.trim()) {
          console.warn(`Linha ${i}: dados obrigatórios faltando - pulando`);
          skipped++;
          continue;
        }

        // Converter data DD/MM/AAAA
        const dataParsed = parseDate(data.trim());
        const honorariosNum = honorarios?.trim() ? parseFloat(honorarios.trim()) : 0;

        // Verificar se a conversão de data foi bem-sucedida
        if (isNaN(dataParsed.getTime())) {
          console.error(`Linha ${i}: data inválida "${data}" - pulando`);
          skipped++;
          continue;
        }

        await prisma.$executeRawUnsafe(
          `INSERT INTO previsibilidade_fechamentos
           (id, data, cliente, "produtoId", area, canal, setor, obs, situacao, honorarios, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          id,
          dataParsed,
          cliente.trim(),
          produtoId.trim(),
          area.trim() || 'previdenciario',
          canal.trim() || 'metaAds',
          setor.trim() || 'Triagem',
          obs.trim() || '',
          situacao.trim() || 'beneficioConcedido',
          isNaN(honorariosNum) ? 0 : honorariosNum,
          new Date(),
          new Date()
        );
        created++;
      } catch (e) {
        console.error(`Erro ao inserir linha ${i}:`, e instanceof Error ? e.message : String(e));
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: lines.length - 1,
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao importar TSV:', error);
    return NextResponse.json(
      { error: 'Erro ao importar TSV' },
      { status: 500 }
    );
  }
}
