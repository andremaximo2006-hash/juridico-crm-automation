import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import * as XLSX from "xlsx";

function norm(v: unknown): string {
  if (v == null || v instanceof Date) return "";
  return String(v).trim();
}

function parseDate(v: unknown): Date | null {
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const s = norm(v);
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const dt = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    return isNaN(dt.getTime()) ? null : dt;
  }
  return null;
}

const SKIP_COL3 = new Set([
  "CLIENTE", "CONTROLE DE PRAZOS", "CONTROLE DE INICIAIS", "CONTROLE",
]);

function isNonDataValue(v: string): boolean {
  if (!v) return true;
  if (SKIP_COL3.has(v.toUpperCase())) return true;
  // Month/year/section markers
  return /^(JANEIRO|FEVEREIRO|MAR[ÇC]O|MAR[ÃA]O|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO|PENDENTES?|2025|2026|2027)$/i.test(v);
}

function formatDateValue(v: unknown): string | null {
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v.toLocaleDateString("pt-BR");
  const s = norm(v);
  return s || null;
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, codepage: 65001 });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
  });

  const results = { imported: 0, skipped: 0, errors: [] as string[] };
  let lineNum = 0;

  for (const row of raw) {
    lineNum++;
    if (!Array.isArray(row) || row.length < 4) continue;

    // Spreadsheet layout: col[0]=empty, col[1]=row#, col[2]=secondary#,
    // col[3]=CLIENTE, col[4]=PROCESSO, col[5]=AREA, col[6]=TIPO,
    // col[7]=DATA INICIAL, col[8]=PROTOCOLO, col[9]=RESPONSAVEL,
    // col[10]=STATUS, col[11]=OBSERVAÇÕES
    const cliente = norm(row[3]);
    if (isNonDataValue(cliente)) continue;

    const dataInicial = parseDate(row[7]);
    const protocolo = formatDateValue(row[8]);

    try {
      await prisma.iniciaisEntry.create({
        data: {
          cliente,
          processo: norm(row[4]) || null,
          dataInicial,
          protocolo,
          responsavel: norm(row[9]) || null,
          observacoes: norm(row[11]) || null,
        },
      });
      results.imported++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "erro desconhecido";
      results.errors.push(`Linha ${lineNum} (${cliente}): ${msg}`);
      results.skipped++;
    }
  }

  return NextResponse.json(results);
}
