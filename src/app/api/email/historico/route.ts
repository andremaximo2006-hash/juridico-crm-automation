import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const mensagens = await prisma.emailMensagem.findMany({
      where: campaignId ? { campaignId } : {},
      include: { interacoes: true },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return NextResponse.json(mensagens);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
