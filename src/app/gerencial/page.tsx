"use client";

import { Header } from "@/components/layout/Header";
import { useState } from "react";
import { TrendingUp, Users, AlertTriangle } from "lucide-react";

export default function GerencialPage() {
  const [tab, setTab] = useState("performance");

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Módulo Gerencial"
        subtitle="Performance, retenção e rentabilidade do escritório"
      />

      {/* Abas */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="flex gap-4 px-4">
          {[
            { id: "performance", label: "📊 Performance por Advogado" },
            { id: "churn", label: "⚠️ Alerta de Churn" },
            { id: "rentabilidade", label: "📈 Rentabilidade por Área" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`border-b-2 px-4 py-3 font-medium transition ${
                tab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="bg-slate-50 p-4 dark:bg-slate-800">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Advogados Ativos</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">8</p>
              </div>
              <Users className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Receita Mensal</p>
                <p className="text-3xl font-bold text-green-600">R$ 45.230</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Em Risco de Churn</p>
                <p className="text-3xl font-bold text-red-600">2</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo por aba */}
      <div className="flex-1 overflow-auto bg-slate-50 p-4 dark:bg-slate-800">
        {tab === "performance" && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold">📊 Performance por Advogado</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Análise de performance com métricas de casos, receitas e satisfação dos clientes
            </p>
          </div>
        )}

        {tab === "churn" && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold">⚠️ Alerta de Churn</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Advogados com risco de saída baseado em inatividade, satisfação e outras métricas
            </p>
          </div>
        )}

        {tab === "rentabilidade" && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold">📈 Rentabilidade por Área</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Receitas e rentabilidade por área jurídica, custo por caso e margem de lucro
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
