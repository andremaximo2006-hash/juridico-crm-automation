"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Organico {
  id: string;
  mes: string;
  canalOrganico: string;
  produto: string;
  origemEspecifica: string;
  leads: number;
  atendimentos: number;
  contratos: number;
}

interface AdicionarOrganicoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (organico: Omit<Organico, "id">) => void;
  editingOrganico?: Organico | null;
  produtos?: string[];
  honorariosMedio?: Record<string, number>;
  probRecebimentos?: Record<string, number>;
}

const CANAIS = ["WhatsApp/Indicação", "Instagram", "Google Meu Negócio", "Site/SEO", "Outros"];

export function AdicionarOrganicoModal({
  open,
  onOpenChange,
  onSave,
  editingOrganico,
  produtos = [],
  honorariosMedio = {},
  probRecebimentos = {},
}: AdicionarOrganicoModalProps) {
  const [formData, setFormData] = useState<Omit<Organico, "id">>(
    editingOrganico
      ? {
          mes: editingOrganico.mes,
          canalOrganico: editingOrganico.canalOrganico,
          produto: editingOrganico.produto,
          origemEspecifica: editingOrganico.origemEspecifica,
          leads: editingOrganico.leads,
          atendimentos: editingOrganico.atendimentos,
          contratos: editingOrganico.contratos,
        }
      : {
          mes: "2026-05",
          canalOrganico: "WhatsApp/Indicação",
          produto: produtos[0] || "BPC/LOAS",
          origemEspecifica: "",
          leads: 0,
          atendimentos: 0,
          contratos: 0,
        }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const honorarioMedio = honorariosMedio[formData.produto] || 0;
  const probRecebimento = probRecebimentos[formData.produto] || 0.65;

  const calculos = {
    fatPotencial: formData.contratos * honorarioMedio,
    fatPrevisto: (formData.contratos * honorarioMedio) * probRecebimento,
    lucroPrevisto: ((formData.contratos * honorarioMedio) * probRecebimento) * (1 - 0.22),
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.origemEspecifica.trim()) {
      newErrors.origemEspecifica = "Origem específica é obrigatória";
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
      canalOrganico: "WhatsApp/Indicação",
      produto: produtos[0] || "BPC/LOAS",
      origemEspecifica: "",
      leads: 0,
      atendimentos: 0,
      contratos: 0,
    });
    setErrors({});
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {editingOrganico ? "Editar Lead Orgânico" : "Adicionar Lead Orgânico"}
          </h2>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mês</label>
                <input
                  type="month"
                  value={formData.mes}
                  onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Canal Orgânico</label>
                <select
                  value={formData.canalOrganico}
                  onChange={(e) => setFormData({ ...formData, canalOrganico: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                >
                  {CANAIS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Produto</label>
                <select
                  value={formData.produto}
                  onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                >
                  {produtos.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Origem Específica *</label>
                <input
                  type="text"
                  placeholder="Ex: Indicação cliente X"
                  value={formData.origemEspecifica}
                  onChange={(e) => setFormData({ ...formData, origemEspecifica: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.origemEspecifica
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20"
                  } text-slate-900 dark:text-white`}
                />
              </div>
            </div>
          </div>

          {/* Seção B: DADOS */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Seção B: Dados e Cálculos</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Leads</label>
                <input
                  type="number"
                  value={formData.leads}
                  onChange={(e) => setFormData({ ...formData, leads: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Atendimentos</label>
                <input
                  type="number"
                  value={formData.atendimentos}
                  onChange={(e) => setFormData({ ...formData, atendimentos: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contratos</label>
                <input
                  type="number"
                  value={formData.contratos}
                  onChange={(e) => setFormData({ ...formData, contratos: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Cálculos Automáticos */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fat. Potencial (Azul)</label>
                <input
                  type="text"
                  value={`R$ ${calculos.fatPotencial.toLocaleString("pt-BR")}`}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20 text-slate-900 dark:text-white cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fat. Previsto (Azul)</label>
                <input
                  type="text"
                  value={`R$ ${calculos.fatPrevisto.toLocaleString("pt-BR")}`}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20 text-slate-900 dark:text-white cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lucro Previsto (Azul)</label>
                <input
                  type="text"
                  value={`R$ ${calculos.lucroPrevisto.toLocaleString("pt-BR")}`}
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
            {editingOrganico ? "Atualizar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
