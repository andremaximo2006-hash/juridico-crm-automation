"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export default function ConversarPage() {
  const params = useParams();
  const roteiroId = params.id as string;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [convId] = useState(`conv_${Date.now()}`);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const msgEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/whatsapp/iniciar-roteiro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: convId, roteiroId })
    })
      .then(r => r.json())
      .then(d => setMsgs([{ role: "assistant", content: d.pergunta }]))
      .catch(console.error);
  }, []);

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMsgs(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/whatsapp/responder-pergunta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: convId, resposta: input })
    }).then(r => r.json());

    if (res.status === "continua") {
      setMsgs(prev => [...prev, { role: "assistant", content: res.pergunta }]);
    } else {
      setResultado(res);
      setMsgs(prev => [...prev, {
        role: "assistant",
        content: `Score: ${res.score}/100\nViabilidade: ${res.viabilidade}\n${res.mensagem}`
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">Chat de Teste</h1>

      <div className="flex-1 overflow-y-auto bg-gray-100 p-4 rounded-lg space-y-4 mb-4">
        {msgs.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border"}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={msgEnd} />
      </div>

      {resultado && (
        <div className="bg-green-100 border border-green-300 p-4 rounded-lg mb-4">
          <p className="font-semibold">✅ Qualificação Concluída</p>
          <p className="text-sm mt-2">Score: {resultado.score}</p>
          <p className="text-sm">Status: {resultado.viabilidade}</p>
        </div>
      )}

      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === "Enter" && handleSend()} placeholder="Sua resposta..." className="flex-1 px-4 py-2 border rounded-lg" disabled={loading || resultado} />
        <button onClick={handleSend} disabled={loading || !input || resultado} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          Enviar
        </button>
      </div>
    </div>
  );
}
