"use client";
import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface FilaItem {
  id: string;
  score: number;
  viabilidade: string;
  roteiro: string;
  criado: string;
}

export default function FilaPage() {
  const [fila, setFila] = useState<FilaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/whatsapp/fila")
      .then(r => r.json())
      .then(data => { setFila(data); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  const viaveisCnt = fila.filter(f => f.viabilidade === "viavel").length;
  const inviavelCnt = fila.filter(f => f.viabilidade === "inviavel").length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Fila de Qualificação</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-3xl font-bold text-blue-600">{fila.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <p className="text-sm text-gray-600">Viáveis</p>
          <p className="text-3xl font-bold text-green-600">{viaveisCnt}</p>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <p className="text-sm text-gray-600">Inviáveis</p>
          <p className="text-3xl font-bold text-red-600">{inviavelCnt}</p>
        </div>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : fila.length === 0 ? (
        <p className="text-gray-500">Nenhum lead qualificado ainda.</p>
      ) : (
        <div className="space-y-3">
          {fila.map(item => (
            <div key={item.id} className="bg-white p-4 rounded border flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.roteiro}</p>
                <p className="text-sm text-gray-600">Score: {item.score}/100 • {new Date(item.criado).toLocaleString("pt-BR")}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.viabilidade === "viavel" ? (
                  <CheckCircle className="text-green-600" size={24} />
                ) : (
                  <AlertCircle className="text-red-600" size={24} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
