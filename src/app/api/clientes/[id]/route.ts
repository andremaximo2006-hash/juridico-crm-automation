import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: { cases: { select: { id: true, title: true, status: true } } },
  });
  if (!client) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const cpf = body.cpf ? body.cpf.replace(/\D/g, "") : undefined;

  if (cpf) {
    const conflict = await prisma.client.findFirst({ where: { cpf, NOT: { id } } });
    if (conflict) return NextResponse.json({ error: "CPF já cadastrado em outro cliente" }, { status: 409 });
  }

  const client = await prisma.client.update({
    where: { id },
    data: {
      name: body.name,
      cpf: cpf ?? undefined,
      phone: body.phone,
      email: body.email || null,
      profession: body.profession || null,
      whatsappOptIn: body.whatsappOptIn ?? undefined,
    },
  });

  return NextResponse.json(client);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;

  const cases = await prisma.case.count({ where: { clientId: id } });
  if (cases > 0)
    return NextResponse.json({ error: "Cliente possui casos vinculados e não pode ser excluído" }, { status: 409 });

  await prisma.client.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
