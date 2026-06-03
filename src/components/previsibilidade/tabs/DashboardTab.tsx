"use client";

import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";

interface KPI {
  label: string;
  valor: string | number;
  meta: string | number;
  status: "ok" | "warning" | "success";
  icon: React.ComponentType<{ className: string }>;
  descricao: string;
}

const KPIS: KPI[] = [
  {
    label: "Faturamento Previsto",
    valor: "R$ 24.600",
    meta: "R$ 25.000",
    status: "ok",
    icon: TrendingUp,
    descricao: "Faturamento esperado do mês atual"
  },
  {
    label: "ROAS",
    valor: "10.2x",
    meta: "8x",
    status: "success",
    icon: CheckCircle,
    descricao: "Retorno sobre investimento em publicidade"
  },
  {
    label: "CPL",
    valor: "R$ 26",
    meta: "R$ 30",
    status: "success",
    icon: CheckCircle,
    descricao: "Custo por lead qualificado"
  },
  {
    label: "Taxa de Conversão",
    valor: "8.3%",
    meta: "10%",
    status: "warning",
    icon: AlertCircle,
    descricao: "Leads → Contratos"
  },
  {
    label: "Leads Este Mês",
    valor: 96,
    meta: 100,
    status: "ok",
    icon: TrendingUp,
    descricao: "Leads qualificados capturados"
  },
  {
    label: "Contratos Fechados",
    valor: 8,
    meta: 10,
    status: "warning",
    icon: AlertCircle,
    descricao: "Contratos assinados neste mês"
  },
  {
    label: "Receita por Lead",
    valor: "R$ 287",
    meta: "R$ 300",
    status: "ok",
    icon: TrendingUp,
    descricao: "Faturamento médio por lead"
  },
  {
    label: "Investimento Total",
    valor: "R$ 2.500",
    meta: "R$ 2.500",
    status: "success",
    icon: CheckCircle,
    descricao: "Investimento em publicidade paga"
  },
];

function StatusBadge({ status }: { status: "ok" | "warning" | "success" }) {
  if (status === "success") {
    return <span className="inline-block px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-semibold">✓ Meta atingida</span>;
  }
  if (status === "warning") {
    return <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-semibold">⚠ Abaixo da meta</span>;
  }
  return <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-semibold">→ No caminho</span>;
}

export function DashboardTab() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          🎯 DASHBOARD EXECUTIVO — KPIS
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Indicadores-chave de desempenho em tempo real
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {KPIS.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`rounded-lg border p-5 transition-colors ${
                kpi.status === "success"
                  ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                  : kpi.status === "warning"
                  ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20"
                  : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs uppercase font-semibold text-slate-700 dark:text-slate-300">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {kpi.valor}
                  </p>
                </div>
                <Icon className={`w-5 h-5 ${
                  kpi.status === "success"
                    ? "text-green-600"
                    : kpi.status === "warning"
                    ? "text-yellow-600"
                    : "text-blue-600"
                }`} />
              </div>

              <div className="space-y-2 border-t pt-3 border-current border-opacity-10">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Meta: <span className="font-semibold">{kpi.meta}</span>
                </p>
                <StatusBadge status={kpi.status} />
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                {kpi.descricao}
              </p>
            </div>
          );
        })}
      </div>

      {/* Alertas Importantes */}
      <div className="space-y-3">
        <h4 className="font-semibold text-slate-900 dark:text-white">⚠️ Alertas</h4>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900 dark:text-yellow-200">Taxa de Conversão abaixo da meta</p>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
              Você está em 8.3% e a meta é 10%. Revise o funil de atendimento ou aumente a qualificação de leads.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-200">Contratos abaixo da meta</p>
            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
              8 contratos vs 10 esperados. Aumente investimento em publicidade ou melhore qualidade dos leads.
            </p>
          </div>
        </div>
      </div>

      {/* Recomendações */}
      <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 p-4">
        <p className="text-sm text-green-900 dark:text-green-200">
          ✓ <strong>Pontos positivos:</strong> ROAS (10.2x) e CPL (R$ 26) estão excelentes! Mantenha essa estratégia.
        </p>
      </div>
    </div>
  );
}
