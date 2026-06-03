/**
 * Script de importação: lê todas as planilhas e insere no banco de dados.
 * Executar: npx ts-node -e "require('dotenv').config()" prisma/import-planilhas.ts
 * Na VPS:  DATABASE_URL="..." npx ts-node prisma/import-planilhas.ts
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function norm(v: unknown): string {
  if (v == null) return "";
  return String(v).trim().replace(/\r/g, "");
}

function parseDateBR(s: string): Date | null {
  if (!s) return null;
  // dd/mm/yyyy
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    const dt = new Date(year, Number(m[2]) - 1, Number(m[1]));
    return isNaN(dt.getTime()) ? null : dt;
  }
  // dd/mm (sem ano — ano corrente)
  const m2 = s.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (m2) {
    const dt = new Date(new Date().getFullYear(), Number(m2[2]) - 1, Number(m2[1]));
    return isNaN(dt.getTime()) ? null : dt;
  }
  return null;
}

function parseTSV(filepath: string): string[][] {
  const content = fs.readFileSync(filepath, "utf-8");
  return content.split("\n").map((line) => line.split("\t").map((c) => c.trim().replace(/\r$/, "")));
}

function parseCSV(filepath: string): string[][] {
  const content = fs.readFileSync(filepath, "utf-8");
  return content.split("\n").map((line) =>
    line.split(",").map((c) => c.trim().replace(/\r$/, "").replace(/^"|"$/g, ""))
  );
}

const MONTH_NAMES = new Set([
  "JANEIRO","FEVEREIRO","MARÇO","MARÃO","ABRIL","MAIO","JUNHO",
  "JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO",
  "PENDENTES","PENDENTE","2025","2026","2027","2028",
]);

function isNonData(v: string): boolean {
  if (!v) return true;
  return MONTH_NAMES.has(v.toUpperCase().trim()) || /^(CONTROLE|CLIENTE|DATA|ENTRADA|ACESSOS)/.test(v.toUpperCase());
}

// ─── 1. INICIAIS ─────────────────────────────────────────────────────────────
// Layout: col[3]=CLIENTE, col[4]=PROCESSO, col[5]=AREA, col[6]=TIPO,
//         col[7]=DATA INICIAL, col[8]=PROTOCOLO, col[9]=RESPONSAVEL,
//         col[10]=STATUS, col[11]=OBSERVAÇÕES

async function importIniciais(filepath: string) {
  const rows = parseTSV(filepath);
  let imported = 0, skipped = 0;
  for (const row of rows) {
    const cliente = norm(row[3]);
    if (!cliente || isNonData(cliente)) { skipped++; continue; }
    try {
      await prisma.inicialEntry.create({
        data: {
          cliente,
          processo: norm(row[4]) || null,
          areaAtuacao: norm(row[5]) || null,
          tipoRequerimento: norm(row[6]) || null,
          dataInicial: parseDateBR(norm(row[7])),
          protocolo: norm(row[8]) || null,
          responsavel: norm(row[9]) || null,
          status: norm(row[10]) || null,
          observacoes: norm(row[11]) || null,
        },
      });
      imported++;
    } catch { skipped++; }
  }
  console.log(`  INICIAIS: ${imported} importados, ${skipped} ignorados`);
}

// ─── 2. FECHAMENTOS ──────────────────────────────────────────────────────────
// Same layout as OperacionalEntry:
// col[0]=ENTRADA(date), col[1]=CLIENTE, col[2]=CONTATO, col[3]=NATUREZA,
// col[4]=ÁREA, col[5]=BENEFÍCIO, col[6]=OBSERVAÇÃO, col[7]=SETOR,
// col[8]=CADSENHA, col[9]=STATUS ATUAL

async function importFechamentos(filepath: string) {
  const rows = parseCSV(filepath);
  let imported = 0, skipped = 0;
  for (const row of rows) {
    const dataRaw = norm(row[0]);
    const dataEntrada = parseDateBR(dataRaw);
    if (!dataEntrada) { skipped++; continue; }
    const cliente = norm(row[1]);
    if (!cliente) { skipped++; continue; }
    try {
      await prisma.operacionalEntry.create({
        data: {
          dataEntrada,
          cliente,
          contato: norm(row[2]) || null,
          natureza: /ORG/i.test(norm(row[3])) ? "ORGÂNICO" : "LEAD",
          areaAtuacao: norm(row[4]) || null,
          beneficioDemanda: norm(row[5]) || null,
          conformidade: norm(row[6]) || null,
          setor: norm(row[7]) || "Fechamentos",
          cadSenha: norm(row[8]) || null,
          statusAtual: norm(row[9]) || null,
        },
      });
      imported++;
    } catch { skipped++; }
  }
  console.log(`  FECHAMENTOS: ${imported} importados, ${skipped} ignorados`);
}

// ─── 3. SALÁRIO MATERNIDADE ──────────────────────────────────────────────────
// col[0]=CLIENTE, col[1]=CONTATO, col[2]=BENEFÍCIO, col[3]=CONTRIBUIÇÃO,
// col[4]=DPP ou DN, col[5]=PAGAMENTO, col[6]=PLANEJAMENTO, col[7]=STATUS

async function importSalMaternidade(filepath: string) {
  const rows = parseTSV(filepath);
  let imported = 0, skipped = 0;
  let headerPassed = false;
  for (const row of rows) {
    const cliente = norm(row[0]);
    if (!cliente) { skipped++; continue; }
    if (!headerPassed) {
      if (cliente.toUpperCase() === "CLIENTE") { headerPassed = true; }
      skipped++;
      continue;
    }
    if (isNonData(cliente)) { skipped++; continue; }
    try {
      await prisma.salMaternidadeEntry.create({
        data: {
          cliente,
          contato: norm(row[1]) || null,
          beneficio: norm(row[2]) || null,
          contribuicao: norm(row[3]) || null,
          dppOuDn: norm(row[4]) || null,
          pagamento: norm(row[5]) || null,
          planejamento: norm(row[6]) || null,
          status: norm(row[7]) || null,
        },
      });
      imported++;
    } catch { skipped++; }
  }
  console.log(`  SAL.MATERNIDADE: ${imported} importados, ${skipped} ignorados`);
}

// ─── 4. PRAZOS ───────────────────────────────────────────────────────────────
// col[0]=row#, col[1]=secondary, col[2]=CLIENTE, col[3]=PROCESSO,
// col[4]=AREA, col[5]=TIPO_PRAZO, col[6]=DATA_INICIAL, col[7]=DATA_FINAL,
// col[8]=RESPONSAVEL, col[9]=STATUS, col[10]=OBSERVAÇÕES

async function importPrazos(filepath: string) {
  const rows = parseTSV(filepath);
  let imported = 0, skipped = 0;
  for (const row of rows) {
    const cliente = norm(row[2]);
    if (!cliente || isNonData(cliente)) { skipped++; continue; }
    try {
      await prisma.prazoEntry.create({
        data: {
          cliente,
          processo: norm(row[3]) || null,
          areaAtuacao: norm(row[4]) || null,
          tipoPrazo: norm(row[5]) || null,
          dataInicial: parseDateBR(norm(row[6])),
          dataFinal: parseDateBR(norm(row[7])),
          responsavel: norm(row[8]) || null,
          status: norm(row[9]) || null,
          observacoes: norm(row[10]) || null,
        },
      });
      imported++;
    } catch { skipped++; }
  }
  console.log(`  PRAZOS: ${imported} importados, ${skipped} ignorados`);
}

// ─── 5. CADSENHA ─────────────────────────────────────────────────────────────
// col[0]=ENTRADA(date or empty), col[1]=CLIENTE, col[2]=CONTATO,
// col[3]=NATUREZA, col[4]=BENEFÍCIO, col[5]=PROCURAÇÃO,
// col[6]=SUBSTABELECIMENTO, col[7]=RG, col[8]=STATUS

async function importCadSenha(filepath: string) {
  const rows = parseTSV(filepath);
  let imported = 0, skipped = 0;
  let headerPassed = false;
  for (const row of rows) {
    const col0 = norm(row[0]);
    const cliente = norm(row[1]);
    // Skip header
    if (!headerPassed) {
      if (col0.toUpperCase() === "ENTRADA") { headerPassed = true; }
      skipped++;
      continue;
    }
    if (!cliente || isNonData(cliente)) { skipped++; continue; }
    try {
      await prisma.cadSenhaEntry.create({
        data: {
          entrada: parseDateBR(col0),
          cliente,
          contato: norm(row[2]) || null,
          natureza: norm(row[3]) || null,
          beneficio: norm(row[4]) || null,
          procuracao: norm(row[5]) || null,
          substabelecimento: norm(row[6]) || null,
          rg: norm(row[7]) || null,
          status: norm(row[8]) || null,
        },
      });
      imported++;
    } catch { skipped++; }
  }
  console.log(`  CADSENHA: ${imported} importados, ${skipped} ignorados`);
}

// ─── 6. CONCESSÕES ───────────────────────────────────────────────────────────
// col[0]=DATA, col[1]=CLIENTE, col[2]=BENEFÍCIO,
// col[3]=DATA_RECEBIMENTO, col[4]=VALOR_HONORÁRIOS, col[5]=BOLETOS

async function importConcessoes(filepath: string) {
  const rows = parseTSV(filepath);
  let imported = 0, skipped = 0;
  for (const row of rows) {
    const dataRaw = norm(row[0]);
    const data = parseDateBR(dataRaw);
    const cliente = norm(row[1]);
    if (!cliente || isNonData(cliente)) { skipped++; continue; }
    if (!data && !cliente) { skipped++; continue; }
    try {
      await prisma.concessaoEntry.create({
        data: {
          data,
          cliente,
          beneficio: norm(row[2]) || null,
          dataRecebimento: parseDateBR(norm(row[3])),
          valorHonorarios: norm(row[4]) || null,
          boletos: norm(row[5]) || null,
        },
      });
      imported++;
    } catch { skipped++; }
  }
  console.log(`  CONCESSÕES: ${imported} importados, ${skipped} ignorados`);
}

// ─── 7. ACESSOS ──────────────────────────────────────────────────────────────
// col[0]=SISTEMA, col[1]=LOGIN, col[2]=SENHA

async function importAcessos(filepath: string) {
  const rows = parseTSV(filepath);
  let imported = 0, skipped = 0;
  for (const row of rows) {
    const sistema = norm(row[0]).replace(/:$/, "").trim();
    if (!sistema || sistema.toUpperCase() === "ACESSOS") { skipped++; continue; }
    const login = norm(row[1]);
    const senha = norm(row[2]);
    if (!login && !senha) { skipped++; continue; }
    try {
      await prisma.acessoEntry.create({
        data: { sistema, login: login || null, senha: senha || null },
      });
      imported++;
    } catch { skipped++; }
  }
  console.log(`  ACESSOS: ${imported} importados, ${skipped} ignorados`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const BASE = process.env.PLANILHAS_DIR || "/tmp/planilhas";

async function main() {
  console.log("Iniciando importação das planilhas...\n");

  await importIniciais(path.join(BASE, "INICIAIS.tsv"));
  await importFechamentos(path.join(BASE, "FECHAMENTOS.csv"));
  await importSalMaternidade(path.join(BASE, "SAL_MATERNIDADE.tsv"));
  await importPrazos(path.join(BASE, "PRAZOS.tsv"));
  await importCadSenha(path.join(BASE, "CADSENHA.tsv"));
  await importConcessoes(path.join(BASE, "CONCESSOES.tsv"));
  await importAcessos(path.join(BASE, "ACESSOS.tsv"));

  console.log("\nImportação concluída!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
