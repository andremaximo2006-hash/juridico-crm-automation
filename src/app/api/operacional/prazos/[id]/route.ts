import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  function parseDate(v: unknown): Date | null {
    if (!v) return null;
    const d = new Date(v as string);
    return isNaN(d.getTime()) ? null : d;
  }

  const updated = await prisma.prazoEntry.update({
    where: { id },
    data: {
      cliente:       body.cliente       ?? undefined,
      processo:      body.processo      ?? null,
      areaAtuacao:   body.areaAtuacao   ?? null,
      tipoPrazo:     body.tipoPrazo     ?? null,
      dataInicial:   parseDate(body.dataInicial),
      dataFinal:     parseDate(body.dataFinal),
      responsavel:   body.responsavel   ?? null,
      status:        body.status        ?? null,
      observacoes:   body.observacoes   ?? null,
      modificadoPor: session.name,
    },
  });

  return NextResponse.json(updated);
}
