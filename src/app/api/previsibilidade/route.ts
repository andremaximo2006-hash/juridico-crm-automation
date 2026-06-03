import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

interface PrevisibilidadeRow {
  mes: string;
  receita_base: number;
  receita_esperada: number;
  receita_realista: number;
  trending: "up" | "down" | "stable";
}

interface SummaryStats {
  min_garantida: number;
  max_potencial: number;
  media_realista: number;
  crescimento: number;
}

// Simular dados de contratos e leads
// Em produção, isso viria do banco de dados
function generateForecastData(): { previsibilidade: PrevisibilidadeRow[]; summary: SummaryStats } {
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  // Dados simulados de receitas
  const baseReceita = 15000; // Receita base mensal de contratos ativos
  const receitas: PrevisibilidadeRow[] = [];

  let anterior = baseReceita;

  months.forEach((mes, index) => {
    // Receita base cresce 2% ao mês
    const receita_base = baseReceita * Math.pow(1.02, index);

    // Receita esperada (leads × probabilidade × valor médio)
    // Simulando: ~5 leads por mês × 20% conversão × R$5000 = R$5000/mês
    const receita_esperada = 5000 * (1 + Math.random() * 0.3);

    // Receita realista = base + (esperada × 60%)
    const receita_realista = receita_base + receita_esperada * 0.6;

    // Determinar trending
    let trending: "up" | "down" | "stable" = "stable";
    if (receita_realista > anterior * 1.05) {
      trending = "up";
    } else if (receita_realista < anterior * 0.95) {
      trending = "down";
    }

    receitas.push({
      mes,
      receita_base: Math.round(receita_base),
      receita_esperada: Math.round(receita_esperada),
      receita_realista: Math.round(receita_realista),
      trending,
    });

    anterior = receita_realista;
  });

  // Calcular sumário
  const todasReceitas = receitas.map((r) => r.receita_realista);
  const min_garantida = Math.min(...todasReceitas);
  const max_potencial = Math.max(...todasReceitas);
  const media_realista = todasReceitas.reduce((a, b) => a + b, 0) / todasReceitas.length;

  // Crescimento do primeiro para o último mês
  const crescimento = ((todasReceitas[11] - todasReceitas[0]) / todasReceitas[0]) * 100;

  return {
    previsibilidade: receitas,
    summary: {
      min_garantida,
      max_potencial,
      media_realista,
      crescimento,
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Gerar dados (em produção viriam do banco de dados)
    const data = generateForecastData();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao calcular previsibilidade:", error);
    return NextResponse.json(
      { error: "Erro ao calcular previsibilidade" },
      { status: 500 }
    );
  }
}
