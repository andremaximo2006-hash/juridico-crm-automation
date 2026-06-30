import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversas = await prisma.iAConversa.findMany({ take: 50 });

    return NextResponse.json({
      total: conversas.length,
      conversas: conversas.map((c: any) => ({
        id: c.id,
        participante: c.participante,
        status: c.status,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao filtrar" }, { status: 500 });
  }
}
