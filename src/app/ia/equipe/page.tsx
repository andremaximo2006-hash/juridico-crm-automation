"use client";
import Link from "next/link";
import { Users, Plus, Trash2, Shield, Clock } from "lucide-react";

export default function EquipePage() {
  const especialistas = [
    { id: 1, nome: "Ana Silva", especializacao: "INSS", conversas: 45, status: "online", depuis: "2026-01-15" },
    { id: 2, nome: "Carolina Santos", especializacao: "BPC/LOAS", conversas: 32, status: "online", depuis: "2026-02-20" },
    { id: 3, nome: "Helena Costa", especializacao: "Maternidade", conversas: 28, status: "away", depuis: "2026-01-10" },
    { id: 4, nome: "Ricardo Mendes", especializacao: "Acidente", conversas: 22, status: "online", depuis: "2026-03-05" },
  ];

  const atendentes = [
    { id: 5, nome: "João Pedro", funcao: "Suporte L1", conversas: 15, status: "online" },
    { id: 6, nome: "Maria Oliveira", funcao: "Suporte L2", conversas: 24, status: "online" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/ia/hub" className="text-purple-600 hover:text-purple-800 mb-6 inline-block">← Voltar</Link>
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">👥 Equipe</h1>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 font-semibold">
            <Plus size={16} /> Adicionar Membro
          </button>
        </div>

        {/* Especialistas IA */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🤖 Especialistas IA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {especialistas.map((esp) => (
              <div key={esp.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800">{esp.nome}</p>
                    <p className="text-sm text-gray-600">{esp.especializacao}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${esp.status === "online" ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}>
                    {esp.status === "online" ? "🟢 Online" : "🟡 Away"}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span>{esp.conversas} conversas</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {esp.depuis}</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm font-medium text-blue-800">Editar</button>
                  <button className="px-3 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-800">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Atendentes */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">👔 Atendentes Humanos</h2>
          <div className="space-y-3">
            {atendentes.map((att) => (
              <div key={att.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between border-l-4 border-pink-500">
                <div>
                  <p className="font-bold text-gray-800">{att.nome}</p>
                  <p className="text-sm text-gray-600">{att.funcao} • {att.conversas} conversas</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full font-bold">🟢 Online</span>
                  <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">Editar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
