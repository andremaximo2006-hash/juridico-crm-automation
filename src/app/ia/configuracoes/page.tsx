"use client";
import Link from "next/link";
import { Settings, Bell, Lock, Palette, Database, FileText } from "lucide-react";
import { useState } from "react";

export default function ConfiguracoesPage() {
  const [tema, setTema] = useState("dark");
  const [notificacoes, setNotificacoes] = useState(true);
  const [backupAuto, setBackupAuto] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/ia/hub" className="text-slate-600 hover:text-slate-800 mb-6 inline-block">← Voltar</Link>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-8">⚙️ Configurações</h1>

        <div className="space-y-6">
          {/* Tema */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette size={24} className="text-purple-600" />
              <h2 className="text-lg font-bold text-gray-800">Tema Visual</h2>
            </div>
            <div className="flex gap-4">
              {["light", "dark", "auto"].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tema" value={t} checked={tema === t} onChange={(e) => setTema(e.target.value)} />
                  <span className="text-gray-700 capitalize font-medium">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notificações */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bell size={24} className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">Notificações</h2>
              </div>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={notificacoes} onChange={(e) => setNotificacoes(e.target.checked)} className="mr-2" />
                <span className="text-sm font-medium">{notificacoes ? "Ativadas" : "Desativadas"}</span>
              </label>
            </div>
            <div className="space-y-3 pl-9">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked /> Email
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked /> Push
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked /> In-app
              </label>
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock size={24} className="text-red-600" />
              <h2 className="text-lg font-bold text-gray-800">Segurança</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-left">
                Alterar Senha
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-left">
                Autenticação em Duas Etapas (2FA)
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-left">
                Sessões Ativas
              </button>
            </div>
          </div>

          {/* Backup */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Database size={24} className="text-green-600" />
                <h2 className="text-lg font-bold text-gray-800">Backup e Dados</h2>
              </div>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={backupAuto} onChange={(e) => setBackupAuto(e.target.checked)} className="mr-2" />
                <span className="text-sm font-medium">{backupAuto ? "Automático" : "Manual"}</span>
              </label>
            </div>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-green-100 hover:bg-green-200 rounded-lg font-medium text-green-800">
                Fazer Backup Agora
              </button>
              <p className="text-xs text-gray-500">Último backup: 2026-06-30 às 18:15</p>
            </div>
          </div>

          {/* Integrações */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={24} className="text-orange-600" />
              <h2 className="text-lg font-bold text-gray-800">Integrações</h2>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                <span className="font-medium text-gray-800">Meta Business (WhatsApp)</span>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded font-bold">✓ Ativo</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                <span className="font-medium text-gray-800">Claude API (IA)</span>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded font-bold">✓ Ativo</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                <span className="font-medium text-gray-800">PostgreSQL (Banco)</span>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded font-bold">✓ Ativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
