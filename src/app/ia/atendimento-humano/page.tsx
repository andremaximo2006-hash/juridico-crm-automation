"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Search, Filter, AlertCircle, Clock, User, Phone } from "lucide-react";

interface Attendant {
  id: string;
  name: string;
  email: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Ticket {
  id: string;
  conversationId: string;
  leadId: string;
  status: string;
  priority: string;
  reason: string;
  resolutionNotes?: string;
  assignedToAttendantId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  lead?: Lead;
  assignedToAttendant?: Attendant;
  conversation?: {
    id: string;
    conversationHistory?: { role: string; content: string }[];
  };
}

export default function AtendimentoHumanoPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [attendants, setAttendants] = useState<Attendant[]>([]);

  // Buscar tickets
  useEffect(() => {
    async function fetchTickets() {
      try {
        let url = "/api/whatsapp/human-tickets";
        const params = [];
        if (statusFilter !== "all") params.push(`status=${statusFilter}`);
        if (priorityFilter !== "all") params.push(`priority=${priorityFilter}`);
        if (params.length) url += "?" + params.join("&");

        const res = await fetch(url);
        const data = await res.json();
        setTickets(data.data || []);
      } catch (error) {
        console.error("Erro ao buscar tickets:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [statusFilter, priorityFilter]);

  // Buscar atendentes (simulado)
  useEffect(() => {
    setAttendants([
      { id: "user-1", name: "Ana Silva", email: "ana@juridico.com" },
      { id: "user-2", name: "Bruno Costa", email: "bruno@juridico.com" },
      { id: "user-3", name: "Carla Santos", email: "carla@juridico.com" },
    ]);
  }, []);

  const filteredTickets = tickets.filter((ticket) =>
    ticket.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.lead?.phone?.includes(searchTerm)
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-900/30 text-red-400";
      case "normal":
        return "bg-yellow-900/30 text-yellow-400";
      case "low":
        return "bg-blue-900/30 text-blue-400";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "normal":
        return "Normal";
      case "low":
        return "Baixa";
      default:
        return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-900/30 text-orange-400";
      case "assigned":
        return "bg-blue-900/30 text-blue-400";
      case "in_progress":
        return "bg-purple-900/30 text-purple-400";
      case "resolved":
        return "bg-green-900/30 text-green-400";
      case "cancelled":
        return "bg-slate-700 text-slate-300";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "assigned":
        return "Atribuído";
      case "in_progress":
        return "Em Progresso";
      case "resolved":
        return "Resolvido";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const handleAssignTicket = async (
    ticketId: string,
    attendantId: string
  ) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/whatsapp/human-tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedToAttendantId: attendantId,
          status: "assigned",
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets(
          tickets.map((t) => (t.id === ticketId ? updated.data : t))
        );
        setSelectedTicket(updated.data);
        alert("✓ Ticket atribuído com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao atribuir:", error);
      alert("✗ Erro ao atribuir ticket");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/whatsapp/human-tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets(
          tickets.map((t) => (t.id === ticketId ? updated.data : t))
        );
        setSelectedTicket(updated.data);
        alert("✓ Status atualizado!");
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("✗ Erro ao atualizar status");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
        <Header title="Atendimento Humano" subtitle="Carregando..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-400">Carregando fila...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Header
        title="Atendimento Humano"
        subtitle={`${filteredTickets.length} tickets na fila`}
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

            {/* Filtros */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendentes</option>
                  <option value="assigned">Atribuídos</option>
                  <option value="in_progress">Em Progresso</option>
                  <option value="resolved">Resolvidos</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">
                  Prioridade
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Todas</option>
                  <option value="high">Alta</option>
                  <option value="normal">Normal</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fila de Tickets */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-700 overflow-hidden h-[600px] flex flex-col">
                <div className="px-6 py-4 border-b border-slate-700">
                  <h2 className="text-lg font-bold text-white">Fila</h2>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-700">
                  {filteredTickets.length === 0 ? (
                    <div className="px-6 py-8 text-center text-slate-400">
                      Nenhum ticket encontrado
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full text-left px-6 py-4 transition-colors ${
                          selectedTicket?.id === ticket.id
                            ? "bg-blue-600/20 border-l-4 border-blue-600"
                            : "hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm truncate">
                              {ticket.lead?.name || "Anônimo"}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 truncate">
                              {ticket.lead?.phone}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {ticket.reason}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 py-1 rounded text-xs whitespace-nowrap ${getPriorityColor(
                                ticket.priority
                              )}`}
                            >
                              {getPriorityLabel(ticket.priority)}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs whitespace-nowrap ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {getStatusLabel(ticket.status)}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Detalhes do Ticket */}
            {selectedTicket && (
              <div className="lg:col-span-2">
                <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-700 overflow-hidden h-[600px] flex flex-col">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-slate-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {selectedTicket.lead?.name}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {selectedTicket.reason}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded text-sm ${getPriorityColor(
                            selectedTicket.priority
                          )}`}
                        >
                          {getPriorityLabel(selectedTicket.priority)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded text-sm ${getStatusColor(
                            selectedTicket.status
                          )}`}
                        >
                          {getStatusLabel(selectedTicket.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Info do Lead */}
                    <div className="bg-slate-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-white mb-3">
                        Informações do Lead
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <User className="w-4 h-4" />
                          {selectedTicket.lead?.name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Phone className="w-4 h-4" />
                          {selectedTicket.lead?.phone}
                        </div>
                        {selectedTicket.lead?.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <span className="text-slate-400">📧</span>
                            {selectedTicket.lead.email}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-slate-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-white mb-3">
                        Timeline
                      </p>
                      <div className="space-y-2 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            Criado:{" "}
                            {new Date(selectedTicket.createdAt).toLocaleString(
                              "pt-BR"
                            )}
                          </span>
                        </div>
                        {selectedTicket.assignedToAttendant && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>
                              Atribuído a:{" "}
                              {selectedTicket.assignedToAttendant.name}
                            </span>
                          </div>
                        )}
                        {selectedTicket.resolvedAt && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              Resolvido:{" "}
                              {new Date(selectedTicket.resolvedAt).toLocaleString(
                                "pt-BR"
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Atribuição */}
                    {!selectedTicket.assignedToAttendant &&
                      selectedTicket.status === "pending" && (
                        <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
                          <p className="text-sm font-semibold text-orange-300 mb-3">
                            Atribuir a Um Atendente
                          </p>
                          <select
                            defaultValue=""
                            onChange={(e) =>
                              handleAssignTicket(
                                selectedTicket.id,
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Selecionar atendente...</option>
                            {attendants.map((att) => (
                              <option key={att.id} value={att.id}>
                                {att.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                  </div>

                  {/* Ações */}
                  <div className="px-6 py-4 border-t border-slate-700 bg-slate-900 space-y-2">
                    <div className="flex gap-2">
                      {selectedTicket.status === "assigned" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              selectedTicket.id,
                              "in_progress"
                            )
                          }
                          disabled={isSaving}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-600 transition-colors text-sm"
                        >
                          {isSaving ? "..." : "Iniciar Atendimento"}
                        </button>
                      )}
                      {selectedTicket.status === "in_progress" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(selectedTicket.id, "resolved")
                          }
                          disabled={isSaving}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-600 transition-colors text-sm"
                        >
                          {isSaving ? "..." : "Marcar como Resolvido"}
                        </button>
                      )}
                      {selectedTicket.status === "pending" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(selectedTicket.id, "cancelled")
                          }
                          disabled={isSaving}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-600 transition-colors text-sm"
                        >
                          {isSaving ? "..." : "Cancelar"}
                        </button>
                      )}
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
