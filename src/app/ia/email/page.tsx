"use client";
import Link from "next/link";

export default function EmailIAPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Email IA</h1>
        <p className="text-gray-600">Sistema automático de envio de emails com IA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/ia/email/templates" className="bg-white p-6 rounded-lg border hover:shadow-lg cursor-pointer transition">
          <div className="text-3xl mb-2">📝</div>
          <h3 className="font-semibold text-lg mb-2">Templates</h3>
          <p className="text-gray-600 text-sm">Crie e gerencie templates de emails</p>
        </Link>

        <Link href="/ia/email/campanhas" className="bg-white p-6 rounded-lg border hover:shadow-lg cursor-pointer transition">
          <div className="text-3xl mb-2">🚀</div>
          <h3 className="font-semibold text-lg mb-2">Campanhas</h3>
          <p className="text-gray-600 text-sm">Crie e acompanhe campanhas de email</p>
        </Link>

        <Link href="/ia/email/historico" className="bg-white p-6 rounded-lg border hover:shadow-lg cursor-pointer transition">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-lg mb-2">Histórico</h3>
          <p className="text-gray-600 text-sm">Visualize histórico de mensagens</p>
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="font-semibold text-lg mb-4">Como usar:</h2>
        <ol className="space-y-3 text-sm">
          <li>
            <strong>1. Criar Template:</strong> Acesse "Templates" e crie um novo modelo de email com placeholders dinâmicos
          </li>
          <li>
            <strong>2. Nova Campanha:</strong> Em "Campanhas", crie uma nova campanha selecionando um template e destinatários
          </li>
          <li>
            <strong>3. Enviar:</strong> Configure a campanha e clique em "Enviar" para disparar os emails
          </li>
          <li>
            <strong>4. Acompanhar:</strong> Veja em "Histórico" quais emails foram abertos e clicados
          </li>
        </ol>
      </div>
    </div>
  );
}
