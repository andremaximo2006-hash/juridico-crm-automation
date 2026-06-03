"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PrevisibilidadeData {
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

export function PrevisibilidadeTab() {
  const [data, setData] = useState<PrevisibilidadeData[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/previsibilidade");
        if (!response.ok) {
          throw new Error("Erro ao carregar dados de previsibilidade");
        }
        const result = await response.json();
        setData(result.previsibilidade);
        setSummary(result.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-slate-600 dark:text-slate-400">Carregando dados de previsibilidade...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">Receita Mínima Garantida</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(summary.min_garantida)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">Receita Máxima Potencial</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(summary.max_potencial)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">Média Realista (12m)</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(summary.media_realista)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">Crescimento Esperado</p>
            <p className={`mt-2 text-2xl font-bold ${summary.crescimento >= 0 ? "text-green-600" : "text-red-600"}`}>
              {summary.crescimento >= 0 ? "+" : ""}{summary.crescimento.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Gráfico de Tendência */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">📊 Tendência de Receitas (12 meses)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="mes" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
              }}
              formatter={(value: any) =>
                typeof value === 'number'
                  ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
                  : value
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="receita_base"
              stroke="#3b82f6"
              name="Receita Base"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="receita_esperada"
              stroke="#10b981"
              name="Receita Esperada"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="receita_realista"
              stroke="#f59e0b"
              name="Receita Realista"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela de Detalhes */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">📋 Detalhamento Mensal</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Período</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">Receita Base</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">Receita Esperada</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">Receita Realista</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">Tendência</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b border-slate-200 dark:border-slate-700">
                  <td className="px-4 py-3 text-slate-900 dark:text-white">{row.mes}</td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(row.receita_base)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      row.receita_esperada
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-amber-600">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      row.receita_realista
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.trending === "up" && <TrendingUp className="mx-auto h-5 w-5 text-green-600" />}
                    {row.trending === "down" && <TrendingDown className="mx-auto h-5 w-5 text-red-600" />}
                    {row.trending === "stable" && <div className="mx-auto h-5 w-5 text-slate-400">→</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
