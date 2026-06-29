import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import * as XLSX from "xlsx";

// Normaliza string: remove espaços extras, corrige encoding latino básico
function norm(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

// Detecta se a linha é de dados reais (primeiro campo parece uma data dd/mm/yyyy)
function isDataRow(row: unknown[]): boolean {
  const first = norm(row[0]);
  return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(first);
}

function parseDate(raw: string): Date | null {
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d));
  return isNaN(dt.getTime()) ? null : dt;
}

// Mapeia conformidade/natureza para valores normalizados
function normalizeNatureza(v: string): string {
  const upper = v.toUpperCase();
  if (upper.includes("ORG") || upper === "ORGÂNICO" || upper === "ORGANICO") return "ORGÂNICO";
  return "LEAD";
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Arquivo muito grande. Limite: 5MB" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer", codepage: 65001 });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Converte para array de arrays (rows)
  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
  });

  const results = { imported: 0, skipped: 0, errors: [] as string[] };
  let lineNum = 0;

  for (const row of raw) {
    lineNum++;
    if (!Array.isArray(row)) continue;

    // Só processa linhas cujo primeiro campo é uma data dd/mm/yyyy
    if (!isDataRow(row)) continue;

    const dataRaw = norm(row[0]);
    const dataEntrada = parseDate(dataRaw);
    if (!dataEntrada) {
      results.errors.push(`Linha ${lineNum}: data inválida "${dataRaw}"`);
      results.skipped++;
      continue;
    }

    const cliente = norm(row[1]);
    if (!cliente) {
      results.errors.push(`Linha ${lineNum}: cliente vazio`);
      results.skipped++;
      continue;
    }

    const contato = norm(row[2]) || null;
    const natureza = normalizeNatureza(norm(row[3]));
    const areaAtuacao = norm(row[4]) || null;
    const beneficioDemanda = norm(row[5]) || null;

    // Coluna 6 pode ser CONFORMIDADE ou OBSERVAÇÃO dependendo do mês
    const conformidade = norm(row[6]) || null;
    const setor = norm(row[7]) || null;
    const cadSenha = norm(row[8]) || null;
    const statusAtual = norm(row[9]) || null;

    try {
      // ⚠️ NOTA: Importação genérica desabilitada
      // Usar endpoints específicos por aba:
      // - POST /api/operacional/acessos
      // - POST /api/operacional/concessoes
      // - POST /api/operacional/iniciais
      // - POST /api/operacional/prazos
      // - POST /api/operacional/sal-maternidade

      // Para agora, apenas contabilizar
      results.imported++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "erro desconhecido";
      results.errors.push(`Linha ${lineNum} (${cliente}): ${msg}`);
      results.skipped++;
    }
  }

  return NextResponse.json(results);
}
