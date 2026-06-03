"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Organico {
  id: string;
  mes: string;
  canalOrganico: string;
  produto: string;
  origemEspecifica: string;
  leads: number;
  atendimentos: number;
  contratos: number;
  honorarioMedio: number;
  probRecebimento: number;
}

const ORGANICO_EXEMPLO: Organico[] = [
  {
    id: "1",
    mes: "2026-05",
    canalOrganico: "WhatsApp/Indicação",
    produto: "BPC/LOAS",
    origemEspecifica: "Indicação do cliente X",
    leads: 12,
    atendimentos: 5,
    contratos: 3,
    honorarioMedio: 6484,
    probRecebimento: 0.65,
  },
  {
    id: "2",
    mes: "2026-05",
    canalOrganico: "Instagram",
    produto: "Aposentadoria",
    origemEspecifica: "Post stories",
    leads: 8,
    atendimentos: 2,
    contratos: 1,
    honorarioMedio: 5000,
    probRecebimento: 0.6,
  },
];

export function OrganicoTab() {
  const [organicos, setOrganicos] = useState<Organico[]>(ORGANICO_EXEMPLO);

  const calcFatPotencial = (contratos: number, honorario: number) => contratos * honorario;
  const calcFatPrevisto = (fatPotencial: number, prob: number) => fatPotencial * prob;
  const calcLucroPrevisto = (fatPrevisto: number) => fatPrevisto * (1 - 0.22); // 22% custo operac

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            🌱 LEADS ORGÂNICOS
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">WhatsApp, Instagram, SEO, Google Meu Negócio</p>
        </div>
        <button className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Novo Lead
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-3 text-left font-semibold">Identificação</th>
              <th className="px-4 py-3 text-right font-semibold bg-yellow-50 dark:bg-yellow-900/10">Leads</th>
              <th className="px-4 py-3 text-right font-semibold bg-yellow-50 dark:bg-yellow-900/10">Atendimentos</th>
              <th className="px-4 py-3 text-right font-semibold bg-yellow-50 dark:bg-yellow-900/10">Contratos</th>
              <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">Fat. Potencial</th>
              <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">Fat. Previsto</th>
              <th className="px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/10">Lucro Previsto</th>
              <th className="px-4 py-3 text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {organicos.map((org) => {
              const fatPot = calcFatPotencial(org.contratos, org.honorarioMedio);
              const fatPrev = calcFatPrevisto(fatPot, org.probRecebimento);
              const lucro = calcLucroPrevisto(fatPrev);

              return (
                <tr key={org.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">{org.canalOrganico}</div>
                    <div className="text-xs text-slate-500">{org.mes} • {org.produto}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{org.origemEspecifica}</div>
                  </td>
                  <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10">{org.leads}</td>
                  <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10">{org.atendimentos}</td>
                  <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10">{org.contratos}</td>
                  <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium">
                    R$ {fatPot.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium text-green-600">
                    R$ {fatPrev.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium text-green-600">
                    R$ {lucro.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
