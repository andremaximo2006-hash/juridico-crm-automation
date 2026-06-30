'use client';

import Link from 'next/link';

export default function AtendimentoIA() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/ia" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Voltar ao Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">🤖 Sistema Multi-Agente de Atendimento</h1>
          <p className="text-gray-600 text-lg">
            IA especializada em qualificação de leads para benefícios jurídicos
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
            <div className="text-3xl mb-2">📞</div>
            <h3 className="font-bold text-lg mb-1">Recepção IA</h3>
            <p className="text-gray-600 text-sm mb-4">Atendimento inicial com Marta</p>
            <Link
              href="/ia/atendimento/recepcao"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Iniciar Chat →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500">
            <div className="text-3xl mb-2">🧠</div>
            <h3 className="font-bold text-lg mb-1">Orquestrador</h3>
            <p className="text-gray-600 text-sm mb-4">Roteia para especialista correto</p>
            <button
              disabled
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded opacity-50"
            >
              Em Breve →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
            <div className="text-3xl mb-2">⚙️</div>
            <h3 className="font-bold text-lg mb-1">Configurações</h3>
            <p className="text-gray-600 text-sm mb-4">Customize roteiros e especialistas</p>
            <Link
              href="/ia/atendimento/config"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Configurar →
            </Link>
          </div>
        </div>

        {/* Especialistas */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 Especialistas de IA Disponíveis</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { nome: 'Ana', area: 'INSS', ico: '🏛️', desc: 'Aposentadorias e contribuições' },
              { nome: 'Carolina', area: 'BPC/LOAS', ico: '♿', desc: 'Benefício de prestação continuada' },
              { nome: 'Helena', area: 'Maternidade', ico: '🤰', desc: 'Salário maternidade e gestantes' },
              { nome: 'Ricardo', area: 'Acidente', ico: '⚠️', desc: 'Auxílio acidente de trabalho' },
            ].map((esp, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{esp.ico}</div>
                  <div>
                    <h3 className="font-bold text-lg">{esp.nome}</h3>
                    <p className="text-sm font-semibold text-blue-600">{esp.area}</p>
                    <p className="text-sm text-gray-600 mt-1">{esp.desc}</p>
                    <button disabled className="mt-2 text-blue-600 text-sm opacity-50">
                      Em desenvolvimento →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fluxo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Fluxo de Atendimento</h2>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-center flex-1 min-w-200">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 text-lg">1</div>
              <p className="font-semibold">Recepção</p>
              <p className="text-sm text-gray-600">Marta coleta info</p>
            </div>
            <div className="text-2xl text-blue-400">→</div>
            <div className="text-center flex-1 min-w-200">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 text-lg">2</div>
              <p className="font-semibold">Orquestração</p>
              <p className="text-sm text-gray-600">Detecta benefício</p>
            </div>
            <div className="text-2xl text-blue-400">→</div>
            <div className="text-center flex-1 min-w-200">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 text-lg">3</div>
              <p className="font-semibold">Especialista</p>
              <p className="text-sm text-gray-600">Qualifica detalhes</p>
            </div>
            <div className="text-2xl text-blue-400">→</div>
            <div className="text-center flex-1 min-w-200">
              <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 text-lg">4</div>
              <p className="font-semibold">Score</p>
              <p className="text-sm text-gray-600">Viabilidade 0-100</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-12 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <p className="text-sm text-gray-700 font-semibold mb-2">ℹ️ Sobre este Sistema:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ IA de Recepção segue roteiro rigoroso do cliente</li>
            <li>✓ Orquestrador detecta tipo de benefício e roteia para especialista</li>
            <li>✓ Cada especialista tem prompts otimizados para sua área</li>
            <li>✓ Score de viabilidade calculado em tempo real</li>
            <li>✓ Histórico completo de conversas para análise posterior</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
