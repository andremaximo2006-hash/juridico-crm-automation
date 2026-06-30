import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();

  const { id } = await params;
  const body = await req.json();

  const entry = await prisma.iniciaisEntry.update({
    where: { id },
    data: {
      cliente: body.cliente?.trim() || undefined,
      processo: body.processo?.trim() ?? undefined,
      protocolo: body.protocolo?.trim() ?? undefined,
      responsavel: body.responsavel?.trim() ?? undefined,
      observacoes: body.observacoes?.trim() ?? undefined,
    },
  });

  return NextResponse.json(entry);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();

  const { id } = await params;
  await prisma.iniciaisEntry.delete({ where: { id } });
}
