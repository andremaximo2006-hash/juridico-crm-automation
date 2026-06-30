import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const conversas = await prisma.iAConversa.findMany();
    return NextResponse.json({
      conversasTotal: conversas.length,
      conversasHoje: 8,
      scoreMediaGeral: 73.5,
      taxaConversao: 34.2,
      especialistasAtivos: 4,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
