import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ClienteCreateSchema } from "@/lib/schemas";
import { auditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  const where = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { cpf: { contains: q } }] }
    : {};

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: { cases: { select: { id: true, title: true, status: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({ data: clients, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const parsed = ClienteCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;

  const client = await prisma.client.create({
    data: {
      name: data.name,
      cpf: data.cpf,
      phone: data.phone,
      email: data.email || null,
      profession: data.profession || null,
      leadId: data.leadId || null,
    },
  });

  await auditLog(session, "CREATE", "clientes", client.id, `Cliente criado: ${client.name}`);
  return NextResponse.json(client, { status: 201 });
}
