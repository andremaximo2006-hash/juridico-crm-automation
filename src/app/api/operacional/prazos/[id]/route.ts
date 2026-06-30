import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  const { id } = await params;
  const body = await req.json();

  function parseDate(v: unknown): Date | null {
    if (!v) return null;
    const d = new Date(v as string);
    return isNaN(d.getTime()) ? null : d;
  }

  const updated = await prisma.prazosEntry.update({
    where: { id },
    data: {
      cliente:       body.cliente       ?? undefined,
      processo:      body.processo      ?? null,
      tipoPrazo:     body.tipoPrazo     ?? null,
      dataInicial:   parseDate(body.dataInicial),
      dataFinal:     parseDate(body.dataFinal),
      responsavel:   body.responsavel   ?? null,
      observacoes:   body.observacoes   ?? null,
    },
  });

  return NextResponse.json(updated);
}
