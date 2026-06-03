"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";

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

interface AdicionarLancamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (lancamento: Omit<Lancamento, "id">) => void;
  editingLancamento?: Lancamento | null;
  produtos?: string[];
}

const MESES = [
  { value: "2026-01", label: "Janeiro/2026" },
  { value: "2026-02", label: "Fevereiro/2026" },
  { value: "2026-03", label: "Março/2026" },
  { value: "2026-04", label: "Abril/2026" },
  { value: "2026-05", label: "Maio/2026" },
  { value: "2026-06", label: "Junho/2026" },
];

const CANAIS = ["Meta Ads", "Google Ads", "TikTok Ads"];
const STATUS_OPTIONS = ["Ativa", "Pausada", "Encerrada"];

export function AdicionarLancamentoModal({
  open,
  onOpenChange,
  onSave,
  editingLancamento,
  produtos = [],
}: AdicionarLancamentoModalProps) {
  const [formData, setFormData] = useState<Omit<Lancamento, "id">>(
    editingLancamento
      ? {
          mes: editingLancamento.mes,
          canal: editingLancamento.canal,
          produto: editingLancamento.produto,
          nomeCampanha: editingLancamento.nomeCampanha,
          status: editingLancamento.status,
          investimento: editingLancamento.investimento,
          impressoes: editingLancamento.impressoes,
          cliques: editingLancamento.cliques,
          leads: editingLancamento.leads,
          leadsQualif: editingLancamento.leadsQualif,
          atendimentos: editingLancamento.atendimentos,
          contratos: editingLancamento.contratos,
        }
      : {
          mes: "2026-05",
          canal: "Meta Ads",
          produto: produtos[0] || "BPC/LOAS",
          nomeCampanha: "",
          status: "Ativa",
          investimento: 0,
          impressoes: 0,
          cliques: 0,
          leads: 0,
          leadsQualif: 0,
          atendimentos: 0,
          contratos: 0,
        }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cálculos automáticos
  const calculos = useMemo(() => {
    return {
      CPM: formData.impressoes > 0 ? (formData.investimento / (formData.impressoes / 1000)).toFixed(2) : "0",
      CPC: formData.cliques > 0 ? (formData.investimento / formData.cliques).toFixed(2) : "0",
      CTR: formData.impressoes > 0 ? ((formData.cliques / formData.impressoes) * 100).toFixed(2) : "0",
      CPL: formData.leads > 0 ? (formData.investimento / formData.leads).toFixed(2) : "0",
    };
  }, [formData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeCampanha.trim()) {
      newErrors.nomeCampanha = "Nome da campanha é obrigatório";
    }

    if (formData.investimento < 0) {
      newErrors.investimento = "Deve ser um valor positivo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      mes: "2026-05",
      canal: "Meta Ads",
      produto: produtos[0] || "BPC/LOAS",
      nomeCampanha: "",
      status: "Ativa",
      investimento: 0,
      impressoes: 0,
      cliques: 0,
      leads: 0,
      leadsQualif: 0,
      atendimentos: 0,
      contratos: 0,
    });
    setErrors({});
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {editingLancamento ? "Editar Lançamento" : "Adicionar Nova Campanha"}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Seção A: IDENTIFICAÇÃO */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">Seção A: Identificação</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Mês
                </label>
                <select
                  value={formData.mes}
                  onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                >
                  {MESES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Canal
                </label>
                <select
                  value={formData.canal}
                  onChange={(e) => setFormData({ ...formData, canal: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                >
                  {CANAIS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Produto Jurídico
                </label>
                <select
                  value={formData.produto}
                  onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                >
                  {produtos.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Campanha *
                </label>
                <input
                  type="text"
                  placeholder="Ex: [BPC/LOAS] [AVC] 05/2026"
                  value={formData.nomeCampanha}
                  onChange={(e) => setFormData({ ...formData, nomeCampanha: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.nomeCampanha
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20"
                  } text-slate-900 dark:text-white`}
                />
                {errors.nomeCampanha && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.nomeCampanha}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção B: DADOS REAIS */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Seção B: Dados Reais do Período</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Investimento (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.investimento}
                  onChange={(e) => setFormData({ ...formData, investimento: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Impressões
                </label>
                <input
                  type="number"
                  value={formData.impressoes}
                  onChange={(e) => setFormData({ ...formData, impressoes: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Cliques
                </label>
                <input
                  type="number"
                  value={formData.cliques}
                  onChange={(e) => setFormData({ ...formData, cliques: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Leads
                </label>
                <input
                  type="number"
                  value={formData.leads}
                  onChange={(e) => setFormData({ ...formData, leads: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Leads Qualificados
                </label>
                <input
                  type="number"
                  value={formData.leadsQualif}
                  onChange={(e) => setFormData({ ...formData, leadsQualif: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Atendimentos
                </label>
                <input
                  type="number"
                  value={formData.atendimentos}
                  onChange={(e) => setFormData({ ...formData, atendimentos: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Contratos
                </label>
                <input
                  type="number"
                  value={formData.contratos}
                  onChange={(e) => setFormData({ ...formData, contratos: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Seção C: CÁLCULOS AUTOMÁTICOS (Display Only) */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Seção C: Cálculos Automáticos</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  CPM (R$)
                </label>
                <input
                  type="text"
                  value={calculos.CPM}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20 text-slate-900 dark:text-white cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  CPC (R$)
                </label>
                <input
                  type="text"
                  value={calculos.CPC}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20 text-slate-900 dark:text-white cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  CTR (%)
                </label>
                <input
                  type="text"
                  value={calculos.CTR}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20 text-slate-900 dark:text-white cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  CPL (R$)
                </label>
                <input
                  type="text"
                  value={calculos.CPL}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20 text-slate-900 dark:text-white cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            {editingLancamento ? "Atualizar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
