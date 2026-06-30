'use client';

import Link from 'next/link';

export default function AtendimentoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/ia" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
          ← Voltar ao Dashboard IA
        </Link>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">🤖 Sistema Multi-Agente de Atendimento</h1>
        <p className="text-gray-600 mb-8">Recepção automática + Qualificação inteligente de leads</p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Recepção */}
          <Link href="/ia/atendimento/recepcao" className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-bold text-lg mb-2">Recepção IA</h3>
            <p className="text-gray-600 text-sm">Atendimento com Marta, coleta dados iniciais</p>
          </Link>

          {/* Especialistas */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-bold text-lg mb-2">4 Especialistas</h3>
            <p className="text-gray-600 text-sm mb-4">Ana, Carolina, Helena, Ricardo</p>
            <p className="text-xs text-gray-500">🟢 Todas ativas</p>
          </div>

          {/* Config */}
          <Link href="/ia/atendimento/config" className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500 hover:shadow-xl transition">
            <div className="text-4xl mb-3">⚙️</div>
            <h3 className="font-bold text-lg mb-2">Configurações</h3>
            <p className="text-gray-600 text-sm">Customize roteiros e especialistas</p>
          </Link>
        </div>

        {/* Fluxo */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Fluxo de Atendimento</h2>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 font-bold">1</div>
              <p className="font-semibold text-sm">Lead Chega</p>
            </div>
            <div className="text-2xl text-blue-400">→</div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 font-bold">2</div>
              <p className="font-semibold text-sm">Marta Coleta</p>
            </div>
            <div className="text-2xl text-blue-400">→</div>
            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 font-bold">3</div>
              <p className="font-semibold text-sm">Orquestrador</p>
            </div>
            <div className="text-2xl text-blue-400">→</div>
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 font-bold">4</div>
              <p className="font-semibold text-sm">Especialista</p>
            </div>
            <div className="text-2xl text-blue-400">→</div>
            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 font-bold">5</div>
              <p className="font-semibold text-sm">Score</p>
            </div>
          </div>
        </div>

        {/* Links adicionais */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4">⚙️ Configurar Integrações</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/ia/email/configuracao" className="text-blue-600 hover:text-blue-800 font-semibold">
              📧 Email IA
            </Link>
            <Link href="/ia/sms/configuracao" className="text-blue-600 hover:text-blue-800 font-semibold">
              📱 SMS IA
            </Link>
            <Link href="/ia/whatsapp/configuracao" className="text-blue-600 hover:text-blue-800 font-semibold">
              💬 WhatsApp
            </Link>
            <Link href="/ia/atendimento/config" className="text-blue-600 hover:text-blue-800 font-semibold">
              📋 Roteiros
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
