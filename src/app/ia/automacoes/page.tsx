"use client";
import Link from "next/link";
import { Zap, Plus, Power, Trash2, Clock, Target } from "lucide-react";
import { useState } from "react";

export default function AutomacoesPage() {
  const [automacoes, setAutomacoes] = useState([
    { id: 1, nome: "Notificar novo lead", trigger: "Mensagem recebida", acao: "Enviar email", ativa: true },
    { id: 2, nome: "Escalar após 3 respostas", trigger: "3 mensagens", acao: "Transferir para humano", ativa: true },
    { id: 3, nome: "Score baixo (<50)", trigger: "Score menor que 50", acao: "Flag para revisão", ativa: false },
    { id: 4, nome: "Responda em português", trigger: "Língua detectada", acao: "Manter idioma", ativa: true },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/ia/hub" className="text-yellow-600 hover:text-yellow-800 mb-6 inline-block">← Voltar</Link>
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">⚡ Automações</h1>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 font-semibold">
            <Plus size={16} /> Nova Automação
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <Zap size={32} className="text-yellow-600 mb-3" />
            <p className="text-gray-600 text-sm">Automações Ativas</p>
            <p className="text-3xl font-bold text-yellow-600">3</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <Clock size={32} className="text-blue-600 mb-3" />
            <p className="text-gray-600 text-sm">Próxima Execução</p>
            <p className="text-lg font-bold text-blue-600">Em 2 min</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <Target size={32} className="text-green-600 mb-3" />
            <p className="text-gray-600 text-sm">Eventos Processados</p>
            <p className="text-3xl font-bold text-green-600">1,247</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Suas Automações</h2>
          {automacoes.map((auto) => (
            <div key={auto.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500 flex items-start justify-between">
              <div className="flex-1">
                <p className="font-bold text-gray-800 mb-2">{auto.nome}</p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Target size={16} /> Dispara: {auto.trigger}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap size={16} /> Ação: {auto.acao}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className={`p-2 rounded-lg ${auto.ativa ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  <Power size={20} />
                </button>
                <button className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">💡 Templates Recomendados</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Escalar para humano automaticamente após X mensagens</li>
            <li>Notificar supervisor se score for muito baixo</li>
            <li>Enviar email de acompanhamento 24h após conclusão</li>
            <li>Marcar conversas para revisão com certas palavras-chave</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
