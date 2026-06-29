"use client";
import { useEffect, useState } from "react";

interface SMSMensagem {
  id: string;
  paraNumero: string;
  status: string;
  createdAt: string;
  enviadoEm?: string;
}

export default function SMSHistoricoPage() {
  const [mensagens, setMensagens] = useState<SMSMensagem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sms/historico")
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Histórico SMS</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : mensagens.length === 0 ? (
        <p className="text-gray-500">Nenhuma mensagem enviada</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Telefone</th>
                <th className="border p-3 text-left">Status</th>
                <th className="border p-3 text-left">Enviado em</th>
                <th className="border p-3 text-left">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {mensagens.map(msg => (
                <tr key={msg.id} className="hover:bg-gray-50">
                  <td className="border p-3">{msg.paraNumero}</td>
                  <td className="border p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      msg.status === "enviado" ? "bg-green-100 text-green-800" : "bg-gray-100"
                    }`}>
                      {msg.status}
                    </span>
                  </td>
                  <td className="border p-3 text-sm">{msg.enviadoEm ? new Date(msg.enviadoEm).toLocaleString() : "-"}</td>
                  <td className="border p-3 text-sm">{new Date(msg.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
