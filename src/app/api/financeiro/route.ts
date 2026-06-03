import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, canAccessFinanceiro } from "@/lib/auth";
import { TransactionCreateSchema } from "@/lib/schemas";
import { auditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!canAccessFinanceiro(session.role)) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const type     = searchParams.get("type") as "income" | "expense" | null;
  const category = searchParams.get("category");
  const status   = searchParams.get("status");
  const period   = searchParams.get("period"); // "month" | "quarter" | "year" | "all"

  const where: Record<string, unknown> = {};
  if (type)     where.type = type;
  if (category) where.category = category;
  if (status)   where.status = status;

  if (period && period !== "all") {
    const now = new Date();
    let from: Date;
    if (period === "month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      from = new Date(now.getFullYear(), q * 3, 1);
    } else {
      from = new Date(now.getFullYear(), 0, 1);
    }
    where.dueDate = { gte: from };
  }

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  const [transactions, total, incomeAgg, expenseAgg, overdueAgg] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { client: { select: { name: true } } },
      orderBy: { dueDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.aggregate({
      where: { type: "income" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "expense" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "income", status: "overdue" },
      _sum: { amount: true },
    }),
  ]);

  const summary = {
    totalIncome: Number(incomeAgg._sum.amount ?? 0),
    totalExpense: Number(expenseAgg._sum.amount ?? 0),
    totalOverdue: Number(overdueAgg._sum.amount ?? 0),
  };

  return NextResponse.json({ transactions, summary, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!canAccessFinanceiro(session.role)) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await req.json();
  const parsed = TransactionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;

  const transaction = await prisma.transaction.create({
    data: {
      type: data.type,
      category: data.category,
      description: data.description || null,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      status: data.status ?? "pending",
      clientId: data.clientId || null,
      caseId: data.caseId || null,
    },
  });

  await auditLog(session, "CREATE", "financeiro", transaction.id, `Lançamento: ${transaction.type} R$${transaction.amount}`);
  return NextResponse.json(transaction, { status: 201 });
}
