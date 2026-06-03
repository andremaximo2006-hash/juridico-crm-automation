import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { LeadCreateSchema } from "@/lib/schemas";
import { auditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? 50)));
  const q = searchParams.get("q");

  const where: Record<string, unknown> = {
    funnelStage: { notIn: ["lost", "migrated_to_astrea"] },
  };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ data: leads, total, page, limit });
}

export async function POST(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const parsed = LeadCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;

  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      cpf: data.cpf || null,
      email: data.email || null,
      profession: data.profession || null,
      estimatedIncome: data.estimatedIncome || null,
      originChannel: data.originChannel || null,
      legalArea: data.legalArea || null,
      caseSummary: data.caseSummary || null,
    },
  });

  await prisma.leadTimeline.create({
    data: {
      leadId: lead.id,
      eventType: "stage_change",
      description: "Lead criado",
    },
  });

  const session = await getSession();
  await auditLog(session, "CREATE", "leads", lead.id, `Lead criado: ${lead.name}`);
  return NextResponse.json(lead, { status: 201 });
}
