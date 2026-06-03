"use client";

import { Header } from "@/components/layout/Header";
import { useEffect, useState } from "react";
import { Send, Bot, User, Plus, Phone, MessageCircle } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  legalArea?: string;
  funnelStage: string;
  caseSummary?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  leadId?: string;
  createdAt: string;
}

const AREA_LABELS: Record<string, string> = {
  familia: "Familial",
  trabalhista: "Trabalhista",
  civil: "Civil",
  criminal: "Criminal",
  consumidor: "Consumidor",
  inventario: "Inventário",
  previdenciario: "Previdenciário",
  other: "Outro",
};

const AREA_COLORS: Record<string, string> = {
  familia: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200",
  trabalhista: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  civil: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  criminal: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  consumidor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  inventario: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  previdenciario: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200",
  other: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

export default function IAAtendimentoPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads?limit=100");
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
    }
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedLead || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      leadId: selectedLead.id,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ia/atendimento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLead.id,
          message: input,
          legalArea: selectedLead.legalArea,
          conversationHistory: messages,
        }),
      });

      if (!res.ok) throw new Error("Erro ao consultar IA");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Sem resposta");

      let fullText = "";
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        leadId: selectedLead.id,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        fullText += text;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id ? { ...msg, content: fullText } : msg
          )
        );
      }
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `❌ Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        leadId: selectedLead.id,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const leadsByArea = Object.entries(
    leads.reduce(
      (acc, lead) => {
        const area = lead.legalArea || "other";
        if (!acc[area]) acc[area] = [];
        acc[area].push(lead);
        return acc;
      },
      {} as Record<string, Lead[]>
    )
  );

  return (
    <div className="flex h-full flex-col">
      <Header
        title="IA Atendimento"
        subtitle="Assistente especializado por área jurídica"
      />

      <div className="flex flex-1 gap-4 overflow-hidden bg-slate-50 p-4 dark:bg-slate-800">
        {/* Leads sidebar */}
        <div className="w-72 bg-white rounded-lg border border-slate-200 overflow-y-auto dark:border-slate-700 dark:bg-slate-900">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 dark:bg-slate-900 dark:border-slate-700">
            <h3 className="font-semibold">Leads para Atender</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {leads.length} leads
            </p>
          </div>

          <div className="space-y-2 p-4">
            {leadsByArea.map(([area, areaLeads]) => (
              <div key={area}>
                <div
                  className={`text-xs font-semibold p-2 rounded ${
                    AREA_COLORS[area] || AREA_COLORS.other
                  }`}
                >
                  {AREA_LABELS[area] || "Outro"} ({areaLeads.length})
                </div>
                <div className="space-y-1 ml-2">
                  {areaLeads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => handleSelectLead(lead)}
                      className={`w-full text-left p-2 rounded text-sm transition ${
                        selectedLead?.id === lead.id
                          ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                          : "hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <p className="font-medium truncate">{lead.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {lead.phone}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900">
          {selectedLead ? (
            <>
              {/* Lead info header */}
              <div className="border-b border-slate-200 p-4 dark:border-slate-700">
                <h3 className="font-semibold">{selectedLead.name}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                  <div className="flex items-center gap-1">
                    <Phone size={14} />
                    {selectedLead.phone}
                  </div>
                  {selectedLead.legalArea && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        AREA_COLORS[selectedLead.legalArea] ||
                        AREA_COLORS.other
                      }`}
                    >
                      {AREA_LABELS[selectedLead.legalArea] || "Outro"}
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <Bot className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600 dark:text-slate-400">
                        Inicie uma conversa com o assistente
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="border-t border-slate-200 p-4 dark:border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && !loading && handleSend()
                    }
                    placeholder="Digiteuma pergunta..."
                    disabled={loading}
                    className="flex-1 rounded border border-slate-300 px-3 py-2 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Bot className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  Selecione um lead para começar o atendimento
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
