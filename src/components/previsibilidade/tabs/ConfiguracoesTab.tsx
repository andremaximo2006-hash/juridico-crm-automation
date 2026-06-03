"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  honorarioMedio: number;
  probRecebimento: number;
  custoOperac: number;
  metaFatMensal: number;
  convLeadAtend: number;
  convAtendContrato: number;
  cplRef: number;
}

const PRODUTOS_EXEMPLO: Produto[] = [
  {
    id: "1",
    nome: "BPC/LOAS",
    honorarioMedio: 6484,
    probRecebimento: 0.65,
    custoOperac: 0.22,
    metaFatMensal: 38591,
    convLeadAtend: 0.177,
    convAtendContrato: 1.0,
    cplRef: 545,
  },
];

export function ConfiguracoesTab() {
  const [produtos, setProdutos] = useState<Produto[]>(PRODUTOS_EXEMPLO);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            ⚙️ CONFIGURAÇÕES
          </h3>
          <button className="flex items-center gap-2 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Novo Produto
          </button>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-4">Preencha os produtos, canais de tráfego pago e canais orgânicos com os dados do seu escritório.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 text-left font-semibold">Produto Jurídico</th>
                <th className="px-4 py-2 text-right font-semibold">Honorário Médio</th>
                <th className="px-4 py-2 text-right font-semibold">Prob. Receb. (%)</th>
                <th className="px-4 py-2 text-right font-semibold">Custo Op. (%)</th>
                <th className="px-4 py-2 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => (
                <tr key={produto.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/10 font-medium">{produto.nome}</td>
                  <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10">
                    R$ {produto.honorarioMedio.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10">
                    {(produto.probRecebimento * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10">
                    {(produto.custoOperac * 100).toFixed(0)}%
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
      </div>

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 <strong>Dica:</strong> Preencha os campos em AMARELO com dados reais do seu escritório. Os cálculos em AZUL serão automáticos.
        </p>
      </div>
    </div>
  );
}
