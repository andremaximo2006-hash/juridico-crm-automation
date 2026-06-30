'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Archive } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Mensagem {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversa {
  id: string;
  participante: string;
  status: string;
  totalMensagens: number;
  historico: Mensagem[];
  dados: Record<string, any>;
  criadoEm: string;
  atualizadoEm: string;
}

export default function VisualizarConversaPage() {
  const params = useParams();
  const conversaId = params.id as string;

  const [conversa, setConversa] = useState<Conversa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarConversa = async () => {
      try {
        setLoading(true);
        // Para este exemplo, vamos buscar as conversas e encontrar a específica
        const response = await fetch(`/api/ia/conversa/listar?iaId=marta-recepcao&limit=100`);
        if (response.ok) {
          const data = await response.json();
          const conversaSelecionada = data.conversas.find((c: any) => c.id === conversaId);
          if (conversaSelecionada) {
            setConversa(conversaSelecionada as Conversa);
          }
        }
      } catch (erro) {
        console.error('Erro ao carregar conversa:', erro);
      } finally {
        setLoading(false);
      }
    };

    carregarConversa();
  }, [conversaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600">Carregando conversa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!conversa) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/ia/atendimento/conversas" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            Voltar
          </Link>
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600">Conversa não encontrada</p>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="max-w-3xl mx-auto">
        <Link href="/ia/atendimento/conversas" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          Voltar
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{conversa.participante}</h1>
              <p className="text-gray-600">Conversa com Marta - Recepção IA</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download size={16} />
                Exportar
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                <Archive size={16} />
                Arquivar
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Status</p>
              <p className={`font-semibold ${
                conversa.status === 'ativa' ? 'text-green-600' :
                conversa.status === 'concluida' ? 'text-blue-600' :
                'text-orange-600'
              }`}>
                {conversa.status === 'ativa' ? '🟢 Ativa' :
                 conversa.status === 'concluida' ? '✅ Concluída' :
                 '📞 Escalonada'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total de Mensagens</p>
              <p className="font-semibold text-gray-800">{conversa.totalMensagens}</p>
            </div>
            <div>
              <p className="text-gray-600">Iniciada</p>
              <p className="font-semibold text-gray-800">{formatarData(conversa.criadoEm)}</p>
            </div>
            <div>
              <p className="text-gray-600">Última Atualização</p>
              <p className="font-semibold text-gray-800">{formatarData(conversa.atualizadoEm)}</p>
            </div>
          </div>
        </div>

        {/* Dados Coletados */}
        {Object.keys(conversa.dados).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Dados Coletados</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(conversa.dados).map(([chave, valor]) => (
                <div key={chave} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase font-semibold">{chave}</p>
                  <p className="text-gray-800 mt-1">{String(valor)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversa */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">💬 Conversa</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversa.historico && conversa.historico.length > 0 ? (
              conversa.historico.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Nenhuma mensagem nesta conversa</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
