"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovoSMSPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    conteudo: "",
    variaveis: [] as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.conteudo.length > 160) {
      alert("SMS deve ter no máximo 160 caracteres");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/sms/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      router.push("/ia/sms/templates");
    } else {
      alert("Erro ao criar template");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Novo Template SMS</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border space-y-4">
        <div>
          <label className="block font-semibold mb-2">Nome</label>
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder="Ex: Confirmação de Atendimento"
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Descrição</label>
          <input
            type="text"
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            placeholder="Descrição (opcional)"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Conteúdo SMS</label>
          <textarea
            name="conteudo"
            value={form.conteudo}
            onChange={handleChange}
            placeholder="Olá {{nome}}, seu atendimento foi confirmado para {{data}}"
            maxLength={160}
            rows={4}
            className="w-full px-4 py-2 border rounded font-mono text-sm"
            required
          />
          <p className="text-sm text-gray-600 mt-2">{form.conteudo.length} / 160 caracteres</p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Template"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
