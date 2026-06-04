import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { StatsMetrics } from "@/types/operacional";
import { diasAte_DPP } from "@/types/operacional";

export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const fichas = await prisma.fichaOperacional.findMany();

  const stats: StatsMetrics = {
    total: fichas.length,
    novo: fichas.filter((f) => f.coluna === "novo").length,
    triagem: fichas.filter((f) => f.coluna === "triagem").length,
    andamento: fichas.filter((f) => f.coluna === "andamento").length,
    concluido: fichas.filter((f) => f.coluna === "concluido").length,
    urgentes: fichas.filter((f) => f.prioridade === "urgente").length,
    aguardandoDocs: fichas.filter((f) => f.conformidade?.includes("Aguardando")).length,
    dppProxima: fichas.filter((f) => {
      const dias = diasAte_DPP(f.smDpp ?? undefined);
      return dias !== undefined && dias <= 30 && dias >= 0;
    }).length,
  };

  return NextResponse.json(stats);
}
