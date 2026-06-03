"use client";

import { useState } from "react";
import { X } from "lucide-react";

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

interface AdicionarProdutoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (produto: Omit<Produto, "id">) => void;
  editingProduto?: Produto | null;
  existingNomes?: string[];
}

export function AdicionarProdutoModal({
  open,
  onOpenChange,
  onSave,
  editingProduto,
  existingNomes = [],
}: AdicionarProdutoModalProps) {
  const [formData, setFormData] = useState<Omit<Produto, "id">>(
    editingProduto
      ? {
          nome: editingProduto.nome,
          honorarioMedio: editingProduto.honorarioMedio,
          probRecebimento: editingProduto.probRecebimento,
          custoOperac: editingProduto.custoOperac,
          metaFatMensal: editingProduto.metaFatMensal,
          convLeadAtend: editingProduto.convLeadAtend,
          convAtendContrato: editingProduto.convAtendContrato,
          cplRef: editingProduto.cplRef,
        }
      : {
          nome: "",
          honorarioMedio: 0,
          probRecebimento: 0.65,
          custoOperac: 0.22,
          metaFatMensal: 0,
          convLeadAtend: 0.177,
          convAtendContrato: 1.0,
          cplRef: 0,
        }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome do produto é obrigatório";
    }

    const otherNomes = editingProduto
      ? existingNomes.filter((n) => n !== editingProduto.nome)
      : existingNomes;

    if (otherNomes.includes(formData.nome)) {
      newErrors.nome = "Já existe um produto com este nome";
    }

    if (formData.honorarioMedio <= 0) {
      newErrors.honorarioMedio = "Honorário deve ser maior que 0";
    }

    if (formData.probRecebimento < 0 || formData.probRecebimento > 1) {
      newErrors.probRecebimento = "Deve estar entre 0 e 1 (0-100%)";
    }

    if (formData.custoOperac < 0 || formData.custoOperac > 1) {
      newErrors.custoOperac = "Deve estar entre 0 e 1 (0-100%)";
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
      nome: "",
      honorarioMedio: 0,
      probRecebimento: 0.65,
      custoOperac: 0.22,
      metaFatMensal: 0,
      convLeadAtend: 0.177,
      convAtendContrato: 1.0,
      cplRef: 0,
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
            {editingProduto ? "Editar Produto" : "Adicionar Novo Produto"}
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
          {/* Seção A: Identificação */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Informações Básicas
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                placeholder="Ex: BPC/LOAS, Aposentadoria"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.nome
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20"
                } text-slate-900 dark:text-white`}
              />
              {errors.nome && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.nome}
                </p>
              )}
            </div>
          </div>

          {/* Seção B: Dados Financeiros */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Dados Financeiros
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Honorário Médio (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.honorarioMedio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      honorarioMedio: parseFloat(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white`}
                />
                {errors.honorarioMedio && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {errors.honorarioMedio}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Meta Fat. Mensal (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.metaFatMensal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metaFatMensal: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Prob. Recebimento (0-1)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.probRecebimento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      probRecebimento: parseFloat(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.probRecebimento
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20"
                  } text-slate-900 dark:text-white`}
                />
                {errors.probRecebimento && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {errors.probRecebimento}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Custo Operacional (0-1)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.custoOperac}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      custoOperac: parseFloat(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.custoOperac
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20"
                  } text-slate-900 dark:text-white`}
                />
                {errors.custoOperac && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {errors.custoOperac}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  CPL Referência (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cplRef}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cplRef: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Seção C: Taxas de Conversão */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Taxas de Conversão
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Conv. Lead → Atendimento
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.convLeadAtend}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      convLeadAtend: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Conv. Atendimento → Contrato
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.convAtendContrato}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      convAtendContrato: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 text-slate-900 dark:text-white"
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
            {editingProduto ? "Atualizar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
