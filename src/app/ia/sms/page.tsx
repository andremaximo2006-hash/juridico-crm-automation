"use client";
import Link from "next/link";

export default function SMSIAPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">SMS IA</h1>
      <p className="text-gray-600 mb-8">Sistema de SMS automático com IA</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/ia/sms/templates" className="bg-white p-6 rounded-lg border hover:shadow-lg cursor-pointer transition">
          <div className="text-3xl mb-2">📄</div>
          <h3 className="font-semibold text-lg mb-2">Templates</h3>
          <p className="text-gray-600 text-sm">Criar e gerenciar templates SMS (160 chars)</p>
        </Link>

        <Link href="/ia/sms/campanhas" className="bg-white p-6 rounded-lg border hover:shadow-lg cursor-pointer transition">
          <div className="text-3xl mb-2">📱</div>
          <h3 className="font-semibold text-lg mb-2">Campanhas</h3>
          <p className="text-gray-600 text-sm">Disparar e acompanhar campanhas SMS</p>
        </Link>

        <Link href="/ia/sms/historico" className="bg-white p-6 rounded-lg border hover:shadow-lg cursor-pointer transition">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-lg mb-2">Histórico</h3>
          <p className="text-gray-600 text-sm">Ver mensagens enviadas</p>
        </Link>
      </div>
    </div>
  );
}
