"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovoTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    assunto: "",
    corpo: "",
    variaveis: [] as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/email/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      router.push("/ia/email/templates");
    } else {
      alert("Erro ao criar template");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Novo Template de Email</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border space-y-4">
        <div>
          <label className="block font-semibold mb-2">Nome do Template</label>
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
            placeholder="Descrição do template"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Assunto do Email</label>
          <input
            type="text"
            name="assunto"
            value={form.assunto}
            onChange={handleChange}
            placeholder="Seu atendimento foi confirmado!"
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Corpo (HTML)</label>
          <textarea
            name="corpo"
            value={form.corpo}
            onChange={handleChange}
            placeholder="<h1>Olá {{nome}}</h1><p>Seu atendimento foi confirmado para {{data}}</p>"
            rows={10}
            className="w-full px-4 py-2 border rounded font-mono text-sm"
            required
          />
          <p className="text-xs text-gray-500 mt-2">Use variáveis como {'{nome}'} e {'{data}'} para placeholders dinâmicos</p>
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
