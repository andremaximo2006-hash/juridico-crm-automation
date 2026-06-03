"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Fechamento {
  id: string;
  data: string;
  cliente: string;
  produto: string;
  area: string;
  canal: string;
  setor: string;
  obs: string;
  situacao: string;
  honorarios: number;
}

const FECHAMENTOS_EXEMPLO: Fechamento[] = [
  {
    id: "1",
    data: "2026-05-15",
    cliente: "João Silva",
    produto: "BPC/LOAS",
    area: "Previdenciário",
    canal: "Meta Ads",
    setor: "Iniciais",
    obs: "Processo em andamento",
    situacao: "Em Andamento",
    honorarios: 6484,
  },
  {
    id: "2",
    data: "2026-05-20",
    cliente: "Maria Santos",
    produto: "Salário Maternidade",
    area: "Previdenciário",
    canal: "Orgânico",
    setor: "Recepção",
    obs: "Documentação completa",
    situacao: "Benefício Concedido",
    honorarios: 4200,
  },
];

const AREAS = ["Previdenciário", "Trabalhista", "Família", "Cível"];
const CANAIS = ["🔵 Meta Ads", "🟠 Orgânico", "🌐 Google Ads", "📱 TikTok"];
const SETORES = ["Triagem", "Iniciais", "Recepção", "Relacionamento"];
const SITUACOES = [
  "Em Andamento",
  "Benefício Concedido",
  "Benefício Negado",
  "Sem Viabilidade",
  "Sem Retorno",
  "Desistência",
  "Morreu",
  "Acordo",
  "Encerrado",
  "Pendente",
];

export function FechamentosTab() {
  const [fechamentos, setFechamentos] = useState<Fechamento[]>(FECHAMENTOS_EXEMPLO);

  const totalFechamentos = fechamentos.length;
  const totalHonorarios = fechamentos.reduce((sum, f) => sum + f.honorarios, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total de Contratos</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalFechamentos}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">Honorários Acertados</p>
          <p className="text-3xl font-bold text-green-600">R$ {totalHonorarios.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">Taxa Conversão</p>
          <p className="text-3xl font-bold text-blue-600">{((totalFechamentos / 50) * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          📋 CONTROLE DE PRAZOS E STATUS
        </h3>
        <button className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Novo Contrato
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-3 text-left font-semibold">Data</th>
              <th className="px-4 py-3 text-left font-semibold">Cliente</th>
              <th className="px-4 py-3 text-left font-semibold">Produto</th>
              <th className="px-4 py-3 text-left font-semibold bg-blue-50 dark:bg-blue-900/10">Área</th>
              <th className="px-4 py-3 text-left font-semibold bg-blue-50 dark:bg-blue-900/10">Canal</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Honorários</th>
              <th className="px-4 py-3 text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {fechamentos.map((fech) => (
              <tr key={fech.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 text-sm text-slate-600">{fech.data}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{fech.cliente}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fech.produto}</td>
                <td className="px-4 py-3 bg-blue-50 dark:bg-blue-900/10 text-sm">{fech.area}</td>
                <td className="px-4 py-3 bg-blue-50 dark:bg-blue-900/10 text-sm">{fech.canal}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      fech.situacao === "Benefício Concedido"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {fech.situacao}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-green-600">
                  {fech.honorarios ? `R$ ${fech.honorarios.toLocaleString("pt-BR")}` : "—"}
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

      <p className="text-sm text-slate-600 dark:text-slate-400">
        <strong>{totalFechamentos} contratos reais</strong> · Rastreamento desde entrada até conclusão
      </p>
    </div>
  );
}
