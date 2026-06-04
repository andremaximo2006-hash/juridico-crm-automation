import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { KanbanColuna } from "@/types/operacional";
import { podeAvançarColuna, isBloqueadoMoverAndamento, diasAte_DPP, gerarAlertas } from "@/types/operacional";

type Params = { params: Promise<{ id: string }> };

// Helper function to attach computed fields to ficha
function enrichFicha(ficha: any) {
  const dias = diasAte_DPP(ficha.smDpp ?? undefined);
  return {
    ...ficha,
    diasAte_DPP: dias,
    alertas: gerarAlertas(ficha),
    podeAvançarColuna: ficha.coluna !== "concluido",
    bloqueadoMoverAndamento: isBloqueadoMoverAndamento(ficha),
  };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const novaColuna: KanbanColuna = body.coluna;

  if (!novaColuna) {
    return NextResponse.json({ error: "Coluna obrigatória" }, { status: 400 });
  }

  // Fetch current ficha
  const ficha = await prisma.fichaOperacional.findUnique({ where: { id } });
  if (!ficha) {
    return NextResponse.json({ error: "Ficha não encontrada" }, { status: 404 });
  }

  const colunaAtual = ficha.coluna;

  // Validate progression rule
  const progression = podeAvançarColuna(colunaAtual, novaColuna, ficha);
  if (!progression.allowed) {
    return NextResponse.json(
      { error: `Não é possível mover de "${colunaAtual}" para "${novaColuna}": ${progression.reason}` },
      { status: 403 }
    );
  }

  // Check CadSenha blocker for andamento
  if (novaColuna === "andamento" && isBloqueadoMoverAndamento(ficha)) {
    return NextResponse.json(
      {
        error: "Procuração/CadSenha pendente. Regularize antes de protocolar o requerimento.",
      },
      { status: 403 }
    );
  }

  // Update coluna
  const updated = await prisma.fichaOperacional.update({
    where: { id },
    data: {
      coluna: novaColuna,
      historicoLog: `${ficha.historicoLog || ""}\n[${new Date().toISOString()}] Movido para "${novaColuna}" por ${session.email || "sistema"}`,
    },
  });

  return NextResponse.json(enrichFicha(updated));
}
