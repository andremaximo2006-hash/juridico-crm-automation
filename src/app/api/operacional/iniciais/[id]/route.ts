import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const entry = await prisma.iniciaisEntry.update({
    where: { id },
    data: {
      cliente: body.cliente?.trim() || undefined,
      processo: body.processo?.trim() ?? undefined,
      areaAtuacao: body.areaAtuacao?.trim() ?? undefined,
      tipoRequerimento: body.tipoRequerimento?.trim() ?? undefined,
      dataInicial: body.dataInicial !== undefined
        ? (body.dataInicial ? new Date(body.dataInicial) : null)
        : undefined,
      protocolo: body.protocolo?.trim() ?? undefined,
      responsavel: body.responsavel?.trim() ?? undefined,
      status: body.status?.trim() ?? undefined,
      observacoes: body.observacoes?.trim() ?? undefined,
    },
  });

  return NextResponse.json(entry);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  await prisma.iniciaisEntry.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
