"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface EmailTemplate {
  id: string;
  nome: string;
  assunto: string;
  descricao?: string;
  isAtivo: boolean;
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/email/templates")
      .then(r => r.json())
      .then(data => {
        setTemplates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar este template?")) return;

    await fetch(`/api/email/templates/${id}`, { method: "DELETE" });
    setTemplates(templates.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Templates de Email</h1>
        <Link href="/ia/email/novo" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          + Novo Template
        </Link>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : templates.length === 0 ? (
        <p className="text-gray-500">Nenhum template criado ainda</p>
      ) : (
        <div className="space-y-4">
          {templates.map(template => (
            <div key={template.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{template.nome}</h3>
                  <p className="text-sm text-gray-600">Assunto: {template.assunto}</p>
                  {template.descricao && <p className="text-sm text-gray-500 mt-1">{template.descricao}</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(template.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/ia/email/templates/${template.id}`} className="text-blue-600 hover:underline">
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="text-red-600 hover:underline"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
