import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { FichaCard, AreaAtuacao } from "@/types/operacional";
import { BENEFICIOS, diasAte_DPP, gerarAlertas } from "@/types/operacional";

type Params = { params: Promise<{ id: string }> };

// Helper function to attach computed fields to ficha
function enrichFicha(ficha: any): FichaCard {
  const dias = diasAte_DPP(ficha.smDpp ?? undefined);
  return {
    ...ficha,
    diasAte_DPP: dias,
    alertas: gerarAlertas(ficha),
    podeAvançarColuna: ficha.coluna !== "concluido",
    bloqueadoMoverAndamento: false,
  };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();

  const { id } = await params;
  const ficha = await prisma.fichaOperacional.findUnique({ where: { id } });

  if (!ficha) {
  }

  return NextResponse.json(enrichFicha(ficha));
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();

  const { id } = await params;
  const body = await req.json();

  // Validate required fields
  if (!body.nome?.trim()) {
  }
  if (!body.area) {
  }
  if (!body.beneficio) {
  }
  if (!body.responsavel) {
  }

  // Validate beneficio belongs to area
  const area = body.area as AreaAtuacao | undefined;
  if (!area || !BENEFICIOS[area]?.includes(body.beneficio)) {
    return NextResponse.json(
      { error: `Benefício "${body.beneficio}" não pertence à área "${body.area}"` },
    );
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

  // Fetch current ficha for history logging
  const current = await prisma.fichaOperacional.findUnique({ where: { id } });
  if (!current) {
  }

  // Build changes for history
  const changes: string[] = [];
  if (current.nome !== body.nome?.trim()) changes.push("nome");
  if (current.beneficio !== body.beneficio) changes.push("benefício");
  if (current.responsavel !== body.responsavel) changes.push("responsável");
  if (current.coluna !== body.coluna) changes.push("coluna");

  // Update ficha
  const updatedFicha = await prisma.fichaOperacional.update({
    where: { id },
    data: {
      nome: body.nome.trim(),
      contato: body.contato?.trim() || null,
      natureza: body.natureza || current.natureza,
      area: body.area,
      beneficio: body.beneficio,
      numeroProcesso: body.numeroProcesso?.trim() || null,
      dataEntrada: body.dataEntrada ? new Date(body.dataEntrada) : current.dataEntrada,
      dataProtocolo: body.dataProtocolo ? new Date(body.dataProtocolo) : null,
      numeroProtocolo: body.numeroProtocolo?.trim() || null,
      responsavel: body.responsavel,
      setor: body.setor?.trim() || null,
      coluna: body.coluna || current.coluna,
      prioridade: body.prioridade || current.prioridade,
      cadSenha: body.cadSenha || null,
      conformidade: body.conformidade || null,
      smContribuicao: body.smContribuicao || null,
      smDpp: body.smDpp ? new Date(body.smDpp) : null,
      smQuemPaga: body.smQuemPaga || null,
      smStatusGuia: body.smStatusGuia || null,
      observacoes: body.observacoes?.trim() || null,
      historicoLog: current.historicoLog
        ? `${current.historicoLog}\n[${new Date().toISOString()}] Atualizado por ${session.email || "sistema"}: ${changes.join(", ")}`
        : `[${new Date().toISOString()}] Atualizado por ${session.email || "sistema"}: ${changes.join(", ")}`,
    },
  });

  return NextResponse.json(enrichFicha(updatedFicha));
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();

  const { id } = await params;

  // Soft delete: mark in historico_log or hard delete if preferred
  // For now, hard delete (can be changed to soft delete by adding deletedAt field)
  await prisma.fichaOperacional.delete({ where: { id } });

}
