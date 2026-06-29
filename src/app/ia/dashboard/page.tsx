"use client";

import { BarChart3, Brain, MessageCircle, TrendingUp, Settings } from "lucide-react";
import Link from "next/link";

export default function IADashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🤖 IA Atendimento</h1>
          <p className="text-gray-600">Gerencie seus assistentes de IA jurídicos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Total de Conversas</div>
            <div className="text-4xl font-bold text-gray-900">1.245</div>
            <div className="text-xs text-green-600 mt-2">↑ 12% vs semana passada</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Chats Hoje</div>
            <div className="text-4xl font-bold text-gray-900">47</div>
            <div className="text-xs text-gray-600 mt-2">9h 30min tempo médio</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Satisfação</div>
            <div className="text-4xl font-bold text-gray-900">4.8</div>
            <div className="text-xs text-gray-600 mt-2">de 5.0 ⭐</div>
          </div>
        </div>

        {/* IA Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Super Agent */}
          <Link href="/ia/super-agent">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Brain className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Super Agent Jurídico</h3>
                    <p className="text-sm text-gray-500">Assistente legal</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-600 mb-4">
                  ✅ Ativo | 🟢 Online
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-4">
                  <li>• Análise de casos</li>
                  <li>• Busca de jurisprudência</li>
                  <li>• Geração de relatórios</li>
                </ul>
                <button className="text-indigo-600 font-medium text-sm hover:text-indigo-700">
                  Iniciar Chat →
                </button>
              </div>
            </div>
          </Link>

          {/* WhatsApp IA */}
          <Link href="/ia">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">WhatsApp IA</h3>
                    <p className="text-sm text-gray-500">Atendimento automático</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-600 mb-4">
                  ✅ Ativo | 🔴 5 aguardando
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-4">
                  <li>• Respostas automáticas</li>
                  <li>• Fila de atendimento</li>
                  <li>• Escalação automática</li>
                </ul>
                <button className="text-green-600 font-medium text-sm hover:text-green-700">
                  Ver Fila →
                </button>
              </div>
            </div>
          </Link>

          {/* Marketing IA */}
          <Link href="/ia/marketing">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Marketing IA</h3>
                    <p className="text-sm text-gray-500">Análise de campanhas</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-600 mb-4">
                  ✅ Ativo | 📊 Ready
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-4">
                  <li>• Análise de ROI</li>
                  <li>• Insights de campanha</li>
                  <li>• Recomendações</li>
                </ul>
                <button className="text-purple-600 font-medium text-sm hover:text-purple-700">
                  Analisar →
                </button>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Analytics */}
          <Link href="/ia/analytics">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 cursor-pointer hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Métricas de uso</p>
                </div>
                <BarChart3 className="text-blue-600" size={32} />
              </div>
              <p className="text-sm text-gray-600">
                Acompanhe performance, custo e satisfação
              </p>
            </div>
          </Link>

          {/* Configurações */}
          <Link href="/ia/configuracoes">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 cursor-pointer hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Configurações</h3>
                  <p className="text-sm text-gray-600">Setup de APIs</p>
                </div>
                <Settings className="text-indigo-600" size={32} />
              </div>
              <p className="text-sm text-gray-600">
                Gerencie keys, modelos e comportamento
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Conversas Recentes</h2>
          </div>
          <div className="p-6">
            <table className="w-full text-sm">
              <thead className="text-gray-600 border-b">
                <tr>
                  <th className="text-left py-3">Cliente</th>
                  <th className="text-left py-3">IA</th>
                  <th className="text-left py-3">Assunto</th>
                  <th className="text-left py-3">Data</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3">João Silva</td>
                  <td>Super Agent</td>
                  <td>Análise de viabilidade</td>
                  <td>2026-06-29 14:32</td>
                  <td><span className="text-green-600">Concluído</span></td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3">Maria Santos</td>
                  <td>WhatsApp IA</td>
                  <td>Dúvida sobre prazo</td>
                  <td>2026-06-29 11:15</td>
                  <td><span className="text-blue-600">Ativo</span></td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3">Tech Solutions</td>
                  <td>Marketing IA</td>
                  <td>ROI de campanha</td>
                  <td>2026-06-29 09:45</td>
                  <td><span className="text-green-600">Concluído</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
