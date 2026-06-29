"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface Step {
  pergunta: string;
  tipo: "text" | "multiple_choice";
}

export default function NovoRoteiroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [steps, setSteps] = useState<Step[]>([{ pergunta: "", tipo: "text" }]);
  const [loading, setLoading] = useState(false);

  const addStep = () => setSteps([...steps, { pergunta: "", tipo: "text" }]);
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));
  const updateStep = (i: number, field: string, value: any) => {
    const novoSteps = [...steps];
    novoSteps[i] = { ...novoSteps[i], [field]: value };
    setSteps(novoSteps);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/roteiros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nome, description: descricao, steps })
      });

      if (res.ok) {
        alert("✅ Roteiro criado!");
        router.push("/ia/whatsapp/roteiros");
      }
    } catch (e) {
      alert("❌ Erro ao criar roteiro");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Novo Roteiro</h1>

      <div className="space-y-4">
        <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do roteiro" className="w-full px-4 py-2 border rounded-lg" />
        <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição (opcional)" className="w-full px-4 py-2 border rounded-lg resize-none" rows={2} />

        <div className="bg-gray-100 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold">Perguntas</h3>
          {steps.map((step, i) => (
            <div key={i} className="bg-white p-3 rounded border space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pergunta {i + 1}</span>
                {steps.length > 1 && (
                  <button onClick={() => removeStep(i)} className="text-red-600 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <input type="text" value={step.pergunta} onChange={e => updateStep(i, "pergunta", e.target.value)} placeholder="Digite a pergunta..." className="w-full px-3 py-2 border rounded text-sm" />
            </div>
          ))}

          <button onClick={addStep} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
            <Plus size={16} /> Adicionar Pergunta
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={handleSave} disabled={loading || !nome || steps.some(s => !s.pergunta)} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Salvando..." : "Criar Roteiro"}
          </button>
          <button onClick={() => router.back()} className="bg-gray-300 text-gray-900 px-6 py-2 rounded hover:bg-gray-400">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
