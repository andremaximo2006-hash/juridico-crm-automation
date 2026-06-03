import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const entry = await prisma.operacionalEntry.update({
    where: { id },
    data: {
      dataEntrada: body.dataEntrada ? new Date(body.dataEntrada) : undefined,
      cliente: body.cliente?.trim() || undefined,
      contato: body.contato?.trim() ?? undefined,
      natureza: body.natureza || undefined,
      areaAtuacao: body.areaAtuacao?.trim() ?? undefined,
      beneficioDemanda: body.beneficioDemanda?.trim() ?? undefined,
      conformidade: body.conformidade?.trim() ?? undefined,
      setor: body.setor?.trim() ?? undefined,
      cadSenha: body.cadSenha?.trim() ?? undefined,
      statusAtual: body.statusAtual?.trim() ?? undefined,
    },
  });

  return NextResponse.json(entry);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  await prisma.operacionalEntry.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
