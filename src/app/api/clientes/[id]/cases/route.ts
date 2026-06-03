import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const cases = await prisma.case.findMany({
    where: { clientId: id },
    include: {
      feeAgreements: { select: { id: true, type: true, amount: true, totalInstallments: true } },
      transactions: {
        select: { id: true, amount: true, status: true, dueDate: true, type: true },
        orderBy: { dueDate: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cases);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id: clientId } = await params;
  const body = await req.json();

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Título obrigatório" }, { status: 400 });
  }

  const newCase = await prisma.case.create({
    data: {
      clientId,
      title: body.title.trim(),
      legalArea: body.legalArea || null,
      description: body.description || null,
      status: "active",
    },
  });

  return NextResponse.json(newCase, { status: 201 });
}
