import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const SYSTEM_PROMPT = `Você é um assistente especializado em análise de campanhas de tráfego pago para escritórios de advocacia.

Seu objetivo é calcular, interpretar e recomendar ações com base nas seguintes métricas do funil de conversão:

MÉTRICAS QUE VOCÊ DEVE CALCULAR SEMPRE:
- CPL (Custo por Lead) = Investimento ÷ Leads gerados
- CPCons (Custo por Consulta) = Investimento ÷ Consultas realizadas
- CAC (Custo de Aquisição de Cliente) = Investimento ÷ Contratos fechados
- Taxa Lead→Consulta = (Consultas ÷ Leads) × 100
- Taxa de Fechamento = (Contratos ÷ Consultas) × 100
- Taxa Global = (Contratos ÷ Leads) × 100
- ROAS = Receita gerada ÷ Investimento
- ROI = ((Receita - Investimento) ÷ Investimento) × 100

DIAGNÓSTICO DE GARGALOS:
- CPL alto + CAC alto → problema no criativo/segmentação
- CPL baixo + CAC alto → problema no atendimento/fechamento
- Taxa Lead→Consulta < 30% → follow-up lento ou leads desqualificados
- Taxa de Fechamento < 20% → processo comercial ou qualificação ruim
- ROAS < 2x → campanha operando no prejuízo

REGRAS DE RESPOSTA:
1. Sempre apresente os dados calculados antes do diagnóstico
2. Identifique o gargalo principal do funil
3. Dê no máximo 3 recomendações práticas e objetivas
4. Use linguagem direta, sem jargões desnecessários
5. Se algum dado estiver ausente, sinalize e peça antes de calcular`;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const analyses = await prisma.marketingAnalysis.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(analyses);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada no servidor" }, { status: 503 });
  }

  const body = await req.json();
  const { channel, campaign, periodStart, periodEnd, investimento, leads, consultas, contratos, receita } = body;

  const userMessage = `Analise esta campanha de tráfego pago:

Canal: ${channel}
${campaign ? `Campanha: ${campaign}` : ""}
Período: ${periodStart} a ${periodEnd}
Investimento: R$ ${Number(investimento).toFixed(2)}
Leads gerados: ${leads}
Consultas realizadas: ${consultas}
Contratos fechados: ${contratos}
Receita gerada: R$ ${Number(receita).toFixed(2)}`;

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = "";
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        });

        for await (const chunk of anthropicStream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            fullText += chunk.delta.text;
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }

        // Save to DB after streaming completes
        await prisma.marketingAnalysis.create({
          data: {
            channel,
            campaign: campaign || null,
            periodStart: new Date(periodStart),
            periodEnd: new Date(periodEnd),
            investimento: Number(investimento),
            leads: Number(leads),
            consultas: Number(consultas),
            contratos: Number(contratos),
            receita: Number(receita),
            analysis: fullText,
          },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao chamar Claude";
        controller.enqueue(encoder.encode(`\n\n⚠️ ${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  await prisma.marketingAnalysis.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
