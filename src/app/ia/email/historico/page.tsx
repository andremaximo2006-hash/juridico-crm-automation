"use client";
import { useEffect, useState, useRef } from "react";

interface EmailMessage {
  id: string;
  paraEmail: string;
  paraNome?: string;
  status: string;
  abertoEm?: string;
  clicadoEm?: string;
  createdAt: string;
  enviadoEm?: string;
}

export default function HistoricoPage() {
  const [mensagens, setMensagens] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/email/historico")
      .then(r => r.json())
      .then(data => {
        setMensagens(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: string, abertoEm?: string, clicadoEm?: string) => {
    if (clicadoEm) return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Clicado</span>;
    if (abertoEm) return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Aberto</span>;
    if (status === "enviado") return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Enviado</span>;
    if (status === "enviando") return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Enviando</span>;
    if (status === "falha") return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Falha</span>;
    return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{status}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Histórico de Emails</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : mensagens.length === 0 ? (
        <p className="text-gray-500">Nenhuma mensagem enviada ainda</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Email</th>
                <th className="border p-3 text-left">Status</th>
                <th className="border p-3 text-left">Enviado em</th>
                <th className="border p-3 text-left">Aberto em</th>
                <th className="border p-3 text-left">Clicado em</th>
              </tr>
            </thead>
            <tbody>
              {mensagens.map(msg => (
                <tr key={msg.id} className="hover:bg-gray-50">
                  <td className="border p-3">
                    <div>
                      <p className="font-semibold">{msg.paraEmail}</p>
                      {msg.paraNome && <p className="text-sm text-gray-600">{msg.paraNome}</p>}
                    </div>
                  </td>
                  <td className="border p-3">{getStatusBadge(msg.status, msg.abertoEm, msg.clicadoEm)}</td>
                  <td className="border p-3 text-sm">
                    {msg.enviadoEm ? new Date(msg.enviadoEm).toLocaleString() : "-"}
                  </td>
                  <td className="border p-3 text-sm">
                    {msg.abertoEm ? new Date(msg.abertoEm).toLocaleString() : "-"}
                  </td>
                  <td className="border p-3 text-sm">
                    {msg.clicadoEm ? new Date(msg.clicadoEm).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
