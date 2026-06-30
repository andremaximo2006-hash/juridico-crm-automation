'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface WebhookLog {
  id: string;
  timestamp: string;
  tipo: 'entrada' | 'saída' | 'erro';
  telefone: string;
  mensagem: string;
  status: string;
}

export default function MonitorWhatsAppPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [telefoneTest, setTelefoneTest] = useState('');
  const [mensagemTest, setMensagemTest] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mock logs - em produção viriam da API
  useEffect(() => {
    setLogs([
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        tipo: 'entrada',
        telefone: '5585988123456',
        mensagem: 'Olá, gostaria de saber sobre aposentadoria',
        status: '✅ Processado',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
        tipo: 'saída',
        telefone: '5585988123456',
        mensagem: 'Olá! Bem-vindo ao escritório. Vou ajudar com sua aposentadoria.',
        status: '✅ Enviado',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
        tipo: 'entrada',
        telefone: '5585988123456',
        mensagem: 'Tenho 35 anos e trabalho há 15 anos',
        status: '✅ Processado',
      },
    ]);
  }, []);

  const enviarTestMessage = async () => {
    if (!telefoneTest.trim() || !mensagemTest.trim()) {
      setMensaje({ type: 'error', text: 'Preencha telefone e mensagem' });
      return;
    }

    setEnviando(true);
    try {
      // Simular envio de mensagem de teste
      const novoLog: WebhookLog = {
        id: String(Date.now()),
        timestamp: new Date().toISOString(),
        tipo: 'entrada',
        telefone: telefoneTest,
        mensagem: mensagemTest,
        status: '⏳ Processando...',
      };

      setLogs([novoLog, ...logs]);
      setTelefoneTest('');
      setMensagemTest('');
      setMensaje({ type: 'success', text: '✅ Mensagem de teste enviada!' });

      setTimeout(() => {
        setLogs(prev => [
          {
            ...prev[0],
            status: '✅ Processado',
          },
          ...prev.slice(1),
        ]);
      }, 1000);
    } catch (error) {
      setMensaje({ type: 'error', text: '❌ Erro ao enviar' });
    } finally {
      setEnviando(false);
    }
  };

  const formatarHora = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/ia/whatsapp" className="text-purple-600 hover:text-purple-800 mb-6 inline-block">
          ← Voltar
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Monitor WhatsApp</h1>
          <p className="text-gray-600">Acompanhe as conversas em tempo real via Meta Business</p>
        </div>

        {/* Teste Rápido */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-purple-500">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🧪 Teste Rápido</h2>

          {mensaje && (
            <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              mensaje.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {mensaje.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              {mensaje.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={telefoneTest}
              onChange={(e) => setTelefoneTest(e.target.value)}
              placeholder="Telefone (ex: 5585988123456)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              value={mensagemTest}
              onChange={(e) => setMensagemTest(e.target.value)}
              placeholder="Mensagem de teste"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={enviarTestMessage}
              disabled={enviando}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center gap-2 font-semibold"
            >
              <Send size={16} />
              {enviando ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Webhook Status</p>
            <p className="text-2xl font-bold text-green-600">🟢 Ativo</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Mensagens Hoje</p>
            <p className="text-2xl font-bold text-blue-600">3</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Conversas Ativas</p>
            <p className="text-2xl font-bold text-purple-600">1</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">Taxa de Erro</p>
            <p className="text-2xl font-bold text-orange-600">0%</p>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">📋 Histórico de Webhooks</h2>
            <button
              onClick={() => setLoading(!loading)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum webhook recebido ainda</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    log.tipo === 'entrada'
                      ? 'bg-blue-50 border-blue-500'
                      : log.tipo === 'saída'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">
                        {log.tipo === 'entrada' ? '📥' : log.tipo === 'saída' ? '📤' : '❌'}{' '}
                        {log.telefone}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 break-words">{log.mensagem}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatarHora(log.timestamp)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        log.status.includes('✅')
                          ? 'bg-green-200 text-green-800'
                          : log.status.includes('⏳')
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Docs */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
          <h3 className="font-bold text-blue-900 mb-2">📖 Documentação</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Webhook URL: <code className="bg-white px-2">https://crm.gabriellenunes.com.br/api/webhooks/whatsapp/meta</code></li>
            <li>Tipo de integração: Meta Business API (WhatsApp Cloud)</li>
            <li>Autenticação: Bearer Token (via Access Token)</li>
            <li>Conversas persistidas em banco de dados com histórico completo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
