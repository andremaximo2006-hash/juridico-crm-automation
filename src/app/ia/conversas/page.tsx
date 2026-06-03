"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Search, Filter, MessageCircle, Clock } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  lead_id: string;
  platform: string;
  legal_area: string;
  status: string;
  conversation_history?: Message[];
  created_at: string;
  updated_at: string;
  lead?: {
    name: string;
    phone: string;
    email?: string;
  };
}

export default function ConversasPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchConversations() {
      try {
        let url = "/api/webhooks/whatsapp/conversations";
        if (statusFilter !== "all") {
          url += `?status=${statusFilter}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setConversations(data.data || []);
      } catch (error) {
        console.error("Erro ao buscar conversas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [statusFilter]);

  const filteredConversations = conversations.filter((conv) =>
    conv.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lead?.phone?.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-900/30 text-green-400";
      case "transferred":
        return "bg-yellow-900/30 text-yellow-400";
      case "completed":
        return "bg-blue-900/30 text-blue-400";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativa";
      case "transferred":
        return "Transferida";
      case "completed":
        return "Concluída";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
        <Header title="Conversas IA" subtitle="Carregando..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-400">Carregando conversas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Header
        title="Conversas de IA"
        subtitle={`${filteredConversations.length} conversas`}
      />

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Filtros e Busca */}
          <div className="mb-6 space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  statusFilter === "active"
                    ? "bg-green-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                Ativas
              </button>
              <button
                onClick={() => setStatusFilter("transferred")}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  statusFilter === "transferred"
                    ? "bg-yellow-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                Transferidas
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  statusFilter === "completed"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                Concluídas
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Conversas */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-700 overflow-hidden h-[600px] flex flex-col">
                <div className="px-6 py-4 border-b border-slate-700">
                  <h2 className="text-lg font-bold text-white">Conversas</h2>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-700">
                  {filteredConversations.length === 0 ? (
                    <div className="px-6 py-8 text-center text-slate-400">
                      Nenhuma conversa encontrada
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full text-left px-6 py-4 transition-colors ${
                          selectedConversation?.id === conv.id
                            ? "bg-blue-600/20 border-l-4 border-blue-600"
                            : "hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm truncate">
                              {conv.lead?.name || "Anônimo"}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 truncate">
                              {conv.lead?.phone}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {conv.legal_area} • {conv.platform}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${getStatusColor(conv.status)}`}>
                            {getStatusLabel(conv.status)}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Chat */}
            {selectedConversation && (
              <div className="lg:col-span-2">
                <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-700 overflow-hidden h-[600px] flex flex-col">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {selectedConversation.lead?.name}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {selectedConversation.lead?.phone} •{" "}
                          {selectedConversation.legal_area}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm ${getStatusColor(selectedConversation.status)}`}>
                        {getStatusLabel(selectedConversation.status)}
                      </span>
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950">
                    {selectedConversation.conversation_history && selectedConversation.conversation_history.length > 0 ? (
                      selectedConversation.conversation_history.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-3 rounded-lg ${
                              msg.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-800 text-slate-200"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        Nenhuma mensagem
                      </div>
                    )}
                  </div>

                  {/* Info Footer */}
                  <div className="px-6 py-4 border-t border-slate-700 bg-slate-900 text-xs text-slate-400 space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        Criada:{" "}
                        {new Date(selectedConversation.created_at).toLocaleString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>
                        Mensagens:{" "}
                        {selectedConversation.conversation_history?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
