"use client";
import Link from "next/link";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";

export default function RelatoriosPage() {
  const relatorios = [
    { id: 1, nome: "Relatório Semanal", data: "2026-06-28", tipo: "PDF", conversas: 86, score: 74.2 },
    { id: 2, nome: "Desempenho Especialistas", data: "2026-06-27", tipo: "Excel", conversas: 127, score: 73.5 },
    { id: 3, nome: "Tendências de Benefícios", data: "2026-06-21", tipo: "PDF", conversas: 52, score: 71.8 },
    { id: 4, nome: "Análise de Conversão", data: "2026-06-14", tipo: "Excel", conversas: 38, score: 75.3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/ia" className="text-amber-600 hover:text-amber-800 mb-6 inline-block">← Voltar</Link>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📋 Relatórios</h1>
        <p className="text-gray-600 mb-8">Gerar e baixar relatórios de conversas</p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Gerar Novo Relatório</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option>Tipo: Todos</option>
              <option>Semanal</option>
              <option>Mensal</option>
              <option>Customizado</option>
            </select>
            <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option>Período: Últimas 7 dias</option>
              <option>Últimos 30 dias</option>
              <option>Este mês</option>
            </select>
            <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option>Formato: PDF</option>
              <option>Excel</option>
              <option>CSV</option>
            </select>
            <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold">Gerar</button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800">📁 Relatórios Anteriores</h2>
          {relatorios.map((rel) => (
            <div key={rel.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <FileText size={24} className="text-amber-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{rel.nome}</p>
                    <p className="text-sm text-gray-600">{rel.data} • {rel.conversas} conversas • Score: {rel.score}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">{rel.tipo}</span>
                  <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2">
                    <Download size={16} /> Baixar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
