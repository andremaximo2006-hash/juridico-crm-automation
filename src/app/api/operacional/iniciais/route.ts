import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();

  const { searchParams } = req.nextUrl;
  const area = searchParams.get("area");
  const responsavel = searchParams.get("responsavel");
  const status = searchParams.get("status");
  const mes = searchParams.get("mes");

  const where: Record<string, unknown> = {};
  if (area) where.area = { contains: area, mode: "insensitive" };
  if (responsavel) where.responsavel = { contains: responsavel, mode: "insensitive" };
  if (status) where.status = { contains: status, mode: "insensitive" };
  if (mes) {
    const [y, m] = mes.split("-").map(Number);
    where.dataInicial = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
  }

  const entries = await prisma.iniciaisEntry.findMany({
    where,
    orderBy: { dataInicial: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  const body = await req.json();
  if (!body.cliente?.trim()) {
  }

  const entry = await prisma.iniciaisEntry.create({
    data: {
      cliente: body.cliente.trim(),
      processo: body.processo?.trim() || null,
      area: body.area?.trim() || null,
      dataInicial: body.dataInicial ? new Date(body.dataInicial) : null,
      protocolo: body.protocolo?.trim() || null,
      responsavel: body.responsavel?.trim() || null,
      observacoes: body.observacoes?.trim() || null,
    },
  });

}
