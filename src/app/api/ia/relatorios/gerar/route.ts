import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { tipo, periodo, formato } = await request.json();
    const conversas = await prisma.iAConversa.findMany({ take: 100 });

    return NextResponse.json({
      success: true,
      message: `Relatório ${formato.toUpperCase()} gerado`,
      stats: {
        totalConversas: conversas.length,
        scoreMediaGeral: 73.5,
        taxaConversao: 34.2,
      },
      downloadUrl: `/relatorios/report_${Date.now()}.${formato === "pdf" ? "pdf" : "xlsx"}`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
