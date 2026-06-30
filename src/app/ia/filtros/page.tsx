"use client";
import Link from "next/link";
import { Search, Sliders, Save, Trash2 } from "lucide-react";

export default function FiltrosPage() {
  const filtrosPreset = [
    { id: 1, nome: "Conversas de Alto Score", descricao: "Score ≥ 80%", conversas: 34 },
    { id: 2, nome: "Clientes INSS", descricao: "Tipo: INSS", conversas: 45 },
    { id: 3, nome: "Pendentes Hoje", descricao: "Status: Ativa, Data: Hoje", conversas: 8 },
    { id: 4, nome: "Especialista Ana", descricao: "Especialista: Ana", conversas: 45 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/ia" className="text-cyan-600 hover:text-cyan-800 mb-6 inline-block">← Voltar</Link>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🔍 Filtros Avançados</h1>
        <p className="text-gray-600 mb-8">Busque e filtre conversas com precisão</p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🔎 Búsqueda Rápida</h2>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input type="text" placeholder="Buscar cliente, especialista..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <button className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold">Buscar</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Filtros</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Tipo de Benefício</label>
                <select className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option>Todos</option>
                  <option>INSS</option>
                  <option>BPC/LOAS</option>
                  <option>Maternidade</option>
                  <option>Acidente</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Especialista</label>
                <select className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option>Todos</option>
                  <option>Ana (INSS)</option>
                  <option>Carolina (BPC)</option>
                  <option>Helena (Maternidade)</option>
                  <option>Ricardo (Acidente)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Score</label>
                <div className="flex gap-2 mt-1">
                  <input type="number" placeholder="Min" className="w-1/2 px-3 py-2 border rounded-lg" />
                  <input type="number" placeholder="Max" className="w-1/2 px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold flex items-center justify-center gap-2">
                <Sliders size={16} /> Aplicar Filtros
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">⭐ Filtros Salvos</h3>
            <div className="space-y-3">
              {filtrosPreset.map((f) => (
                <div key={f.id} className="p-3 bg-gray-50 rounded-lg border hover:border-cyan-500">
                  <p className="font-semibold text-gray-800">{f.nome}</p>
                  <p className="text-xs text-gray-600">{f.descricao}</p>
                  <p className="text-xs text-cyan-600 font-bold mt-2">{f.conversas} resultados</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💾 Salvar Filtro Atual</h3>
          <div className="flex gap-2">
            <input type="text" placeholder="Nome do filtro..." className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <button className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold flex items-center gap-2">
              <Save size={16} /> Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
