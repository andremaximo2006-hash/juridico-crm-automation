"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface EmailCampanha {
  id: string;
  nome: string;
  status: string;
  totalDestina: number;
  enviados: number;
  abertos: number;
  clicados: number;
  createdAt: string;
  template?: { nome: string };
}

export default function CampanhasPage() {
  const [campanhas, setCampanhas] = useState<EmailCampanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    const url = filterStatus
      ? `/api/email/campanhas?status=${filterStatus}`
      : "/api/email/campanhas";

    fetch(url)
      .then(r => r.json())
      .then(data => {
        setCampanhas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "enviado":
        return "bg-green-100 text-green-800";
      case "enviando":
        return "bg-yellow-100 text-yellow-800";
      case "agendado":
        return "bg-blue-100 text-blue-800";
      case "rascunho":
        return "bg-gray-100 text-gray-800";
      case "falha":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Campanhas de Email</h1>
        <Link href="/ia/email/nova-campanha" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          + Nova Campanha
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilterStatus("")}
          className={`px-4 py-2 rounded ${!filterStatus ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Todas
        </button>
        {["rascunho", "agendado", "enviando", "enviado", "falha"].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded ${
              filterStatus === status ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : campanhas.length === 0 ? (
        <p className="text-gray-500">Nenhuma campanha criada ainda</p>
      ) : (
        <div className="grid gap-4">
          {campanhas.map(campanha => (
            <div key={campanha.id} className="border rounded-lg p-4 bg-white hover:shadow-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Link href={`/ia/email/campanhas/${campanha.id}`}>
                    <h3 className="font-semibold text-lg hover:text-blue-600">{campanha.nome}</h3>
                  </Link>
                  <p className="text-sm text-gray-600">Template: {campanha.template?.nome}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(campanha.status)}`}>
                  {campanha.status}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Destinatários</p>
                  <p className="font-semibold">{campanha.totalDestina}</p>
                </div>
                <div>
                  <p className="text-gray-600">Enviados</p>
                  <p className="font-semibold text-green-600">{campanha.enviados}</p>
                </div>
                <div>
                  <p className="text-gray-600">Abertos</p>
                  <p className="font-semibold text-blue-600">{campanha.abertos}</p>
                </div>
                <div>
                  <p className="text-gray-600">Clicados</p>
                  <p className="font-semibold text-purple-600">{campanha.clicados}</p>
                </div>
                <div>
                  <p className="text-gray-600">Taxa Abertura</p>
                  <p className="font-semibold">
                    {campanha.enviados > 0
                      ? Math.round((campanha.abertos / campanha.enviados) * 100)
                      : 0}
                    %
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-3">{new Date(campanha.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
