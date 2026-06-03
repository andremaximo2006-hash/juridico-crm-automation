"use client";

import { useState } from "react";
import { InstrucoesTab } from "./tabs/InstrucoesTab";
import { ConfiguracoesTab } from "./tabs/ConfiguracoesTab";
import { LancamentosTab } from "./tabs/LancamentosTab";
import { OrganicoTab } from "./tabs/OrganicoTab";
import { FechamentosTab } from "./tabs/FechamentosTab";
import { ResumoMensalTab } from "./tabs/ResumoMensalTab";
import { ResumograficoTab } from "./tabs/ResumoGraficoTab";
import { DashboardTab } from "./tabs/DashboardTab";
import { SimuladorTab } from "./tabs/SimuladorTab";
import { DadosImportadosTab } from "./tabs/DadosImportadosTab";

type TabType = "instrucoes" | "configuracoes" | "lancamentos" | "organico" | "fechamentos" | "resumo" | "graficos" | "dashboard" | "simulador" | "dados";

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: "instrucoes", label: "📋 Instruções", icon: "📋" },
  { id: "configuracoes", label: "⚙️ Configurações", icon: "⚙️" },
  { id: "lancamentos", label: "📊 Lançamentos", icon: "📊" },
  { id: "organico", label: "🌱 Orgânico", icon: "🌱" },
  { id: "fechamentos", label: "📋 Fechamentos", icon: "📋" },
  { id: "resumo", label: "📅 Resumo Mensal", icon: "📅" },
  { id: "graficos", label: "📊 Resumo Gráficos", icon: "📊" },
  { id: "dashboard", label: "🎯 Dashboard", icon: "🎯" },
  { id: "simulador", label: "🔮 Simulador", icon: "🔮" },
  { id: "dados", label: "📌 Dados Importados", icon: "📌" },
];

export function PrevisibilidadeApp() {
  const [activeTab, setActiveTab] = useState<TabType>("instrucoes");

  return (
    <div className="h-full flex flex-col">
      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 overflow-x-auto">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto bg-slate-50 p-4 dark:bg-slate-800">
        {activeTab === "instrucoes" && <InstrucoesTab />}
        {activeTab === "configuracoes" && <ConfiguracoesTab />}
        {activeTab === "lancamentos" && <LancamentosTab />}
        {activeTab === "organico" && <OrganicoTab />}
        {activeTab === "fechamentos" && <FechamentosTab />}
        {activeTab === "resumo" && <ResumoMensalTab />}
        {activeTab === "graficos" && <ResumograficoTab />}
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "simulador" && <SimuladorTab />}
        {activeTab === "dados" && <DadosImportadosTab />}
      </div>
    </div>
  );
}
