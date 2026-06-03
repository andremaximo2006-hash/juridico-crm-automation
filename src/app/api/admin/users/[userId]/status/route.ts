import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Middleware para verificar se é admin
async function requireAdmin(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return null;
  }
  return session;
}

// PUT - Alterar status do usuário (ativar/desativar)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await requireAdmin(req);
    if (!session) {
      return NextResponse.json({ error: "Apenas admins podem acessar" }, { status: 403 });
    }

    const body = await req.json();
    const { isActive } = body;
    const { userId } = await params;

    // Validar isActive
    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Status deve ser verdadeiro ou falso" }, { status: 400 });
    }

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Prevenir desativar o próprio admin
    if (session.userId === userId && !isActive) {
      return NextResponse.json(
        { error: "Você não pode desativar sua própria conta" },
        { status: 403 }
      );
    }

    // Atualizar status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: `Usuário ${isActive ? "ativado" : "desativado"} com sucesso`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao alterar status do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao alterar status do usuário" },
      { status: 500 }
    );
  }
}
