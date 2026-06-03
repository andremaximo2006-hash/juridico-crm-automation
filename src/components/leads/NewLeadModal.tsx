"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface NewLeadModalProps {
  onClose: () => void;
}

export function NewLeadModal({ onClose }: NewLeadModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    originChannel: "",
    caseSummary: "",
    cpf: "",
    profession: "",
    estimatedIncome: "",
    legalArea: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          estimatedIncome: form.estimatedIncome ? parseFloat(form.estimatedIncome) : null,
        }),
      });
      router.refresh();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Novo Lead</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome completo"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Telefone / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Canal de Origem <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.originChannel}
                onChange={(e) => setForm({ ...form, originChannel: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Selecione...</option>
                <option value="instagram">Instagram</option>
                <option value="google">Google</option>
                <option value="referral">Indicação</option>
                <option value="direct">Direto</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Assunto / Resumo</label>
              <textarea
                value={form.caseSummary}
                onChange={(e) => setForm({ ...form, caseSummary: e.target.value })}
                placeholder="Breve descrição do caso..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <details className="group">
            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 select-none">
              + Informações complementares (opcional)
            </summary>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">CPF</label>
                  <input
                    value={form.cpf}
                    onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Profissão</label>
                  <input
                    value={form.profession}
                    onChange={(e) => setForm({ ...form, profession: e.target.value })}
                    placeholder="Ex: CLT, Autônomo"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Renda Estimada (R$)</label>
                  <input
                    type="number"
                    value={form.estimatedIncome}
                    onChange={(e) => setForm({ ...form, estimatedIncome: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Área Jurídica</label>
                  <select
                    value={form.legalArea}
                    onChange={(e) => setForm({ ...form, legalArea: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="familia">Família</option>
                    <option value="trabalhista">Trabalhista</option>
                    <option value="civil">Cível</option>
                    <option value="criminal">Criminal</option>
                    <option value="consumidor">Consumidor</option>
                    <option value="inventario">Inventário</option>
                    <option value="previdenciario">Previdenciário</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>
            </div>
          </details>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Salvando..." : "Salvar Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
