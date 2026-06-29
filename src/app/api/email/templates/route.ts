import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const templates = await prisma.emailTemplate.findMany({
      where: { isAtivo: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { nome, descricao, assunto, corpo, variaveis } = body;

    if (!nome || !assunto || !corpo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const template = await prisma.emailTemplate.create({
      data: {
        nome,
        descricao,
        assunto,
        corpo,
        variaveis: variaveis || []
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
