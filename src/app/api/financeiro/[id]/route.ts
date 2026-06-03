import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, canAccessFinanceiro } from "@/lib/auth";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!canAccessFinanceiro(session.role)) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await props.params;
  const body = await req.json();

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      status: body.status,
      paidDate: body.paidDate ? new Date(body.paidDate) : undefined,
      paymentMethod: body.paymentMethod,
    },
  });

  return NextResponse.json(transaction);
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!canAccessFinanceiro(session.role)) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await props.params;
  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
