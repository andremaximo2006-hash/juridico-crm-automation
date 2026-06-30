'use client';
import Link from 'next/link';

export default function WhatsAppIAPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">WhatsApp IA</h1>
        <p className="text-gray-600">Sistema de qualificação de leads via WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          href="/ia/whatsapp/meta-setup"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg hover:shadow-lg cursor-pointer transition"
        >
          <div className="text-3xl mb-2">📱</div>
          <h3 className="font-semibold text-lg mb-2">Meta Setup</h3>
          <p className="text-green-100 text-sm">Configurar conta Meta Business</p>
        </Link>

        <Link
          href="/ia/whatsapp/monitor"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:shadow-lg cursor-pointer transition"
        >
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-lg mb-2">Monitor</h3>
          <p className="text-purple-100 text-sm">Acompanhe webhooks em tempo real</p>
        </Link>

        <Link
          href="/ia/whatsapp/roteiros"
          className="bg-white p-6 rounded-lg border hover:shadow-lg cursor-pointer transition"
        >
          <div className="text-3xl mb-2">📋</div>
          <h3 className="font-semibold text-lg mb-2">Roteiros</h3>
          <p className="text-gray-600 text-sm">Crie roteiros de qualificação</p>
        </Link>

        <Link href="/ia/whatsapp/fila" className="bg-white p-6 rounded-lg border hover:shadow-lg cursor-pointer transition">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="font-semibold text-lg mb-2">Fila</h3>
          <p className="text-gray-600 text-sm">Leads qualificados e scoring</p>
        </Link>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="font-semibold text-lg mb-4">Como usar:</h2>
        <ol className="space-y-3 text-sm">
          <li>
            <strong>1. Configurar Webhook:</strong> Acesse "Configuração" e insira credenciais
            Meta Business
          </li>
          <li>
            <strong>2. Criar Roteiro:</strong> Em "Roteiros", crie um novo roteiro com perguntas
            dinâmicas
          </li>
          <li>
            <strong>3. Testar:</strong> Use "Testar Chat" para validar o roteiro
          </li>
          <li>
            <strong>4. Acompanhar:</strong> Veja em "Fila" todos os leads com score automático
          </li>
        </ol>
      </div>
    </div>
  );
}
