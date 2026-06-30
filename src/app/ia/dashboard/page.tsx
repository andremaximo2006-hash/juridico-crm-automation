"use client";
import { useState } from "react";
import Link from "next/link";
import { Download, Filter, TrendingUp, Users, MessageSquare } from "lucide-react";

export default function DashboardPage() {
  const stats = {
    conversasTotal: 127,
    conversasHoje: 8,
    especialistasAtivos: 4,
    scoreMediaGeral: 73.5,
    taxaConversao: 34.2,
    tempoMedioResposta: "2m 15s",
  };

  const conversasChart = [
    { dia: "Seg", conversas: 12 },
    { dia: "Ter", conversas: 19 },
    { dia: "Qua", conversas: 15 },
    { dia: "Qui", conversas: 22 },
    { dia: "Sex", conversas: 18 },
  ];

  const especialistas = [
    { nome: "Ana (INSS)", conversas: 45, score: 78 },
    { nome: "Carolina (BPC)", conversas: 32, score: 71 },
    { nome: "Helena (Mat)", conversas: 28, score: 75 },
    { nome: "Ricardo (Acid)", conversas: 22, score: 68 },
  ];

  const topConversas = [
    { id: "1", cliente: "João Silva", especialista: "Ana", score: 85, status: "Concluída" },
    { id: "2", cliente: "Maria Santos", especialista: "Carolina", score: 72, status: "Ativa" },
    { id: "3", cliente: "Pedro Costa", especialista: "Helena", score: 91, status: "Concluída" },
    { id: "4", cliente: "Ana Paula", especialista: "Ricardo", score: 64, status: "Ativa" },
    { id: "5", cliente: "Carlos Mendes", especialista: "Ana", score: 88, status: "Concluída" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/ia" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
          ← Voltar
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">📊 Dashboard</h1>
            <p className="text-gray-600">Análise de conversas e especialistas</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Download size={16} /> Exportar
            </button>
            <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter size={16} /> Filtrar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-2xl font-bold text-blue-600">{stats.conversasTotal}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Hoje</p>
            <p className="text-2xl font-bold text-green-600">{stats.conversasHoje}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Especialistas</p>
            <p className="text-2xl font-bold text-purple-600">{stats.especialistasAtivos}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">Score Médio</p>
            <p className="text-2xl font-bold text-orange-600">{stats.scoreMediaGeral}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm">Taxa</p>
            <p className="text-2xl font-bold text-red-600">{stats.taxaConversao}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-cyan-500">
            <p className="text-gray-600 text-sm">Tempo</p>
            <p className="text-2xl font-bold text-cyan-600">{stats.tempoMedioResposta}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Conversas por Dia</h2>
            <div className="space-y-3">
              {conversasChart.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.dia}</span>
                    <span className="text-sm font-bold">{item.conversas}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(item.conversas / 22) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🎯 Benefícios</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">INSS</span>
                  <span className="text-sm font-bold">45 (35%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: "35%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">BPC/LOAS</span>
                  <span className="text-sm font-bold">32 (25%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: "25%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Maternidade</span>
                  <span className="text-sm font-bold">28 (22%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-yellow-500 h-3 rounded-full" style={{ width: "22%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">👥 Especialistas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {especialistas.map((esp, idx) => (
              <div key={idx} className="bg-blue-50 rounded-lg p-4">
                <p className="font-semibold text-gray-800 mb-2">{esp.nome}</p>
                <p className="text-xs text-gray-600">Conversas: <span className="font-bold text-blue-600">{esp.conversas}</span></p>
                <p className="text-xs text-gray-600">Score: <span className="font-bold text-green-600">{esp.score}%</span></p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${esp.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Top Conversas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-2 text-left font-semibold">Cliente</th>
                  <th className="px-4 py-2 text-left font-semibold">Especialista</th>
                  <th className="px-4 py-2 text-left font-semibold">Score</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {topConversas.map((conv) => (
                  <tr key={conv.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{conv.cliente}</td>
                    <td className="px-4 py-3">{conv.especialista}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${conv.score >= 80 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>{conv.score}%</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${conv.status === "Concluída" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>{conv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
