"use client";
import Link from "next/link";
import { Bell, AlertCircle, CheckCircle, Info, Trash2 } from "lucide-react";

export default function NotificacoesPage() {
  const notificacoes = [
    { id: 1, tipo: "alerta", titulo: "Novo lead de alta prioridade", msg: "João Silva - INSS, score 92", hora: "2 min atrás", lido: false },
    { id: 2, tipo: "sucesso", titulo: "Conversa concluída", msg: "Maria Santos - BPC, encaminhado para atendente", hora: "15 min atrás", lido: false },
    { id: 3, tipo: "info", titulo: "Especialista offline", msg: "Ricardo ficará offline por 1 hora", hora: "1 hora atrás", lido: true },
    { id: 4, tipo: "sucesso", titulo: "Novo recorde de conversas", msg: "22 conversas processadas hoje", hora: "3 horas atrás", lido: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/ia" className="text-indigo-600 hover:text-indigo-800 mb-6 inline-block">← Voltar</Link>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🔔 Notificações</h1>
        <p className="text-gray-600 mb-8">Acompanhe eventos importantes em tempo real</p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Configurações</h2>
            <div className="flex gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Push</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">In-app</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {notificacoes.map((notif) => (
            <div key={notif.id} className={`rounded-lg p-4 border-l-4 ${notif.tipo === "alerta" ? "bg-red-50 border-red-500" : notif.tipo === "sucesso" ? "bg-green-50 border-green-500" : "bg-blue-50 border-blue-500"} ${!notif.lido ? "shadow-md" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {notif.tipo === "alerta" && <AlertCircle size={20} className="text-red-600 mt-1" />}
                  {notif.tipo === "sucesso" && <CheckCircle size={20} className="text-green-600 mt-1" />}
                  {notif.tipo === "info" && <Info size={20} className="text-blue-600 mt-1" />}
                  <div>
                    <p className="font-semibold text-gray-800">{notif.titulo}</p>
                    <p className="text-sm text-gray-600 mt-1">{notif.msg}</p>
                    <p className="text-xs text-gray-500 mt-2">{notif.hora}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
