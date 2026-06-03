"use client";

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DADOS_GRAFICO = [
  { mes: "Jan", investimento: 2000, fatPrevisto: 18000, leads: 85, contratos: 5 },
  { mes: "Fev", investimento: 2500, fatPrevisto: 24500, leads: 96, contratos: 7 },
  { mes: "Mar", investimento: 2200, fatPrevisto: 19800, leads: 88, contratos: 6 },
  { mes: "Abr", investimento: 2800, fatPrevisto: 28000, leads: 110, contratos: 8 },
  { mes: "Mai", investimento: 2500, fatPrevisto: 28600, leads: 96, contratos: 8 },
];

export function ResumograficoTab() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        📊 RESUMO GRÁFICOS — TENDÊNCIAS E PERFORMANCE
      </h3>

      {/* Gráfico 1: Investimento vs Faturamento */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h4 className="text-base font-semibold mb-4 text-slate-900 dark:text-white">
          Investimento vs Faturamento Previsto
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={DADOS_GRAFICO}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="mes" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#1e293b", 
                border: "1px solid #475569",
                borderRadius: "8px"
              }}
              formatter={(value) => {
                if (typeof value === 'number' && value > 1000) {
                  return `R$ ${value.toLocaleString("pt-BR")}`;
                }
                return value;
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="investimento" stroke="#3b82f6" strokeWidth={2} name="Investimento (R$)" />
            <Line type="monotone" dataKey="fatPrevisto" stroke="#10b981" strokeWidth={2} name="Fat. Previsto (R$)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico 2: Leads e Contratos */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h4 className="text-base font-semibold mb-4 text-slate-900 dark:text-white">
          Leads Qualificados vs Contratos Fechados
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={DADOS_GRAFICO}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="mes" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#1e293b", 
                border: "1px solid #475569",
                borderRadius: "8px"
              }}
            />
            <Legend />
            <Bar dataKey="leads" fill="#fbbf24" name="Leads" />
            <Bar dataKey="contratos" fill="#10b981" name="Contratos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:border-slate-700 dark:from-blue-900/20 dark:to-blue-900/30">
          <p className="text-xs uppercase font-semibold text-slate-700 dark:text-slate-300">Investimento Médio</p>
          <p className="text-2xl font-bold text-blue-600">R$ 2.410</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">por mês</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-green-50 to-green-100 p-4 dark:border-slate-700 dark:from-green-900/20 dark:to-green-900/30">
          <p className="text-xs uppercase font-semibold text-slate-700 dark:text-slate-300">ROAS Médio</p>
          <p className="text-2xl font-bold text-green-600">10.2x</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">retorno</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 dark:border-slate-700 dark:from-yellow-900/20 dark:to-yellow-900/30">
          <p className="text-xs uppercase font-semibold text-slate-700 dark:text-slate-300">Taxa Conversão</p>
          <p className="text-2xl font-bold text-yellow-600">8.3%</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">leads → contratos</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:border-slate-700 dark:from-purple-900/20 dark:to-purple-900/30">
          <p className="text-xs uppercase font-semibold text-slate-700 dark:text-slate-300">CPL Médio</p>
          <p className="text-2xl font-bold text-purple-600">R$ 26</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">por lead</p>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          📈 <strong>Visualização:</strong> Gráficos de linha e barras mostrando tendências de investimento, faturamento e funil de conversão ao longo do tempo.
        </p>
      </div>
    </div>
  );
}
