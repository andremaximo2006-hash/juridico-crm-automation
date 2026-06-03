import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import * as XLSX from "xlsx";

interface RowData {
  nome?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  profissao?: string;
  // accept common variations
  name?: string;
  phone?: string;
  fone?: string;
  celular?: string;
  profession?: string;
}

function normalizeRow(raw: Record<string, unknown>): RowData {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    lower[k.toLowerCase().trim()] = String(v ?? "").trim();
  }
  return {
    nome: lower["nome"] || lower["name"] || "",
    cpf: lower["cpf"] || "",
    telefone: lower["telefone"] || lower["phone"] || lower["fone"] || lower["celular"] || "",
    email: lower["email"] || "",
    profissao: lower["profissao"] || lower["profissão"] || lower["profession"] || "",
  };
}

function cleanCpf(raw: string): string {
  return raw.replace(/\D/g, "");
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
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  const results = { imported: 0, skipped: 0, errors: [] as string[] };

  for (let i = 0; i < rows.length; i++) {
    const row = normalizeRow(rows[i]);
    const lineNum = i + 2;

    if (!row.nome) {
      results.errors.push(`Linha ${lineNum}: nome obrigatório`);
      results.skipped++;
      continue;
    }

    const cpf = cleanCpf(row.cpf ?? "");
    if (!cpf || cpf.length < 11) {
      results.errors.push(`Linha ${lineNum} (${row.nome}): CPF inválido`);
      results.skipped++;
      continue;
    }

    if (!row.telefone) {
      results.errors.push(`Linha ${lineNum} (${row.nome}): telefone obrigatório`);
      results.skipped++;
      continue;
    }

    const exists = await prisma.client.findUnique({ where: { cpf } });
    if (exists) {
      results.errors.push(`Linha ${lineNum} (${row.nome}): CPF ${cpf} já cadastrado`);
      results.skipped++;
      continue;
    }

    try {
      await prisma.client.create({
        data: {
          name: row.nome,
          cpf,
          phone: row.telefone,
          email: row.email || null,
          profession: row.profissao || null,
        },
      });
      results.imported++;
    } catch {
      results.errors.push(`Linha ${lineNum} (${row.nome}): erro ao salvar`);
      results.skipped++;
    }
  }

  return NextResponse.json(results);
}
