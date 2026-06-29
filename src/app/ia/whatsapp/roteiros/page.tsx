"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit } from "lucide-react";

interface Roteiro {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  steps: { order: number; pergunta: string }[];
}

export default function RoteirosPage() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/whatsapp/roteiros")
      .then(r => r.json())
      .then(data => { setRoteiros(data); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar roteiro?")) return;
    await fetch(`/api/whatsapp/roteiros/${id}`, { method: "DELETE" });
    setRoteiros(roteiros.filter(r => r.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Roteiros de Atendimento</h1>
        <Link href="/ia/whatsapp/roteiros/novo" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={20} /> Novo Roteiro
        </Link>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : roteiros.length === 0 ? (
        <p className="text-gray-500">Nenhum roteiro criado. Clique em "Novo Roteiro" para começar.</p>
      ) : (
        <div className="space-y-4">
          {roteiros.map(r => (
            <div key={r.id} className="bg-white p-4 rounded-lg border shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{r.name}</h3>
                  <p className="text-sm text-gray-600">{r.description || "Sem descrição"}</p>
                  <p className="text-xs text-gray-500 mt-2">{r.steps.length} perguntas • {r.is_active ? "✅ Ativo" : "🔴 Inativo"}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/ia/whatsapp/conversar/${r.id}`} className="text-green-600 hover:underline text-sm">Testar</Link>
                  <Link href={`/ia/whatsapp/roteiros/${r.id}/editar`} className="text-blue-600 hover:underline text-sm"><Edit size={16} /></Link>
                  <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline text-sm"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
