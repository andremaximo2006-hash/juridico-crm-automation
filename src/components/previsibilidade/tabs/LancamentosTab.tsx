"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Copy } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AdicionarLancamentoModal } from "../modals/AdicionarLancamentoModal";
import { ConfirmacaoDeleteDialog } from "../dialogs/ConfirmacaoDeleteDialog";

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
];

export function LancamentosTab() {
  const [lancamentos, setLancamentos] = useLocalStorage<Lancamento[]>(
    "previsibilidade_lancamentos",
    LANCAMENTOS_EXEMPLO
  );

  const [openModal, setOpenModal] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<Lancamento | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({
    open: false,
    id: "",
  });

  // Handlers
  const handleAddLancamento = (data: Omit<Lancamento, "id">) => {
    const newLancamento: Lancamento = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setLancamentos([...lancamentos, newLancamento]);
  };

  const handleEditLancamento = (data: Omit<Lancamento, "id">) => {
    if (editingLancamento) {
      setLancamentos(
        lancamentos.map((l) =>
          l.id === editingLancamento.id ? { ...l, ...data } : l
        )
      );
      setEditingLancamento(null);
    }
  };

  const handleDeleteLancamento = (id: string) => {
    setLancamentos(lancamentos.filter((l) => l.id !== id));
  };

  const handleDuplicateLancamento = (id: string) => {
    const lancamentoToDuplicate = lancamentos.find((l) => l.id === id);
    if (lancamentoToDuplicate) {
      const newLancamento: Lancamento = {
        ...lancamentoToDuplicate,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nomeCampanha: `${lancamentoToDuplicate.nomeCampanha} (Cópia)`,
      };
      setLancamentos([...lancamentos, newLancamento]);
    }
  };

  const handleSaveLancamento = (data: Omit<Lancamento, "id">) => {
    if (editingLancamento) {
      handleEditLancamento(data);
    } else {
      handleAddLancamento(data);
    }
    setOpenModal(false);
  };

  const openEditLancamento = (lancamento: Lancamento) => {
    setEditingLancamento(lancamento);
    setOpenModal(true);
  };

  // Cálculos
  const calcularCPM = (investimento: number, impressoes: number) => {
    return impressoes > 0 ? (investimento / (impressoes / 1000)).toFixed(2) : "0";
  };

  const calcularCPC = (investimento: number, cliques: number) => {
    return cliques > 0 ? (investimento / cliques).toFixed(2) : "0";
  };

  const calcularCTR = (cliques: number, impressoes: number) => {
    return impressoes > 0 ? ((cliques / impressoes) * 100).toFixed(2) : "0";
  };

  const calcularCPL = (investimento: number, leads: number) => {
    return leads > 0 ? (investimento / leads).toFixed(2) : "0";
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
          onClick={() => {
            setEditingLancamento(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Nova Campanha
        </button>
      </div>

      {/* Tabela de Lançamentos */}
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
                <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10 text-slate-900 dark:text-white">
                  R$ {lancamento.investimento.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10 text-slate-900 dark:text-white">
                  {lancamento.impressoes.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10 text-slate-900 dark:text-white">
                  {lancamento.cliques.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right bg-yellow-50 dark:bg-yellow-900/10 text-slate-900 dark:text-white">
                  {lancamento.leads}
                </td>
                <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium text-slate-900 dark:text-white">
                  R$ {calcularCPM(lancamento.investimento, lancamento.impressoes)}
                </td>
                <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium text-slate-900 dark:text-white">
                  R$ {calcularCPC(lancamento.investimento, lancamento.cliques)}
                </td>
                <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium text-slate-900 dark:text-white">
                  {calcularCTR(lancamento.cliques, lancamento.impressoes)}%
                </td>
                <td className="px-4 py-3 text-right bg-blue-50 dark:bg-blue-900/10 font-medium text-slate-900 dark:text-white">
                  R$ {calcularCPL(lancamento.investimento, lancamento.leads)}
                </td>
                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => openEditLancamento(lancamento)}
                    className="inline text-blue-600 hover:text-blue-700"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ open: true, id: lancamento.id })}
                    className="inline text-red-600 hover:text-red-700"
                    title="Deletar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateLancamento(lancamento.id)}
                    className="inline text-green-600 hover:text-green-700"
                    title="Duplicar"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AdicionarLancamentoModal
        open={openModal}
        onOpenChange={(open) => {
          setOpenModal(open);
          if (!open) setEditingLancamento(null);
        }}
        onSave={handleSaveLancamento}
        editingLancamento={editingLancamento}
        produtos={["BPC/LOAS", "Aposentadoria"]}
      />

      <ConfirmacaoDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Deletar Campanha?"
        description="Esta ação não pode ser desfeita. A campanha será permanentemente removida."
        onConfirm={() => {
          handleDeleteLancamento(deleteConfirm.id);
          setDeleteConfirm({ open: false, id: "" });
        }}
      />

      {/* Info */}
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 <strong>Campos em AMARELO:</strong> Preencha com dados reais da plataforma · <strong>Campos em AZUL:</strong> Cálculos automáticos
        </p>
      </div>
    </div>
  );
}
