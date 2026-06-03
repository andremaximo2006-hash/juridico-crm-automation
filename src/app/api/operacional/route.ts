import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const natureza = searchParams.get("natureza");
  const setor = searchParams.get("setor");
  const areaAtuacao = searchParams.get("area");
  const conformidade = searchParams.get("conformidade");
  const mes = searchParams.get("mes"); // "YYYY-MM"

  const where: Record<string, unknown> = {};
  if (natureza) where.natureza = natureza;
  if (setor) where.setor = { contains: setor, mode: "insensitive" };
  if (areaAtuacao) where.areaAtuacao = { contains: areaAtuacao, mode: "insensitive" };
  if (conformidade) where.conformidade = { contains: conformidade, mode: "insensitive" };
  if (mes) {
    const [year, month] = mes.split("-").map(Number);
    where.dataEntrada = {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    };
  }

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  const [entries, total] = await Promise.all([
    prisma.operacionalEntry.findMany({
      where,
      orderBy: { dataEntrada: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.operacionalEntry.count({ where }),
  ]);

  const isAdmin = session.role === "admin";
  const data = isAdmin ? entries : entries.map(({ honorarios: _h, ...e }) => e);

  return NextResponse.json({ data, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();

  if (!body.cliente?.trim()) {
    return NextResponse.json({ error: "Cliente obrigatório" }, { status: 400 });
  }
  if (!body.dataEntrada) {
    return NextResponse.json({ error: "Data de entrada obrigatória" }, { status: 400 });
  }

  const entry = await prisma.operacionalEntry.create({
    data: {
      dataEntrada: new Date(body.dataEntrada),
      cliente: body.cliente.trim(),
      contato: body.contato?.trim() || null,
      natureza: body.natureza || "LEAD",
      areaAtuacao: body.areaAtuacao?.trim() || null,
      beneficioDemanda: body.beneficioDemanda?.trim() || null,
      conformidade: body.conformidade?.trim() || null,
      setor: body.setor?.trim() || null,
      cadSenha: body.cadSenha?.trim() || null,
      statusAtual: body.statusAtual?.trim() || null,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
