"use client";
import Link from "next/link";
import { BarChart3, FileText, Bell, Sliders, TrendingUp, Settings, Users, MessageSquare, Zap } from "lucide-react";

export default function HubPage() {
  const modulos = [
    { titulo: "📊 Dashboard", descricao: "Análise de conversas e especialistas", icon: "📊", href: "/ia/dashboard", novo: true },
    { titulo: "📋 Relatórios", descricao: "Gerar relatórios em PDF/Excel", icon: "📋", href: "/ia/relatorios", novo: true },
    { titulo: "📈 Analytics", descricao: "Gráficos e tendências avançados", icon: "📈", href: "/ia/analytics", novo: true },
    { titulo: "🔔 Notificações", descricao: "Eventos em tempo real", icon: "🔔", href: "/ia/notificacoes", novo: true },
    { titulo: "🔍 Filtros", descricao: "Busque conversas com precisão", icon: "🔍", href: "/ia/filtros", novo: true },
    { titulo: "🔎 Busca Global", descricao: "Encontre tudo no sistema", icon: "🔎", href: "/ia/busca", novo: true },
    { titulo: "⚙️ Configurações", descricao: "Personalize o sistema", icon: "⚙️", href: "/ia/configuracoes", novo: true },
    { titulo: "👥 Equipe", descricao: "Gerencie especialistas e atendentes", icon: "👥", href: "/ia/equipe", novo: true },
    { titulo: "⚡ Automações", descricao: "Configure regras automáticas", icon: "⚡", href: "/ia/automacoes", novo: true },
    { titulo: "💬 Atendimento", descricao: "Recepção IA com Marta", icon: "💬", href: "/ia/atendimento", novo: false },
    { titulo: "📱 WhatsApp", descricao: "Integração Meta Business", icon: "📱", href: "/ia/whatsapp", novo: false },
    { titulo: "📧 Email", descricao: "Campanhas de email IA", icon: "📧", href: "/ia/email", novo: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">🚀 IA Hub</h1>
          <p className="text-gray-300 text-lg">Centro de controle - Fase 5+</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {modulos.map((mod, idx) => (
            <Link key={idx} href={mod.href} className="group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-700 hover:border-blue-500 h-full">
                <div className="text-4xl mb-3">{mod.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{mod.titulo}</h3>
                <p className="text-gray-400 text-sm mb-4">{mod.descricao}</p>
                {mod.novo && <span className="inline-block px-2 py-1 bg-green-600 text-white text-xs rounded font-bold">NOVO</span>}
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur rounded-lg p-6 border border-white/10">
            <p className="text-gray-400 text-sm mb-1">Conversas Totais</p>
            <p className="text-3xl font-bold text-blue-400">127</p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-lg p-6 border border-white/10">
            <p className="text-gray-400 text-sm mb-1">Especialistas</p>
            <p className="text-3xl font-bold text-purple-400">4</p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-lg p-6 border border-white/10">
            <p className="text-gray-400 text-sm mb-1">Score Médio</p>
            <p className="text-3xl font-bold text-green-400">73.5%</p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-lg p-6 border border-white/10">
            <p className="text-gray-400 text-sm mb-1">Taxa Conversão</p>
            <p className="text-3xl font-bold text-yellow-400">34.2%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
