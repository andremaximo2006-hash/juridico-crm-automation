import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";
  const area = searchParams.get("area") ?? "";
  const status = searchParams.get("status") ?? "";

  const where: Record<string, unknown> = {};
  if (area) where.areaAtuacao = { contains: area, mode: "insensitive" };
  if (status) where.status = { contains: status, mode: "insensitive" };

  const rows = await prisma.prazosEntry.findMany({
    where,
    orderBy: [{ dataFinal: "asc" }, { cliente: "asc" }],
  });

  const filtered = q
    ? rows.filter(
        (r) =>
          r.cliente.toLowerCase().includes(q) ||
          (r.processo ?? "").toLowerCase().includes(q) ||
          (r.areaAtuacao ?? "").toLowerCase().includes(q) ||
          (r.tipoPrazo ?? "").toLowerCase().includes(q) ||
          (r.status ?? "").toLowerCase().includes(q)
      )
    : rows;

  return NextResponse.json(filtered);
}
