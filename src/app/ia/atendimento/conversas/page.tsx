'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, MessageSquare, Clock, User } from 'lucide-react';

interface Conversa {
  id: string;
  participante: string;
  totalMensagens: number;
  ultimaMensagem: string | null;
  atualizadoEm: string;
  status: string;
}

export default function ListarConversasPage() {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('ativa');

  const carregarConversas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ia/conversa/listar?iaId=marta-recepcao&status=${filtro}`);

      if (response.ok) {
        const data = await response.json();
        setConversas(data.conversas || []);
      }
    } catch (erro) {
      console.error('Erro ao carregar conversas:', erro);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarConversas();
  }, [filtro]);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/ia/atendimento" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
          ← Voltar
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">💬 Histórico de Conversas</h1>
          <p className="text-gray-600">Todas as conversas de recepção com Marta</p>
        </div>

        {/* Filtro */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-2">
          <button
            onClick={() => setFiltro('ativa')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtro === 'ativa'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🟢 Ativas
          </button>
          <button
            onClick={() => setFiltro('concluida')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtro === 'concluida'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✅ Concluídas
          </button>
          <button
            onClick={() => setFiltro('escalonada')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtro === 'escalonada'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📞 Escalonadas
          </button>
          <button
            onClick={carregarConversas}
            disabled={loading}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="inline-block animate-spin">
                <RefreshCw size={24} className="text-blue-600" />
              </div>
              <p className="mt-4 text-gray-600">Carregando conversas...</p>
            </div>
          ) : conversas.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            conversas.map(conversa => (
              <Link
                key={conversa.id}
                href={`/ia/atendimento/conversa/${conversa.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md p-4 border-l-4 border-blue-500 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} className="text-blue-600" />
                      <h3 className="font-bold text-gray-800">{conversa.participante}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        conversa.status === 'ativa' ? 'bg-green-100 text-green-700' :
                        conversa.status === 'concluida' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {conversa.status === 'ativa' ? '🟢 Ativa' :
                         conversa.status === 'concluida' ? '✅ Concluída' :
                         '📞 Escalonada'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {conversa.ultimaMensagem || 'Nenhuma mensagem'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        {conversa.totalMensagens} mensagens
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatarData(conversa.atualizadoEm)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-800">
                      {Math.round((conversa.totalMensagens / 2) * 10)}%
                    </div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
