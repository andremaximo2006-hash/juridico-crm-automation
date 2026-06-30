'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AtendimentoIA() {
  const [activeTab, setActiveTab] = useState<'inicio' | 'recepcao' | 'config' | 'especialistas'>('inicio');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="max-w-7xl mx-auto">
        {/* Header Fixo */}
        <div className="bg-white shadow-lg p-6 sticky top-0 z-50">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/ia" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
                ← Voltar ao Dashboard IA
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">🤖 Sistema Multi-Agente de Atendimento</h1>
              <p className="text-gray-600 text-sm">Recepção automática + Qualificação inteligente de leads</p>
            </div>
          </div>

          {/* Menu de Navegação */}
          <div className="flex gap-4 mt-6 flex-wrap">
            <button
              onClick={() => setActiveTab('inicio')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'inicio'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Início
            </button>
            <button
              onClick={() => setActiveTab('recepcao')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'recepcao'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💬 Recepção
            </button>
            <button
              onClick={() => setActiveTab('especialistas')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'especialistas'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👥 Especialistas
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'config'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚙️ Configuração
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* TAB: Início */}
          {activeTab === 'inicio' && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
                  <div className="text-4xl mb-3">💬</div>
                  <h3 className="font-bold text-lg mb-2">Recepção IA</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Atendimento automático com Marta. Coleta dados e qualifica leads em tempo real.
                  </p>
                  <button
                    onClick={() => setActiveTab('recepcao')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Iniciar Chat →
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition">
                  <div className="text-4xl mb-3">👥</div>
                  <h3 className="font-bold text-lg mb-2">4 Especialistas</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    IAs especializadas em INSS, BPC, Maternidade e Acidente. Qualificam detalhes.
                  </p>
                  <button
                    onClick={() => setActiveTab('especialistas')}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Ver Especialistas →
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition">
                  <div className="text-4xl mb-3">⚙️</div>
                  <h3 className="font-bold text-lg mb-2">Configurações</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Customize roteiros, regras e especialistas sem escrever código.
                  </p>
                  <button
                    onClick={() => setActiveTab('config')}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                  >
                    Configurar →
                  </button>
                </div>
              </div>

              {/* Fluxo Visual */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Fluxo de Atendimento</h2>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-center flex-1 min-w-[150px]">
                    <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2 text-xl font-bold">1</div>
                    <p className="font-semibold">Lead Chega</p>
                    <p className="text-xs text-gray-600">Inicia conversa</p>
                  </div>
                  <div className="text-2xl text-blue-400 hidden md:block">→</div>
                  <div className="text-center flex-1 min-w-[150px]">
                    <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2 text-xl font-bold">2</div>
                    <p className="font-semibold">Marta</p>
                    <p className="text-xs text-gray-600">Coleta informações</p>
                  </div>
                  <div className="text-2xl text-blue-400 hidden md:block">→</div>
                  <div className="text-center flex-1 min-w-[150px]">
                    <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2 text-xl font-bold">3</div>
                    <p className="font-semibold">Orquestrador</p>
                    <p className="text-xs text-gray-600">Detecta benefício</p>
                  </div>
                  <div className="text-2xl text-blue-400 hidden md:block">→</div>
                  <div className="text-center flex-1 min-w-[150px]">
                    <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2 text-xl font-bold">4</div>
                    <p className="font-semibold">Especialista</p>
                    <p className="text-xs text-gray-600">Qualifica detalhes</p>
                  </div>
                  <div className="text-2xl text-blue-400 hidden md:block">→</div>
                  <div className="text-center flex-1 min-w-[150px]">
                    <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2 text-xl font-bold">5</div>
                    <p className="font-semibold">Score</p>
                    <p className="text-xs text-gray-600">0-100% viabilidade</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
                  <p className="text-3xl font-bold">17</p>
                  <p className="text-sm">Endpoints API</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
                  <p className="text-3xl font-bold">18</p>
                  <p className="text-sm">Páginas React</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
                  <p className="text-3xl font-bold">4</p>
                  <p className="text-sm">Especialistas IA</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg p-4">
                  <p className="text-3xl font-bold">100%</p>
                  <p className="text-sm">Pronto (Live)</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Recepção */}
          {activeTab === 'recepcao' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">💬 Recepção IA - Marta</h2>
              <p className="text-gray-600 mb-6">
                Atendimento automático realizado pela Marta, analista jurídica. Coleta dados iniciais e qualifica o lead.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="font-bold text-lg mb-3">✨ Características</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Segue roteiro rigoroso do cliente</li>
                    <li>✓ Coleta: nome, descrição do caso</li>
                    <li>✓ Score de qualificação 0-100%</li>
                    <li>✓ Respeitadas regras invioláveis</li>
                    <li>✓ Acolhimento em situações difíceis</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3">🎯 Perguntas Iniciais</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Qual é o seu primeiro nome?</li>
                    <li>• Como posso te ajudar?</li>
                    <li>• Há quanto tempo trabalha?</li>
                    <li>• Tinha carteira assinada?</li>
                    <li>• Pode descrever sua situação?</li>
                  </ul>
                </div>
              </div>

              <Link
                href="/ia/atendimento/recepcao"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Iniciar Chat com Marta →
              </Link>
            </div>
          )}

          {/* TAB: Especialistas */}
          {activeTab === 'especialistas' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 Especialistas de IA</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { nome: 'Ana', area: 'INSS', ico: '🏛️', desc: 'Aposentadorias e contribuições' },
                  { nome: 'Carolina', area: 'BPC/LOAS', ico: '♿', desc: 'Benefício de prestação continuada' },
                  { nome: 'Helena', area: 'Maternidade', ico: '🤰', desc: 'Salário maternidade' },
                  { nome: 'Ricardo', area: 'Acidente', ico: '⚠️', desc: 'Auxílio acidente de trabalho' },
                ].map((esp, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{esp.ico}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{esp.nome}</h3>
                        <p className="text-sm font-semibold text-blue-600">{esp.area}</p>
                        <p className="text-sm text-gray-600 mt-1">{esp.desc}</p>
                        <p className="text-xs text-gray-500 mt-2">🟢 Ativa e pronta</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Configuração */}
          {activeTab === 'config' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Configurações</h2>
              <p className="text-gray-600 mb-6">
                Customize roteiros, regras e especialistas sem escrever código.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <Link
                  href="/ia/email/configuracao"
                  className="border-2 border-blue-300 rounded-lg p-6 hover:bg-blue-50 transition cursor-pointer"
                >
                  <h3 className="font-bold text-lg mb-2">📧 Email IA</h3>
                  <p className="text-sm text-gray-600">Configure SMTP ou SendGrid para envio de emails</p>
                  <p className="text-xs text-gray-500 mt-2">✓ Teste de conexão integrado</p>
                </Link>

                <Link
                  href="/ia/sms/configuracao"
                  className="border-2 border-purple-300 rounded-lg p-6 hover:bg-purple-50 transition cursor-pointer"
                >
                  <h3 className="font-bold text-lg mb-2">📱 SMS IA</h3>
                  <p className="text-sm text-gray-600">Configure Twilio ou AWS SNS para SMS</p>
                  <p className="text-xs text-gray-500 mt-2">✓ Validação automática</p>
                </Link>

                <Link
                  href="/ia/whatsapp/configuracao"
                  className="border-2 border-green-300 rounded-lg p-6 hover:bg-green-50 transition cursor-pointer"
                >
                  <h3 className="font-bold text-lg mb-2">💬 WhatsApp</h3>
                  <p className="text-sm text-gray-600">Configure Meta Business para webhooks</p>
                  <p className="text-xs text-gray-500 mt-2">✓ Gerador de URL automático</p>
                </Link>

                <Link
                  href="/ia/atendimento/config"
                  className="border-2 border-orange-300 rounded-lg p-6 hover:bg-orange-50 transition cursor-pointer"
                >
                  <h3 className="font-bold text-lg mb-2">📋 Roteiros</h3>
                  <p className="text-sm text-gray-600">Customize roteiros e regras de conversa</p>
                  <p className="text-xs text-gray-500 mt-2">✓ Sem código necessário</p>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
