import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { FichaCard, FilterState } from "@/types/operacional";
import { diasAte_DPP, gerarAlertas, podeAvançarColuna, isBloqueadoMoverAndamento } from "@/types/operacional";

// Helper function to attach computed fields to ficha
function enrichFicha(ficha: any): FichaCard {
  const dias = diasAte_DPP(ficha.smDpp ?? undefined);
  return {
    ...ficha,
    diasAte_DPP: dias,
    alertas: gerarAlertas(ficha),
    podeAvançarColuna: ficha.coluna !== "concluido",
    bloqueadoMoverAndamento: isBloqueadoMoverAndamento(ficha),
  };
}

export async function GET(req: NextRequest) {
  const session = await getSession();

  const { searchParams } = new URL(req.url);

  // Filters
  const area = searchParams.get("area");
  const natureza = searchParams.get("natureza");
  const prioridade = searchParams.get("prioridade");
  const responsavel = searchParams.get("responsavel");
  const coluna = searchParams.get("coluna");
  const search = searchParams.get("search");
  const semRetorno = searchParams.get("semRetorno") === "true";
  const dppProxima = searchParams.get("dppProxima") === "true";

  // Pagination
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  // Build where clause
  const where: Record<string, unknown> = {};

  if (natureza) where.natureza = natureza;
  if (prioridade) where.prioridade = prioridade;
  if (responsavel) where.responsavel = responsavel;
  if (coluna) where.coluna = coluna;

  // Search across multiple fields
  if (search) {
    const searchLower = search.toLowerCase();
    where.OR = [
      { nome: { contains: search, mode: "insensitive" } },
      { numeroProcesso: { contains: search, mode: "insensitive" } },
      { beneficio: { contains: search, mode: "insensitive" } },
      { responsavel: { contains: search, mode: "insensitive" } },
      { observacoes: { contains: search, mode: "insensitive" } },
    ];
  }

  // Fetch fichas from MAIN table + ALL ABASE tables
  const [fichasPrincipal, cadsenha, iniciais, pagina16, salmaternidade] = await Promise.all([
    prisma.fichaOperacional.findMany({
      where,
      orderBy: { dataEntrada: "desc" },
      take: limit,
    }),
    prisma.cadSenhaEntry.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.iniciaisEntry.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.pagina16Entry.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.salMaternidadeEntry.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Convert aba entries to fichas format
  const fichasAbas = [
    ...cadsenha.map((c: any) => ({
      id: c.id,
      nome: c.cliente,
      contato: c.contato,
      natureza: "LEAD",
      beneficio: "CadSenha",
      numeroProcesso: null,
      dataEntrada: c.createdAt,
      dataProtocolo: null,
      responsavel: "Sistema",
      setor: "CadSenha",
      coluna: "novo",
      prioridade: "normal",
      cadSenha: c.status,
      observacoes: `[${c.status}] CadSenha`,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
    ...iniciais.map((i: any) => ({
      id: i.id,
      nome: i.cliente,
      contato: null,
      natureza: "ORGANICO",
      numeroProcesso: i.processo,
      dataEntrada: i.dataInicial,
      dataProtocolo: null,
      responsavel: i.responsavel || "Sistema",
      setor: "Iniciais",
      coluna: "triagem",
      prioridade: "normal",
      cadSenha: null,
      observacoes: `[INICIAIS] ${i.observacoes || ""}`,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    })),
    ...pagina16.map((p: any) => ({
      id: p.id,
      nome: p.cliente,
      contato: null,
      natureza: "LEAD",
      beneficio: p.demanda || "Demanda",
      numeroProcesso: null,
      dataEntrada: p.data,
      dataProtocolo: null,
      responsavel: p.responsavel || "Sistema",
      setor: "Página16",
      coluna: "novo",
      prioridade: "normal",
      cadSenha: null,
      observacoes: `[PG16] ${p.observacao || ""}`,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    ...salmaternidade.map((s: any) => ({
      id: s.id,
      nome: s.cliente,
      contato: s.contato,
      natureza: "ORGANICO",
      beneficio: s.beneficio || "Salário Maternidade",
      numeroProcesso: null,
      dataEntrada: s.createdAt,
      dataProtocolo: null,
      responsavel: "Sistema",
      setor: "SalMaternidade",
      coluna: s.status === "concluido" ? "concluido" : "andamento",
      prioridade: "normal",
      cadSenha: null,
      smDpp: s.dppOuDn,
      observacoes: `[SAL.MAT] ${s.status || ""}`,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
  ];

  // Combine all fichas
  const fichas = [...fichasPrincipal, ...fichasAbas];
  const total = fichas.length;

  // Post-filter for computed conditions
  let filtered = fichas.map(enrichFicha);

  if (semRetorno) {
    filtered = filtered.filter(
      (f) =>
        (f.observacoes?.toLowerCase().includes("sumiu") ||
          f.observacoes?.toLowerCase().includes("sem retorno")) &&
        new Date(f.updatedAt).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000
    );
  }

  if (dppProxima) {
    filtered = filtered.filter((f) => f.diasAte_DPP !== undefined && f.diasAte_DPP <= 30 && f.diasAte_DPP >= 0);
  }

  return NextResponse.json({ data: filtered, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  const body = await req.json();

  // Validate required fields
  if (!body.nome?.trim()) {
  }
  if (!body.beneficio) {
  }
  if (!body.responsavel) {
  }

  // Validate SM fields if benefício is Salário Maternidade
  if (body.beneficio?.includes("Salário Maternidade")) {
    if (!body.smContribuicao) {
      return NextResponse.json(
        { error: "Contribuição (CI/FBR) obrigatória para Salário Maternidade" },
      );
    }
    if (!body.smDpp) {
      return NextResponse.json(
        { error: "Data Prevista do Parto obrigatória para Salário Maternidade" },
      );
    }
  }

  // Create ficha
  const ficha = await prisma.fichaOperacional.create({
    data: {
      nome: body.nome.trim(),
      contato: body.contato?.trim() || null,
      natureza: body.natureza || "LEAD",
      beneficio: body.beneficio,
      numeroProcesso: body.numeroProcesso?.trim() || null,
      dataEntrada: new Date(body.dataEntrada || new Date()),
      dataProtocolo: body.dataProtocolo ? new Date(body.dataProtocolo) : null,
      numeroProtocolo: body.numeroProtocolo?.trim() || null,
      responsavel: body.responsavel,
      setor: body.setor?.trim() || null,
      coluna: "novo",
      prioridade: body.prioridade || "normal",
      cadSenha: body.cadSenha || null,
      conformidade: body.conformidade || null,
      smContribuicao: body.smContribuicao || null,
      smDpp: body.smDpp ? new Date(body.smDpp) : null,
      smQuemPaga: body.smQuemPaga || null,
      smStatusGuia: body.smStatusGuia || null,
      observacoes: body.observacoes?.trim() || null,
      historicoLog: `[${new Date().toISOString()}] Criado por ${session.email || "sistema"}`,
    },
  });

}
