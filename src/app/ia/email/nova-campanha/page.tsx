"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EmailTemplate {
  id: string;
  nome: string;
  assunto: string;
}

export default function NovaCampanhaPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    templateId: "",
    destinatarios: "",
    tagsDestino: "",
    agendadoEm: ""
  });

  useEffect(() => {
    fetch("/api/email/templates")
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

    const destinatarios = form.destinatarios
      .split("\n")
      .map(e => e.trim())
      .filter(e => e && e.includes("@"));

    if (destinatarios.length === 0) {
      alert("Adicione pelo menos um email válido");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/email/campanhas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: form.nome,
        descricao: form.descricao,
        templateId: form.templateId,
        destinatarios,
        tagsDestino: form.tagsDestino.split(",").map(t => t.trim()).filter(t => t),
        agendadoEm: form.agendadoEm || null
      })
    });

    if (res.ok) {
      const campanha = await res.json();
      router.push(`/ia/email/campanhas/${campanha.id}`);
    } else {
      alert("Erro ao criar campanha");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nova Campanha de Email</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border space-y-4">
        <div>
          <label className="block font-semibold mb-2">Nome da Campanha</label>
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder="Ex: Campanha de Black Friday"
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
            placeholder="Descrição da campanha"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Template</label>
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
                {t.nome} - {t.assunto}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">Destinatários (um por linha)</label>
          <textarea
            name="destinatarios"
            value={form.destinatarios}
            onChange={handleChange}
            placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
            rows={8}
            className="w-full px-4 py-2 border rounded font-mono text-sm"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Tags de Segmentação (opcional)</label>
          <input
            type="text"
            name="tagsDestino"
            value={form.tagsDestino}
            onChange={handleChange}
            placeholder="tag1, tag2, tag3"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Agendar para (opcional)</label>
          <input
            type="datetime-local"
            name="agendadoEm"
            value={form.agendadoEm}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">Se não preencher, será enviado imediatamente</p>
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
