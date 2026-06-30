"use client";
import Link from "next/link";
import { TrendingUp, Calendar, BarChart3, PieChart as PieChartIcon } from "lucide-react";

export default function AnalyticsPage() {
  const metricas = [
    { titulo: "Crescimento Semanal", valor: "+18%", cor: "text-green-600", bg: "bg-green-50" },
    { titulo: "Taxa de Retenção", valor: "89%", cor: "text-blue-600", bg: "bg-blue-50" },
    { titulo: "NPS Score", valor: "72", cor: "text-purple-600", bg: "bg-purple-50" },
    { titulo: "Tempo Médio", valor: "2m 15s", cor: "text-orange-600", bg: "bg-orange-50" },
  ];

  const topEspecialistas = [
    { nome: "Ana (INSS)", pontos: 2450, eficiencia: 94 },
    { nome: "Carolina (BPC)", pontos: 2180, eficiencia: 89 },
    { nome: "Helena (Mat)", pontos: 2010, eficiencia: 91 },
    { nome: "Ricardo (Acid)", pontos: 1850, eficiencia: 86 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/ia/hub" className="text-emerald-600 hover:text-emerald-800 mb-6 inline-block">← Voltar</Link>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-8">📈 Analytics Avançado</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {metricas.map((m, i) => (
            <div key={i} className={`${m.bg} rounded-lg p-6 border-l-4 border-opacity-50`}>
              <p className="text-gray-600 text-sm font-medium">{m.titulo}</p>
              <p className={`text-3xl font-bold ${m.cor} mt-2`}>{m.valor}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Top Especialistas</h2>
            <div className="space-y-3">
              {topEspecialistas.map((esp, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-gray-800">{esp.nome}</span>
                    <span className="text-sm font-bold text-green-600">{esp.pontos} pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${esp.eficiencia}%` }}></div>
                    </div>
                    <span className="text-xs font-bold">{esp.eficiencia}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Tendências</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Conversas Processadas</p>
                <p className="text-3xl font-bold text-emerald-600">127 ↑</p>
                <p className="text-xs text-gray-500 mt-1">+12% vs semana anterior</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-blue-600">68% ↑</p>
                <p className="text-xs text-gray-500 mt-1">+5% vs mês anterior</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🎯 Metas Mensais</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Conversas Alvo</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-green-600">127</span>
                <span className="text-sm text-gray-600">/200</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "63.5%" }}></div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Score Alvo</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-blue-600">73.5%</span>
                <span className="text-sm text-gray-600">/80%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "91.9%" }}></div>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-gray-600">Taxa Conversão</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-purple-600">34.2%</span>
                <span className="text-sm text-gray-600">/40%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "85.5%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
