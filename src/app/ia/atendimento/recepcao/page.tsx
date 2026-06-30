'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Mensagem {
  id: string;
  remetente: 'lead' | 'marta';
  conteudo: string;
  timestamp: Date;
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
  const [etapa, setEtapa] = useState('nome'); // nome, apresentacao, qualificacao
  const [nomeCliente, setNomeCliente] = useState('');
  const [score, setScore] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const enviarMensagem = async () => {
    if (!inputValue.trim()) return;

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

    // Simular resposta da Marta
    setTimeout(() => {
      let resposta = '';
      let novaEtapa = etapa;

      if (etapa === 'nome') {
        setNomeCliente(inputValue);
        resposta = `Oi, ${inputValue}! Eu sou a Marta, analista jurídica da Dra. Gabrielle.
Nosso escritório fica localizado na Baixada Santista e atendemos clientes de todo o Brasil.
Você já acessou o nosso instagram? Postamos dicas diárias sobre como conseguir seus direitos do INSS.
https://www.instagram.com/gabriellenunes.prev/

Aproveita e nos siga ❤️

Como posso te ajudar hoje? Pode me contar um resumo do seu caso...`;
        novaEtapa = 'apresentacao';
        setScore(10);
      } else if (etapa === 'apresentacao') {
        resposta = `Entendi seu caso. Deixa eu fazer algumas perguntas para ver se você pode ter direito ao benefício.

Há quanto tempo você trabalha/trabalhou?`;
        novaEtapa = 'qualificacao';
        setScore(30);
      } else if (etapa === 'qualificacao') {
        resposta = `Certo! E você tinha carteira assinada? Ou trabalhou como autônomo/contribuinte?`;
        setScore(50);
      }

      const novaMensagemMarta: Mensagem = {
        id: (Date.now() + 1).toString(),
        remetente: 'marta',
        conteudo: resposta,
        timestamp: new Date()
      };

      setMensagens(prev => [...prev, novaMensagemMarta]);
      setEtapa(novaEtapa);
      setLoading(false);
    }, 1000);
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
          <p className="text-gray-600">Analista Jurídica - Especializada em Benefícios INSS</p>
        </div>

        {/* Score Badge */}
        <div className="flex gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 flex-1 shadow-sm border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Score de Qualificação</p>
            <p className="text-2xl font-bold text-blue-600">{score}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 flex-1 shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Etapa Atual</p>
            <p className="text-lg font-bold text-green-600 capitalize">{etapa}</p>
          </div>
        </div>

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
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
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
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={enviarMensagem}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? '⏳' : '📤'}
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-semibold mb-2">ℹ️ Sobre esta IA:</p>
          <ul className="space-y-1 text-xs">
            <li>✓ Segue rigorosamente o roteiro de recepção</li>
            <li>✓ Qualifica o cliente para o benefício correto</li>
            <li>✓ Calcula score de viabilidade em tempo real</li>
            <li>✓ Roteia para especialista quando identificado</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
