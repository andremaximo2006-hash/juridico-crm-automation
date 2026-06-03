import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
  if (local.length === 11) return `${local.slice(0, 2)} ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `${local.slice(0, 2)} ${local.slice(2, 6)}-${local.slice(6)}`;
  return local;
}

async function notifyDiscordFechamento(lead: {
  name: string;
  phone: string;
  caseSummary: string | null;
  originChannel: string | null;
}) {
  const setting = await prisma.appSetting.findUnique({ where: { key: "discord_webhook_fechamento" } });
  if (!setting?.value) return;

  const summaryLines = (lead.caseSummary ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  const [firstLine, ...restLines] = summaryLines;

  const parts = [
    "LEAD",
    lead.name,
    ` Contrato fechado: ${firstLine ?? ""}`,
    ...restLines,
    `Contato: ${formatPhone(lead.phone)}`,
    lead.originChannel ?? "",
  ].filter((l) => l !== "");

  try {
    await fetch(setting.value, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: parts.join("\n") }),
    });
  } catch {
    // Notificação Discord é melhor-esforço — não falha a operação principal
  }
}

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await props.params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await props.params;
  const body = await req.json();

  const prevLead = await prisma.lead.findUnique({ where: { id } });

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...body,
      stageUpdatedAt: body.funnelStage ? new Date() : undefined,
    },
  });

  if (body.funnelStage && prevLead?.funnelStage !== body.funnelStage) {
    await prisma.leadTimeline.create({
      data: {
        leadId: id,
        eventType: "stage_change",
        description: `Movido para: ${body.funnelStage}`,
      },
    });

    if (body.funnelStage === "contract_signed") {
      await Promise.all([
        prisma.astreaMigrationChecklist.create({
          data: {
            caseId: id,
            items: {
              createMany: {
                data: [
                  { label: "Criar cliente no Astrea com mesmo CPF", sortOrder: 0 },
                  { label: "Cadastrar processo/caso no Astrea", sortOrder: 1 },
                  { label: "Fazer upload do contrato assinado", sortOrder: 2 },
                  { label: "Lançar honorários iniciais no financeiro", sortOrder: 3 },
                  { label: "Vincular ID do Astrea neste cadastro", sortOrder: 4 },
                  { label: "Confirmar envio de mensagem de boas-vindas via WhatsApp", sortOrder: 5 },
                ],
              },
            },
          },
        }),
        notifyDiscordFechamento(lead),
      ]);
    }
  }

  return NextResponse.json(lead);
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await props.params;
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
