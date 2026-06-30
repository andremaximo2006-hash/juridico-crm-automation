"use client";
import Link from "next/link";
import { Search, Clock, Zap, MessageSquare, FileText } from "lucide-react";
import { useState } from "react";

export default function BuscaPage() {
  const [query, setQuery] = useState("");
  const resultados = [
    { tipo: "conversa", titulo: "João Silva - INSS", desc: "Score: 85%", hora: "2 horas atrás" },
    { tipo: "relatório", titulo: "Relatório Semanal", desc: "127 conversas processadas", hora: "1 dia atrás" },
    { tipo: "especialista", titulo: "Ana Silva", desc: "45 conversas, Score 78%", hora: "Agora online" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/ia/hub" className="text-gray-300 hover:text-white mb-8 inline-block">← Voltar</Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔍 Busca Global</h1>
          <p className="text-gray-400">Encontre conversas, especialistas e relatórios</p>
        </div>

        <div className="relative mb-8">
          <Search size={24} className="absolute left-4 top-3 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar em tudo..."
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-3">
          {resultados.map((r, i) => (
            <div key={i} className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 cursor-pointer transition">
              <div className="flex items-start gap-3">
                {r.tipo === "conversa" && <MessageSquare size={20} className="text-blue-400 mt-1" />}
                {r.tipo === "relatório" && <FileText size={20} className="text-green-400 mt-1" />}
                {r.tipo === "especialista" && <Zap size={20} className="text-yellow-400 mt-1" />}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold">{r.titulo}</p>
                  <p className="text-sm text-gray-400 mt-1">{r.desc}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Clock size={12} /> {r.hora}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!query && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-white mb-4">⭐ Recentes</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition">Maria Santos - BPC/LOAS</button>
              <button className="w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition">Relatório de Conversas</button>
              <button className="w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition">Especialista Ana Silva</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
