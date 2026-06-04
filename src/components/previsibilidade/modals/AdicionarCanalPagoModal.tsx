"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface CanalPago {
  id: string;
  nome: string;
  metaOrcamento: number;
  cpcMedio: number;
  convCliqueLead: number;
  cplMeta: number;
  retornoPercent: number;
  obs: string;
}

interface AdicionarCanalPagoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (canal: Omit<CanalPago, "id">) => void;
  editingCanal?: CanalPago | null;
  existingNomes?: string[];
}

const CANAIS_OPCOES = ["Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads", "Outros"];

export function AdicionarCanalPagoModal({
  open,
  onOpenChange,
  onSave,
  editingCanal,
  existingNomes = [],
}: AdicionarCanalPagoModalProps) {
  const [formData, setFormData] = useState<Omit<CanalPago, "id">>(
    editingCanal
      ? {
          nome: editingCanal.nome,
          metaOrcamento: editingCanal.metaOrcamento,
          cpcMedio: editingCanal.cpcMedio,
          convCliqueLead: editingCanal.convCliqueLead,
          cplMeta: editingCanal.cplMeta,
          retornoPercent: editingCanal.retornoPercent,
          obs: editingCanal.obs,
        }
      : {
          nome: "Meta Ads",
          metaOrcamento: 8000,
          cpcMedio: 2.5,
          convCliqueLead: 0.08,
          cplMeta: 180,
          retornoPercent: 0,
          obs: "",
        }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const otherNomes = editingCanal
      ? existingNomes.filter((n) => n !== editingCanal.nome)
      : existingNomes;

    if (otherNomes.includes(formData.nome)) {
      newErrors.nome = "Já existe um canal com este nome";
    }

    if (formData.metaOrcamento < 0) {
      newErrors.metaOrcamento = "Deve ser um valor positivo";
    }

    if (formData.cpcMedio < 0) {
      newErrors.cpcMedio = "Deve ser um valor positivo";
    }

    if (formData.convCliqueLead < 0 || formData.convCliqueLead > 1) {
      newErrors.convCliqueLead = "Deve estar entre 0 e 1 (0-100%)";
    }

    if (formData.cplMeta < 0) {
      newErrors.cplMeta = "Deve ser um valor positivo";
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
      nome: "Meta Ads",
      metaOrcamento: 8000,
      cpcMedio: 2.5,
      convCliqueLead: 0.08,
      cplMeta: 180,
      retornoPercent: 0,
      obs: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {editingCanal ? "Editar Canal de Tráfego" : "Adicionar Canal de Tráfego"}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Canal *
              </label>
              <select
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.nome
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20"
                } text-slate-900 dark:text-white`}
              >
                {CANAIS_OPCOES.map((canal) => (
                  <option key={canal} value={canal}>
                    {canal}
                  </option>
                ))}
              </select>
              {errors.nome && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.nome}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Meta Orçamento (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.metaOrcamento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metaOrcamento: parseFloat(e.target.value) || 0,
                  })
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.metaOrcamento
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20"
                } text-slate-900 dark:text-white`}
              />
              {errors.metaOrcamento && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.metaOrcamento}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                CPC Médio (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cpcMedio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cpcMedio: parseFloat(e.target.value) || 0,
                  })
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.cpcMedio
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20"
                } text-slate-900 dark:text-white`}
              />
              {errors.cpcMedio && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.cpcMedio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Conv. Clique→Lead (0-1) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.convCliqueLead}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    convCliqueLead: parseFloat(e.target.value) || 0,
                  })
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.convCliqueLead
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20"
                } text-slate-900 dark:text-white`}
              />
              {errors.convCliqueLead && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.convCliqueLead}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                CPL Meta (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cplMeta}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cplMeta: parseFloat(e.target.value) || 0,
                  })
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.cplMeta
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20"
                } text-slate-900 dark:text-white`}
              />
              {errors.cplMeta && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.cplMeta}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                % Retorno (futuro)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.retornoPercent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    retornoPercent: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Observações
              </label>
              <textarea
                value={formData.obs}
                onChange={(e) => setFormData({ ...formData, obs: e.target.value })}
                placeholder="Ex: Facebook/Instagram · remarketing"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 text-slate-900 dark:text-white"
                rows={2}
              />
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
            {editingCanal ? "Atualizar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
