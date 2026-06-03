"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string | null;
  profession: string | null;
  whatsappOptIn: boolean;
}

interface Props {
  client?: Client | null;
  onClose: () => void;
  onSaved: () => void;
}

function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

const empty = { name: "", cpf: "", phone: "", email: "", profession: "", whatsappOptIn: true };

export default function ClienteFormModal({ client, onClose, onSaved }: Props) {
  const isEdit = !!client;
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name,
        cpf: maskCpf(client.cpf),
        phone: client.phone,
        email: client.email ?? "",
        profession: client.profession ?? "",
        whatsappOptIn: client.whatsappOptIn,
      });
    }
  }, [client]);

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Nome obrigatório"); return; }
    if (form.cpf.replace(/\D/g, "").length < 11) { setError("CPF inválido"); return; }
    if (!form.phone.trim()) { setError("Telefone obrigatório"); return; }

    setLoading(true);
    try {
      const url = isEdit ? `/api/clientes/${client!.id}` : "/api/clientes";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao salvar"); return; }
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Editar cliente" : "Novo cliente"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome completo *</label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Maria da Silva"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">CPF *</label>
              <input
                value={form.cpf}
                onChange={(e) => set("cpf", maskCpf(e.target.value))}
                placeholder="000.000.000-00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Telefone *</label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", maskPhone(e.target.value))}
                placeholder="(11) 98765-4321"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Profissão</label>
              <input
                value={form.profession}
                onChange={(e) => set("profession", e.target.value)}
                placeholder="Ex: Professora, Autônomo..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.whatsappOptIn}
              onChange={(e) => set("whatsappOptIn", e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-sm text-gray-700">Aceita contato via WhatsApp</span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Salvando...</> : isEdit ? "Salvar alterações" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
