'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Mensagem {
  id: string;
  remetente: 'lead' | 'marta';
  conteudo: string;
  timestamp: Date;
}

interface MessageHistory {
  role: 'user' | 'assistant';
  content: string;
}

export default function RecepcaoIA() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: '1',
      remetente: 'marta',
      conteudo: `Olá! Tudo bem?
Seja bem-vindo ao canal de atendimento do escritório Gabrielle Nunes Advocacia, CNPJ: 51.157.707/0001-47.
Nosso escritório é especialista em benefícios do INSS.

Qual é o seu primeiro nome?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [erro, setErro] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const enviarMensagem = async () => {
    if (!inputValue.trim() || loading) return;

    setErro('');

    // Adicionar mensagem do lead
    const novaMensagemLead: Mensagem = {
      id: Date.now().toString(),
      remetente: 'lead',
      conteudo: inputValue,
      timestamp: new Date()
    };

    setMensagens(prev => [...prev, novaMensagemLead]);
    setInputValue('');
    setLoading(true);

    try {
      // Construir histórico de mensagens
      const historico: MessageHistory[] = mensagens
        .filter(m => m.remetente !== 'marta' || m.id !== '1') // Excluir mensagem inicial
        .map(m => ({
          role: m.remetente === 'lead' ? 'user' : 'assistant',
          content: m.conteudo
        }));

      const response = await fetch('/api/ia/conversar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: inputValue,
          historico
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        setErro(data.error);
        setLoading(false);
        return;
      }

      // Calcular novo score
      const novoScore = Math.min(100, score + Math.random() * 20);
      setScore(novoScore);

      // Adicionar resposta de Marta
      const novaMensagemMarta: Mensagem = {
        id: (Date.now() + 1).toString(),
        remetente: 'marta',
        conteudo: data.resposta,
        timestamp: new Date()
      };

      setMensagens(prev => [...prev, novaMensagemMarta]);
    } catch (erro) {
      console.error('Erro ao enviar mensagem:', erro);
      setErro(erro instanceof Error ? erro.message : 'Erro ao processar mensagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/ia/atendimento" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">💬 Recepção IA - Marta</h1>
          <p className="text-gray-600">Analista Jurídica - Especializada em Benefícios INSS (Com Claude API)</p>
        </div>

        {/* Score Badge */}
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500 mb-6">
          <p className="text-sm text-gray-600">Score de Qualificação</p>
          <p className="text-2xl font-bold text-blue-600">{Math.round(score)}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>

        {/* Error Message */}
        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {erro}
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 h-96 overflow-y-auto">
          <div className="space-y-4">
            {mensagens.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.remetente === 'lead' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.remetente === 'lead'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.conteudo}</p>
                  <p className={`text-xs mt-1 ${msg.remetente === 'lead' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && enviarMensagem()}
            placeholder="Digite sua mensagem..."
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            onClick={enviarMensagem}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
          >
            {loading ? '...' : 'Enviar'}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          💡 Dica: Marta usa Claude API para respostas naturais e personalizadas
        </p>
      </div>
    </div>
  );
}
