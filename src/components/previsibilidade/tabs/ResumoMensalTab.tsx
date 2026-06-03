"use client";

import { useState } from "react";

interface DadosMes {
  mes: string;
  canalPago: string;
  canalOrganico: string;
  investimento: number;
  leads: number;
  leadsBrutos: number;
  atendimentos: number;
  contratos: number;
  honorarioMedio: number;
  fatPotencial: number;
  probRecebimento: number;
  fatPrevisto: number;
}

const MESES_EXEMPLO: DadosMes[] = [
  {
    mes: "2026-05",
    canalPago: "Meta Ads",
    canalOrganico: "WhatsApp/Instagram",
    investimento: 2500,
    leads: 96,
    leadsBrutos: 108,
    atendimentos: 15,
    contratos: 8,
    honorarioMedio: 5500,
    fatPotencial: 44000,
    probRecebimento: 0.65,
    fatPrevisto: 28600,
  },
];

export function ResumoMensalTab() {
  const [dados] = useState<DadosMes[]>(MESES_EXEMPLO);

  const calcROAS = (investimento: number, fatPrevisto: number) => {
    if (investimento === 0) return 0;
    return (fatPrevisto / investimento).toFixed(2);
  };

  const calcCPL = (investimento: number, leads: number) => {
    if (leads === 0) return 0;
    return (investimento / leads).toFixed(2);
  };

  const calcCPAt = (investimento: number, atendimentos: number) => {
    if (atendimentos === 0) return 0;
    return (investimento / atendimentos).toFixed(2);
  };

  const calcCPC = (contratos: number, investimento: number) => {
    if (contratos === 0) return 0;
    return (investimento / contratos).toFixed(2);
  };

  const totalInvestimento = dados.reduce((sum, d) => sum + d.investimento, 0);
  const totalLeads = dados.reduce((sum, d) => sum + d.leads, 0);
  const totalAtendimentos = dados.reduce((sum, d) => sum + d.atendimentos, 0);
  const totalContratos = dados.reduce((sum, d) => sum + d.contratos, 0);
  const totalFatPrevisto = dados.reduce((sum, d) => sum + d.fatPrevisto, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        📅 RESUMO MENSAL — PAGO + ORGÂNICO
      </h3>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-5 gap-3">
        <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:border-slate-700 dark:from-blue-900/20 dark:to-blue-900/30">
          <p className="text-xs uppercase font-semibold text-slate-700 dark:text-slate-300">Investimento Total</p>
          <p className="text-2xl font-bold text-blue-600">R$ {totalInvestimento.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 dark:border-slate-700 dark:from-yellow-900/20 dark:to-yellow-900/30">
          <p className="text-xs uppercase font-semibold text-slate-700 dark:text-slate-300">Leads Qualificados</p>
          <p className="text-2xl font-bold text-yellow-600">{totalLeads}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:border-slate-700 dark:from-purple-900/20 dark:to-purple-900/30">
          <p className="text-xs uppercase font-semibold text-slate-700 dark:text-slate-300">Atendimentos</p>
          <p className="text-2xl font-bold text-purple-600">{totalAtendimentos}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-green-50 to-green-100 p-4 dark:border-slate-700 dark:from-green-900/20 dark:to-green-900/30">
          <p className="text-xs uppercase font-semibold text-slate-700 dark:text-slate-300">Contratos</p>
          <p className="text-2xl font-bold text-green-600">{totalContratos}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-green-50 to-green-100 p-4 dark:border-slate-700 dark:from-green-900/20 dark:to-green-900/30">
          <p className="text-xs uppercase font-semibold text-slate-700 dark:text-slate-300">Faturamento Previsto</p>
          <p className="text-2xl font-bold text-green-600">R$ {totalFatPrevisto.toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-3 text-left font-semibold">Período</th>
              <th className="px-4 py-3 text-right font-semibold bg-yellow-50 dark:bg-yellow-900/10">Investimento</th>
              <th className="px-4 py-3 text-right font-semibold">Leads</th>
              <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">CPL</th>
              <th className="px-4 py-3 text-right font-semibold">Atendimentos</th>
              <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">CPAt</th>
              <th className="px-4 py-3 text-right font-semibold">Contratos</th>
              <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">CPC</th>
              <th className="px-4 py-3 text-right font-semibold">Fat. Potencial</th>
              <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">Fat. Previsto</th>
              <th className="px-4 py-3 text-right font-semibold">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((d) => (
              <tr key={d.mes} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{d.mes}</td>
                <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10 font-medium">
                  R$ {d.investimento.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{d.leads}</td>
                <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium">
                  R$ {calcCPL(d.investimento, d.leads)}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{d.atendimentos}</td>
                <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium">
                  R$ {calcCPAt(d.investimento, d.atendimentos)}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{d.contratos}</td>
                <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium">
                  R$ {calcCPC(d.contratos, d.investimento)}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">
                  R$ {d.fatPotencial.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-bold text-green-600">
                  R$ {d.fatPrevisto.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right font-bold text-green-600">
                  {calcROAS(d.investimento, d.fatPrevisto)}x
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 <strong>Resumo:</strong> Consolida tráfego pago (campanhas em Lançamentos) + orgânico (whatsapp, indicações, etc) para visualizar funil completo e ROAS real do investimento.
        </p>
      </div>
    </div>
  );
}
