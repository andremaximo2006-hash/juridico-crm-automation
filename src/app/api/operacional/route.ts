import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { FichaCard, FilterState, AreaAtuacao } from "@/types/operacional";
import { BENEFICIOS, diasAte_DPP, gerarAlertas, podeAvançarColuna, isBloqueadoMoverAndamento } from "@/types/operacional";

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
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

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

  if (area) where.area = area;
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

  // Fetch fichas
  const [fichas, total] = await Promise.all([
    prisma.fichaOperacional.findMany({
      where,
      orderBy: { dataEntrada: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.fichaOperacional.count({ where }),
  ]);

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
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();

  // Validate required fields
  if (!body.nome?.trim()) {
    return NextResponse.json({ error: "Nome do cliente obrigatório" }, { status: 400 });
  }
  if (!body.area) {
    return NextResponse.json({ error: "Área de atuação obrigatória" }, { status: 400 });
  }
  if (!body.beneficio) {
    return NextResponse.json({ error: "Benefício obrigatório" }, { status: 400 });
  }
  if (!body.responsavel) {
    return NextResponse.json({ error: "Responsável obrigatório" }, { status: 400 });
  }

  // Validate beneficio belongs to area
  const area = body.area as AreaAtuacao | undefined;
  if (!area || !BENEFICIOS[area]?.includes(body.beneficio)) {
    return NextResponse.json(
      { error: `Benefício "${body.beneficio}" não pertence à área "${body.area}"` },
      { status: 400 }
    );
  }

  // Validate SM fields if benefício is Salário Maternidade
  if (body.beneficio?.includes("Salário Maternidade")) {
    if (!body.smContribuicao) {
      return NextResponse.json(
        { error: "Contribuição (CI/FBR) obrigatória para Salário Maternidade" },
        { status: 400 }
      );
    }
    if (!body.smDpp) {
      return NextResponse.json(
        { error: "Data Prevista do Parto obrigatória para Salário Maternidade" },
        { status: 400 }
      );
    }
  }

  // Create ficha
  const ficha = await prisma.fichaOperacional.create({
    data: {
      nome: body.nome.trim(),
      contato: body.contato?.trim() || null,
      natureza: body.natureza || "LEAD",
      area: body.area,
      beneficio: body.beneficio,
      tipoRequerimento: body.tipoRequerimento || null,
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

  return NextResponse.json(enrichFicha(ficha), { status: 201 });
}
