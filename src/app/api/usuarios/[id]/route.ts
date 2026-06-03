import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await props.params;
  const body = await req.json();

  // Não permite alterar o próprio role se for o único admin
  if (body.role && body.role !== "admin" && id === session.userId) {
    const adminCount = await prisma.user.count({ where: { role: "admin", isActive: true } });
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Não é possível remover o único administrador" }, { status: 400 });
    }
  }

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.role) data.role = body.role;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (body.password) data.password = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await props.params;

  if (id === session.userId) {
    return NextResponse.json({ error: "Não é possível excluir seu próprio usuário" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
