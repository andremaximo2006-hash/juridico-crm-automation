"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SMSTemplate {
  id: string;
  nome: string;
  conteudo: string;
}

export default function NovaSMSCampanhaPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    templateId: "",
    telefones: "",
    tagsDestino: ""
  });

  useEffect(() => {
    fetch("/api/sms/templates")
      .then(r => r.json())
      .then(data => setTemplates(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const telefones = form.telefones
      .split("\n")
      .map(t => t.trim())
      .filter(t => t && t.match(/^\d+$/));

    if (telefones.length === 0) {
      alert("Adicione pelo menos um telefone válido");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/sms/campanhas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: form.nome,
        descricao: form.descricao,
        templateId: form.templateId,
        telefones,
        tagsDestino: form.tagsDestino.split(",").map(t => t.trim()).filter(t => t)
      })
    });

    if (res.ok) {
      router.push("/ia/sms/campanhas");
    } else {
      alert("Erro ao criar campanha");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nova Campanha SMS</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border space-y-4">
        <div>
          <label className="block font-semibold mb-2">Nome da Campanha</label>
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
          <label className="block font-semibold mb-2">Template SMS</label>
          <select
            name="templateId"
            value={form.templateId}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
          >
            <option value="">Selecione um template...</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.nome} - {t.conteudo.substring(0, 30)}...
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">Telefones (um por linha)</label>
          <textarea
            name="telefones"
            value={form.telefones}
            onChange={handleChange}
            placeholder="5585987654321&#10;5585987654322&#10;5585987654323"
            rows={6}
            className="w-full px-4 py-2 border rounded font-mono text-sm"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Tags (opcional)</label>
          <input
            type="text"
            name="tagsDestino"
            value={form.tagsDestino}
            onChange={handleChange}
            placeholder="tag1, tag2, tag3"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Campanha"}
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
