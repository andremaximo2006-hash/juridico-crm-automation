"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Lancamento {
  id: string;
  mes: string;
  canal: string;
  produto: string;
  nomeCampanha: string;
  status: string;
  investimento: number;
  impressoes: number;
  cliques: number;
  leads: number;
  leadsQualif: number;
  atendimentos: number;
  contratos: number;
}

const LANCAMENTOS_EXEMPLO: Lancamento[] = [
  {
    id: "1",
    mes: "2026-05",
    canal: "Meta Ads",
    produto: "BPC/LOAS",
    nomeCampanha: "[BPC/LOAS] [AVC] 05/2026",
    status: "Ativa",
    investimento: 2500,
    impressoes: 45000,
    cliques: 1200,
    leads: 96,
    leadsQualif: 85,
    atendimentos: 15,
    contratos: 12,
  },
  {
    id: "2",
    mes: "2026-05",
    canal: "Google Ads",
    produto: "Aposentadoria",
    nomeCampanha: "[Aposentadoria] Search 05/2026",
    status: "Ativa",
    investimento: 3000,
    impressoes: 28000,
    cliques: 1680,
    leads: 168,
    leadsQualif: 145,
    atendimentos: 36,
    contratos: 28,
  },
];

export function LancamentosTab() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(LANCAMENTOS_EXEMPLO);
  const [showForm, setShowForm] = useState(false);

  // Cálculos automáticos
  const calcularCPM = (investimento: number, impressoes: number) => {
    return impressoes > 0 ? ((investimento / impressoes) * 1000).toFixed(2) : "0.00";
  };

  const calcularCPC = (investimento: number, cliques: number) => {
    return cliques > 0 ? (investimento / cliques).toFixed(2) : "0.00";
  };

  const calcularCTR = (cliques: number, impressoes: number) => {
    return impressoes > 0 ? ((cliques / impressoes) * 100).toFixed(2) : "0.00";
  };

  const calcularCPL = (investimento: number, leads: number) => {
    return leads > 0 ? (investimento / leads).toFixed(2) : "0.00";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            📊 LANÇAMENTOS
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Campanhas de tráfego pago</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Nova Campanha
        </button>
      </div>

      {/* Seção A: IDENTIFICAÇÃO */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">Seção A: IDENTIFICAÇÃO</h4>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Mês</label>
            <input
              type="month"
              className="mt-1 w-full rounded border border-slate-300 bg-yellow-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-yellow-900/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Canal</label>
            <select className="mt-1 w-full rounded border border-slate-300 bg-yellow-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-yellow-900/20">
              <option>Meta Ads</option>
              <option>Google Ads</option>
              <option>TikTok Ads</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Produto</label>
            <select className="mt-1 w-full rounded border border-slate-300 bg-yellow-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-yellow-900/20">
              <option>BPC/LOAS</option>
              <option>Aposentadoria</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Nome da Campanha</label>
            <input
              type="text"
              placeholder="Ex: [BPC/LOAS] [AVC] 05/2026"
              className="mt-1 w-full rounded border border-slate-300 bg-yellow-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-yellow-900/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Status</label>
            <select className="mt-1 w-full rounded border border-slate-300 bg-yellow-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-yellow-900/20">
              <option>Ativa</option>
              <option>Pausada</option>
              <option>Encerrada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seção B: DADOS REAIS */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-3 text-left font-semibold">Campanha</th>
              <th className="px-4 py-3 text-right font-semibold bg-yellow-50 dark:bg-yellow-900/10">Investimento</th>
              <th className="px-4 py-3 text-right font-semibold bg-yellow-50 dark:bg-yellow-900/10">Impressões</th>
              <th className="px-4 py-3 text-right font-semibold bg-yellow-50 dark:bg-yellow-900/10">Cliques</th>
              <th className="px-4 py-3 text-right font-semibold bg-yellow-50 dark:bg-yellow-900/10">Leads</th>
              <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">CPM</th>
              <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">CPC</th>
              <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">CTR (%)</th>
              <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">CPL</th>
              <th className="px-4 py-3 text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map((lancamento) => (
              <tr key={lancamento.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-white">{lancamento.nomeCampanha}</div>
                  <div className="text-xs text-slate-500">{lancamento.mes} • {lancamento.canal}</div>
                </td>
                <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10">
                  R$ {lancamento.investimento.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10">
                  {lancamento.impressoes.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10">
                  {lancamento.cliques.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10">
                  {lancamento.leads}
                </td>
                <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium">
                  R$ {calcularCPM(lancamento.investimento, lancamento.impressoes)}
                </td>
                <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium">
                  R$ {calcularCPC(lancamento.investimento, lancamento.cliques)}
                </td>
                <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium">
                  {calcularCTR(lancamento.cliques, lancamento.impressoes)}%
                </td>
                <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium">
                  R$ {calcularCPL(lancamento.investimento, lancamento.leads)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 <strong>Campos em AMARELO:</strong> Preencha com dados reais da plataforma · <strong>Campos em AZUL:</strong> Cálculos automáticos
        </p>
      </div>
    </div>
  );
}
