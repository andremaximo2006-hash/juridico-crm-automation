"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { BarChart3 } from "lucide-react";

export default function MarketingPage() {
  const [campaign, setCampaign] = useState({
    channel: "",
    campaignName: "",
    periodStart: "",
    periodEnd: "",
    investimento: "",
  });

  const handleAnalyze = () => {
    console.log("Analisando campanha:", campaign);
  };

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Marketing"
        subtitle="Análise de campanhas e geração de conteúdo"
      />

      <div className="flex-1 overflow-auto bg-slate-50 p-3 dark:bg-slate-800">
        <div className="grid gap-3 md:grid-cols-2">
          {/* Formulário */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold">🎯 Análise de Campanha</h3>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Canal
                </label>
                <select
                  value={campaign.channel}
                  onChange={(e) =>
                    setCampaign({ ...campaign, channel: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Selecione</option>
                  <option value="instagram">Instagram</option>
                  <option value="google">Google</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nome da Campanha
                </label>
                <input
                  type="text"
                  value={campaign.campaignName}
                  onChange={(e) =>
                    setCampaign({ ...campaign, campaignName: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder="Ex: Black Friday 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Início
                  </label>
                  <input
                    type="date"
                    value={campaign.periodStart}
                    onChange={(e) =>
                      setCampaign({
                        ...campaign,
                        periodStart: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Fim
                  </label>
                  <input
                    type="date"
                    value={campaign.periodEnd}
                    onChange={(e) =>
                      setCampaign({ ...campaign, periodEnd: e.target.value })
                    }
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Investimento (R$)
                </label>
                <input
                  type="number"
                  value={campaign.investimento}
                  onChange={(e) =>
                    setCampaign({ ...campaign, investimento: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder="0,00"
                />
              </div>

              <button
                onClick={handleAnalyze}
                className="mt-2 flex items-center justify-center gap-2 rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
              >
                <BarChart3 size={20} /> Analisar com Claude
              </button>
            </div>
          </div>

          {/* Resultados */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold">📈 Resultados</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Preencha o formulário e clique em "Analisar" para ver os resultados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
